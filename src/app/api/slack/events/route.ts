import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { PostHog } from "posthog-node";

const posthogClient = process.env.NEXT_PUBLIC_POSTHOG_KEY 
  ? new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, { host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com' })
  : null;

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch (e) {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  // 1. Handle URL Verification
  if (body.type === "url_verification") {
    return NextResponse.json({ challenge: body.challenge });
  }

  // 2. Verify Slack Signature
  const slackSignature = request.headers.get("x-slack-signature");
  const slackTimestamp = request.headers.get("x-slack-request-timestamp");
  const signingSecret = process.env.SLACK_SIGNING_SECRET;

  if (signingSecret) {
    if (!slackSignature || !slackTimestamp) {
      return new NextResponse("Missing signature headers", { status: 401 });
    }

    const timestamp = parseInt(slackTimestamp, 10);
    const now = Math.floor(Date.now() / 1000);

    // Reject requests older than 5 minutes (300 seconds)
    if (Math.abs(now - timestamp) > 300) {
      return new NextResponse("Request too old", { status: 400 });
    }

    const sigBasestring = `v0:${slackTimestamp}:${rawBody}`;
    const mySignature = "v0=" + crypto
      .createHmac("sha256", signingSecret)
      .update(sigBasestring, "utf8")
      .digest("hex");

    try {
      const mySigBuffer = Buffer.from(mySignature, "utf8");
      const slackSigBuffer = Buffer.from(slackSignature, "utf8");

      if (mySigBuffer.length !== slackSigBuffer.length) {
        return new NextResponse("Invalid signature length", { status: 401 });
      }

      if (!crypto.timingSafeEqual(mySigBuffer, slackSigBuffer)) {
        return new NextResponse("Invalid signature", { status: 401 });
      }
    } catch (err) {
      return new NextResponse("Error verifying signature", { status: 500 });
    }
  } else if (process.env.NODE_ENV === "production") {
    console.warn("SLACK_SIGNING_SECRET is missing. Proceeding without validation.");
  }

  // 3. Process the Event
  // Slack events are wrapped in an `event` object
  if (body.type === "event_callback" && body.event) {
    const event = body.event;

    // Check if it's a reaction_added and the emoji is "wod"
    if (event.type === "reaction_added" && event.reaction === "wod") {
      const channelId = event.item.channel;
      const raterId = event.user; // User who added the reaction

      // To properly tag people in Slack, you must use their Slack Member ID (e.g., U12345678)
      // You can find this by clicking their profile in Slack -> More -> "Copy member ID"
      let candidates = [
        { name: "Chris McNeill", id: "U08M4JE1U3T" },
        { name: "Seb", id: "U0755L67BGF" },
        { name: "Tomas", id: "U09FJ7VUL5V" },
        { name: "Alex", id: "U08KA3CAVHR" },
        { name: "Seanosh", id: "U0895H8GMPZ" }
      ];

      try {
        if (posthogClient) {
          const isEnabled = await posthogClient.isFeatureEnabled("wheel_tsnb_team", "slack-bot-uuid");
          if (isEnabled) {
            const payload = await posthogClient.getFeatureFlagPayload("wheel_tsnb_team", "slack-bot-uuid");
            if (payload && Array.isArray(payload) && payload.length > 0) {
              candidates = payload;
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch posthog team payload:", err);
      }

      const winnerIndex = Math.floor(Math.random() * candidates.length);
      const winner = candidates[winnerIndex];

      const formatUser = (user: { name: string, id: string }) =>
        user.id.startsWith("U_REPLACE") ? user.name : `<@${user.id}>`;

      const namesDisplay = candidates.map(formatUser).join(", ");
      const winnerDisplay = formatUser(winner);

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://reinvented-won.vercel.app";

      const messageContent = {
        channel: channelId,
        thread_ts: event.item?.ts, // Posts as a reply to the reacted message, preserving context
        unfurl_links: false, // Removes the large URL preview card for the vercel link
        unfurl_media: false,
        text: `<@${raterId}> spun the wheel!`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `🎡 *<@${raterId}>* spun the wheel via reaction!`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Candidates:* ${namesDisplay}`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `🎉 *Winner: ${winnerDisplay}* 🎉`
            }
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `<${appUrl}|Open full Wheel of Names> for the visual experience ✨`
              }
            ]
          }
        ]
      };

      const slackBotToken = process.env.SLACK_BOT_TOKEN;

      if (slackBotToken) {
        // Send message to Slack asynchronously to not hold up the HTTP response
        // Slack requires a 200 OK within 3 seconds, otherwise it retries.
        try {
          const response = await fetch("https://slack.com/api/chat.postMessage", {
            method: "POST",
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Authorization": `Bearer ${slackBotToken}`
            },
            body: JSON.stringify(messageContent)
          });

          const result = await response.json();
          if (!result.ok) {
            console.error("Slack API error:", result.error);
          } else {
            console.log("Successfully posted to Slack");
          }
        } catch (err) {
          console.error("Failed to post message to Slack", err);
        }
      } else {
        console.warn("SLACK_BOT_TOKEN is missing. Cannot post message to Slack.");
      }
    }
  }

  // Must always return 200 OK
  return new NextResponse("OK", { status: 200 });
}
