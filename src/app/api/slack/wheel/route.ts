import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { easterEggs } from "./easter-eggs";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

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

  // Strip the mode keywords. They can come in either order, before the names.
  let textModed = textCleaned;
  let chrisMode = false;
  let partyMode = false;

  for (let found = true; found; ) {
    found = false;
    if (/^chrismode\s+/i.test(textModed)) {
      chrisMode = true;
      textModed = textModed.replace(/^chrismode\s+/i, "").trim();
      found = true;
    }
    if (/^partymode\s+/i.test(textModed)) {
      partyMode = true;
      textModed = textModed.replace(/^partymode\s+/i, "").trim();
      found = true;
    }
  }

  // Split off an optional prize/assignment on the first " gets " keyword.
  // Everything before is the name list; everything after is the prize (verbatim, may be a URL).
  let nameText = textModed;
  let prize: string | null = null;

  const getsMatch = textModed.match(/\s+gets\s+/i);
  if (getsMatch && getsMatch.index !== undefined) {
    nameText = textModed.slice(0, getsMatch.index).trim();
    const prizeRaw = textModed.slice(getsMatch.index + getsMatch[0].length).trim();
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

  if (chrisMode) {
    names = names.map((_, index) => (index === 0 ? "Chris" : `Chris ${index + 1}`));
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
            text: "Need at least 2 names to spin the wheel!\n*Usage:* `/wheel Alice, Bob, Charlie`\n*Optional prize:* `/wheel Alice, Bob gets the deploy ticket` — brief result, winner gets the prize.\n*Party mode:* `/wheel partymode Alice, Bob, Charlie` — no restraint whatsoever. :woohoo-hdr:"
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

  // 5b. Seb gets no celebration. Plain text, no blocks, no easter egg, whatever the mode.
  if (winner.trim().toLowerCase() === "seb") {
    return NextResponse.json({
      response_type: "in_channel",
      text: prize ? `${winner} gets ${prize}` : winner
    });
  }

  // 5c. Party response path: every celebration at once, restraint nowhere.
  if (partyMode) {
    const confetti = shuffle([
      ":hdr-smile:", ":beer-hdr:", ":woohoo-hdr:", "🎉", "🎊", "🥳", "✨", "🕺", "🏆", "🥇"
    ]);
    const banner = [...confetti, ...confetti].slice(0, 12).join(" ");

    // Three different easter eggs, because one is clearly not enough.
    const partyEggs = shuffle(easterEggs)
      .slice(0, 3)
      .flatMap((partyEgg) => [
        ...partyEgg({ winner, userName, names }),
        { type: "divider" }
      ]);

    const prizeLine = prize ? `\n:beer-hdr: ...and *${winner}* gets *${prize}*!` : "";

    return NextResponse.json({
      response_type: "in_channel",
      text: `🎉🎊 PARTY MODE — Winner: ${winner}${prize ? ` gets ${prize}` : ""}`,
      blocks: [
        { type: "header", text: { type: "plain_text", text: "🎉🎊 PARTY MODE 🎊🎉", emoji: true } },
        { type: "section", text: { type: "mrkdwn", text: banner } },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:hdr-smile: *@${userName}* spun the wheel for *${names.length}* brave souls: ${names.join(", ")}`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:woohoo-hdr: 🏆 *WINNER: ${winner}* 🏆 :woohoo-hdr:${prizeLine}`
          }
        },
        { type: "divider" },
        ...partyEggs,
        { type: "section", text: { type: "mrkdwn", text: banner } },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `:beer-hdr: The wheel has left the building. <${appUrl}|Spin again, you animal> ✨`
            }
          ]
        }
      ]
    });
  }

  // 5d. Brief response path: a prize/assignment was provided.
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

  // 6. Return the winner with a random easter egg
  const egg = easterEggs[Math.floor(Math.random() * easterEggs.length)];
  const eggBlocks = egg({ winner, userName, names });

  return NextResponse.json({
    response_type: "in_channel",
    text: `🎉 Winner: ${winner}`,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: `🎉 *Winner: ${winner}* 🎉` }
      },
      ...eggBlocks
    ]
  });
}
