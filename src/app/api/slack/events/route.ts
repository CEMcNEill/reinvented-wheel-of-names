import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

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

  if (signingSecret && slackSignature && slackTimestamp) {
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
  } else if (process.env.NODE_ENV === "production" && !signingSecret) {
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

      const names = ["@Chris McNeill", "@Seb", "@Tomas", "@Alex", "@Seanosh"];
      const winnerIndex = Math.floor(Math.random() * names.length);
      const winner = names[winnerIndex];

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://reinvented-won.vercel.app";

      const messageContent = {
        channel: channelId,
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
               text: `*Candidates:* ${names.join(", ")}`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `🎉 *Winner: ${winner}* 🎉`
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
