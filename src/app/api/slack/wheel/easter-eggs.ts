type EggContext = { winner: string; userName: string; names: string[] };
type Block = Record<string, unknown>;
export type EasterEgg = (ctx: EggContext) => Block[];

export const easterEggs: EasterEgg[] = [
  // 1. Tipping mode
  () => [
    { type: "section", text: { type: "mrkdwn", text: "*Leave a tip?*" } },
    {
      type: "actions",
      elements: [
        { type: "button", text: { type: "plain_text", text: "15%", emoji: true }, value: "tip_15", action_id: "tip_15_action" },
        { type: "button", text: { type: "plain_text", text: "20%", emoji: true }, value: "tip_20", action_id: "tip_20_action" },
        { type: "button", text: { type: "plain_text", text: "50%", emoji: true }, value: "tip_50", action_id: "tip_50_action" },
      ],
    },
  ],

  // 2. Magic 8-ball
  ({ winner }) => {
    const verdicts = [
      "It is decidedly so.",
      "Reply hazy, try again.",
      "Outlook not so good.",
      "Without a doubt.",
      "Ask again later — the wheel is napping.",
      "Signs point to yes.",
    ];
    const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];
    return [{ type: "section", text: { type: "mrkdwn", text: `🎱 *Magic 8-Ball says about ${winner}:* _${verdict}_` } }];
  },

  // 3. Fortune cookie
  ({ winner }) => {
    const n = () => Math.floor(Math.random() * 60) + 1;
    return [{ type: "section", text: { type: "mrkdwn", text: `🥠 _Fortune favors ${winner}._  Lucky numbers: *${n()}, ${n()}, ${n()}, ${n()}*` } }];
  },

  // 4. Wheel-gods blessing
  ({ winner }) => [
    { type: "section", text: { type: "mrkdwn", text: `✨ The Wheel Gods have blessed *${winner}*. Expect mild-to-moderate good fortune within the next 24 hours.` } },
  ],

  // 5. Conspiracy recount
  ({ winner }) => [
    { type: "section", text: { type: "mrkdwn", text: `🕵️ *Breaking:* sources allege the wheel was rigged in favor of *${winner}*. A full recount has been demanded.` } },
  ],

  // 6. Achievement unlocked
  ({ winner }) => [
    { type: "section", text: { type: "mrkdwn", text: `🏆 *Achievement Unlocked* — _${winner}: Chosen by an Algorithm._ +50 XP` } },
  ],

  // 7. Stock ticker
  ({ winner }) => {
    const pct = (Math.random() * 25 + 1).toFixed(1);
    const ticker = winner.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() || "WIN";
    return [{ type: "section", text: { type: "mrkdwn", text: `📈 *$${ticker}* up *${pct}%* on news of wheel selection. Analysts: "buy".` } }];
  },

  // 8. Receipt
  ({ winner }) => [
    { type: "section", text: { type: "mrkdwn", text: `🧾 *Receipt*\n• 1× spin\n• 1× winner (${winner})\n• Tax: 0%\n• Soul: forfeit\n*Total:* $0.00` } },
  ],

  // 9. Drumroll plot twist
  ({ winner }) => [
    { type: "section", text: { type: "mrkdwn", text: `🥁 _Plot twist: the wheel briefly considered re-spinning, but stuck with *${winner}*._` } },
  ],

  // 10. Pep talk
  ({ winner }) => {
    const lines = [
      `you've got this, *${winner}*. The wheel believes in you.`,
      `*${winner}*, today is your day. ☀️`,
      `the wheel chose *${winner}* because it knows greatness when it sees it.`,
      `*${winner}* — destined for excellence. The wheel is rarely wrong.`,
    ];
    return [{ type: "section", text: { type: "mrkdwn", text: `💪 ${lines[Math.floor(Math.random() * lines.length)]}` } }];
  },

  // 11. Wheel-scope
  ({ winner }) => {
    const colors = ["teal", "marigold", "cerulean", "chartreuse", "lavender", "burnt sienna"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return [{ type: "section", text: { type: "mrkdwn", text: `🔮 *Wheel-scope for ${winner}:* today's lucky color is *${color}*. Avoid Mondays.` } }];
  },

  // 12. Weather report
  ({ winner }) => {
    const pct = Math.floor(Math.random() * 30) + 70;
    return [{ type: "section", text: { type: "mrkdwn", text: `🌤 *Wheel Forecast:* ${pct}% chance of *${winner}* dominating the next hour. Light celebration expected.` } }];
  },

  // 13. Breaking news
  ({ winner }) => [
    { type: "section", text: { type: "mrkdwn", text: `📰 *BREAKING:* Local hero *${winner}* claims top wheel prize. Sources describe the victory as "inevitable, in retrospect."` } },
  ],

  // 14. Royal proclamation
  ({ winner }) => [
    { type: "section", text: { type: "mrkdwn", text: `👑 *By order of the Wheel:* *${winner}* shall henceforth be addressed as _Your Spinness_ — for the next five (5) minutes.` } },
  ],

  // 15. Snack tax
  ({ winner }) => [
    { type: "section", text: { type: "mrkdwn", text: `🍪 *Snack Tax:* the Wheel decrees *${winner}* is responsible for the next snack run. Receipts not required.` } },
  ],

  // 16. Movie credits
  ({ winner }) => {
    const score = Math.floor(Math.random() * 15) + 85;
    return [{ type: "section", text: { type: "mrkdwn", text: `🎬 _Starring *${winner}* as_ *The Chosen One*. Rotten Tomatoes: *${score}%*. "An instant classic." — The Wheel Times.` } }];
  },

  // 17. Stat sheet
  ({ winner }) => {
    const stat = () => Math.floor(Math.random() * 20) + 80;
    return [{ type: "section", text: { type: "mrkdwn", text: `📊 *${winner}'s Wheel Stats* ⭐⭐⭐⭐⭐\n• Reflexes: *${stat()}*\n• Charisma: *${stat()}*\n• Wheel-affinity: *${stat()}*` } }];
  },

  // 18. Wheel's apology to losers
  ({ winner, names }) => {
    const losers = names.filter((n) => n !== winner);
    return [{ type: "section", text: { type: "mrkdwn", text: `🙇 The Wheel sends its sincere regrets to *${losers.join(", ")}*. Better luck next spin.` } }];
  },

  // 19. Pineapple on pizza
  ({ winner }) => [
    { type: "section", text: { type: "mrkdwn", text: `🍍🍕 The Wheel has determined that *${winner}* unequivocally supports pineapple on pizza. The hedgehogs approve. 🦔` } },
  ],

  // 20. Trash folder near-miss
  ({ winner }) => [
    { type: "section", text: { type: "mrkdwn", text: `🗑️ Plot twist: the wheel almost dragged *${winner}* into the *trash folder*. They were spared at the last second.` } },
  ],

  // 21. Hedgehog approval
  ({ winner }) => [
    { type: "section", text: { type: "mrkdwn", text: `🦔 The PostHog hedgehogs convened, nodded approvingly, and ratified *${winner}* as the rightful winner.` } },
  ],

  // 22. Max consulted the data
  ({ winner }) => [
    { type: "section", text: { type: "mrkdwn", text: `🤖 *Max* consulted the data and confirmed: *${winner}*'s victory was statistically inevitable. (p < 0.05)` } },
  ],

  // 23. Hopping on a quick call
  ({ winner }) => [
    { type: "section", text: { type: "mrkdwn", text: `📞 *${winner}* — James says you're _hopping on a quick call_. 👀` } },
  ],

  // 24. Gelato mandate
  ({ winner }) => [
    { type: "section", text: { type: "mrkdwn", text: `🍨 Per Paul's gelato mandate, *${winner}* gets first scoop at the next offsite. Flavor: dealer's choice.` } },
  ],

  // 25. IPO promises list
  ({ winner }) => [
    { type: "section", text: { type: "mrkdwn", text: `📜 *${winner}*'s name has officially been added to the *IPO promises list*. The list grows.` } },
  ],

  // 26. Sparks joy
  ({ winner }) => {
    const verdict = Math.random() < 0.5
      ? `:sparksjoy: *${winner}* sparks joy.`
      : `:does_not_spark_joy: ...the wheel will not elaborate further.`;
    return [{ type: "section", text: { type: "mrkdwn", text: verdict } }];
  },
];
