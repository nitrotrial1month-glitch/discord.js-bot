const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const prefix = "!";
const dailyCooldown = new Map();

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const cmd = message.content
    .slice(prefix.length)
    .trim()
    .toLowerCase();

  // 👋 HELLO
  if (cmd === "hello") {
    return message.reply("👋 Hewwooo! owo");
  }

  // 🏓 PING
  if (cmd === "ping") {
    return message.reply("🏓 Pong!");
  }

  // 🎁 DAILY
  if (cmd === "daily") {
    const userId = message.author.id;
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000;

    if (dailyCooldown.has(userId)) {
      const last = dailyCooldown.get(userId);
      const remaining = cooldown - (now - last);

      if (remaining > 0) {
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        return message.reply(`⏳ owo slowww~ come back in **${h}h ${m}m**`);
      }
    }

    const reward = Math.floor(Math.random() * 500) + 200;
    dailyCooldown.set(userId, now);

    return message.reply(`🎉 owo! you got **${reward} coins** 💰`);
  }
});

client.login(process.env.TOKEN);
