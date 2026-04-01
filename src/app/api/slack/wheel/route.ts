import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  // 1. Read raw body and verify signature
  const rawBody = await request.text();

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
      // Must pad buffers if they somehow got misaligned to prevent crash in timingSafeEqual
      const mySigBuffer = Buffer.from(mySignature, "utf8");
      const slackSigBuffer = Buffer.from(slackSignature, "utf8");
      
      if (mySigBuffer.length !== slackSigBuffer.length) {
         return new NextResponse("Invalid signature length", { status: 401 });
      }

      const isVerified = crypto.timingSafeEqual(
        mySigBuffer,
        slackSigBuffer
      );

      if (!isVerified) {
        return new NextResponse("Invalid signature", { status: 401 });
      }
    } catch (err) {
      return new NextResponse("Error verifying signature", { status: 500 });
    }
  }

  // 2. Parse form-encoded body
  const parsedBody = new URLSearchParams(rawBody);
  const textRaw = parsedBody.get("text") || "";
  const userName = parsedBody.get("user_name") || "someone";

  // 3. Process text input
  // Strip optional "spin" keyword (case-insensitive) at the beginning
  const textCleaned = textRaw.replace(/^spin\s+/i, "").trim();
  
  // Split on commas, remove whitespace around names, and filter out empties
  let names = textCleaned
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  if (textCleaned.toLowerCase() === "tsnb") {
    names = ["@Chris McNeill", "@Seb", "@Tomas", "@Alex", "@Seanosh"];
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://reinvented-won.vercel.app";

  // 4. Handle edge cases (empty or single name)
  if (names.length < 2) {
    return NextResponse.json({
      response_type: "ephemeral",
      text: "Need at least 2 names to spin the wheel! Example: `/wheel Alice, Bob, Charlie`",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Need at least 2 names to spin the wheel!\n*Usage:* `/wheel Alice, Bob, Charlie`"
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
    });
  }

  // 5. Pick a random winner
  const winnerIndex = Math.floor(Math.random() * names.length);
  const winner = names[winnerIndex];

  // 6. Return standard Block Kit response
  return NextResponse.json({
    response_type: "in_channel",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🎡 *@${userName}* spun the wheel!`
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
  });
}
