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

  // 3. Process text input
  // Strip optional "spin" keyword (case-insensitive) at the beginning
  const textCleaned = textRaw.replace(/^spin\s+/i, "").trim();

  // Split off an optional prize/assignment on the first " gets " keyword.
  // Everything before is the name list; everything after is the prize (verbatim, may be a URL).
  let nameText = textCleaned;
  let prize: string | null = null;

  const getsMatch = textCleaned.match(/\s+gets\s+/i);
  if (getsMatch && getsMatch.index !== undefined) {
    nameText = textCleaned.slice(0, getsMatch.index).trim();
    const prizeRaw = textCleaned.slice(getsMatch.index + getsMatch[0].length).trim();
    // Empty prize (trailing "gets" with nothing after) falls back to the normal full response.
    prize = prizeRaw.length > 0 ? prizeRaw : null;
  }

  // Split on commas, remove whitespace around names, and filter out empties
  let names = nameText
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  if (nameText.toLowerCase() === "tsnb") {
    names = ["Chris McNeill", "Seb", "Tomas", "Alex", "Seanosh"];
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://reinvented-won.vercel.app";

  // 4. Handle edge cases (empty or single name)
  if (names.length < 2) {
    return NextResponse.json({
      response_type: "ephemeral",
      text: "Need at least 2 names to spin the wheel! Example: `/wheel Alice, Bob, Charlie` or `/wheel Alice, Bob gets the deploy`",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Need at least 2 names to spin the wheel!\n*Usage:* `/wheel Alice, Bob, Charlie`\n*Optional prize:* `/wheel Alice, Bob gets the deploy ticket` — brief result, winner gets the prize."
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

  // 5b. Brief response path: a prize/assignment was provided.
  if (prize) {
    const isUrl = /^https?:\/\/\S+$/i.test(prize);
    const prizeText = isUrl ? `<${prize}|${prize}>` : prize;
    return NextResponse.json({
      response_type: "in_channel",
      text: `🎉 Winner: ${winner} gets ${prize}`,
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: `🎉 *Winner: ${winner}* gets ${prizeText}` }
        }
      ]
    });
  }

  // 6. Return the winner name, nothing else
  return NextResponse.json({
    response_type: "in_channel",
    text: winner,
  });
}
