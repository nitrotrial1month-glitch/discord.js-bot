const { 
  Client, 
  GatewayIntentBits, 
  Collection, 
  Events 
} = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

client.commands = new Collection();

// command loader
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  await client.application.commands.set(
    [...client.commands.values()].map(cmd => cmd.data)
  );
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (e) {
    console.error(e);
    interaction.reply({ content: "❌ Error", ephemeral: true });
  }
});

client.login(process.env.TOKEN);
