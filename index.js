const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const prefix = "!";

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().toLowerCase();

  if (args === "hello") {
    message.reply("👋 Hello! আমি prefix বট 😄");
  }

  if (args === "ping") {
    message.reply("🏓 Pong!");
  }
});

client.login(process.env.TOKEN);
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

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const command = message.content
    .slice(prefix.length)
    .trim()
    .toLowerCase();

  // 🎁 DAILY COMMAND
  if (command === "daily") {
    const userId = message.author.id;
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000; // 24 hours

    if (dailyCooldown.has(userId)) {
      const expires = dailyCooldown.get(userId) + cooldown;

      if (now < expires) {
        const remaining = expires - now;
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor(
          (remaining % (1000 * 60 * 60)) / (1000 * 60)
        );

        return message.reply(
          `⏳ **Slow down!** You already claimed your daily.\n🕒 Try again in **${hours}h ${minutes}m**`
        );
      }
    }

    const reward = Math.floor(Math.random() * 500) + 200; // 200–700
    dailyCooldown.set(userId, now);

    message.reply(
      `🎉 **Daily Reward Claimed!**\n💰 You received **${reward} coins**\n🐾 Come back tomorrow!`
    );
  }

  // 🏓 PING
  if (command === "ping") {
    message.reply("🏓 Pong!");
  }

  // 👋 HELLO
  if (command === "hello") {
    message.reply("👋 Hewwooo! owo");
  }
});

client.login(process.env.TOKEN);
