const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === "ping") {
    message.reply("🏓 Pong!");
  }

  if (message.content.toLowerCase() === "hello") {
    message.reply("👋 Hello! কেমন আছো?");
  }
});

client.login(process.env.TOKEN);
