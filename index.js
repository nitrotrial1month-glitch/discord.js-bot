const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  if (msg === "ping") {
    message.reply("🏓 Pong!");
  }

  if (msg === "hello" || msg === "hi") {
    message.reply("👋 Hello! আমি অনলাইনে আছি 😄");
  }
});

client.login(process.env.TOKEN);
