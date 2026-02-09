import { 
  Client, 
  Collection, 
  GatewayIntentBits, 
  InteractionType 
} from "discord.js";
import fs from "fs";

// Client create
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

// Command collection
client.commands = new Collection();

// Load commands
const commandFiles = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Ready event + Slash register
client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  await client.application.commands.set(
    [...client.commands.values()].map(cmd => cmd.data)
  );

  console.log("✅ Slash commands registered");
});

// Interaction handler
client.on("interactionCreate", async (interaction) => {
  if (interaction.type !== InteractionType.ApplicationCommand) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ 
        content: "❌ Something went wrong!", 
        ephemeral: true 
      });
    } else {
      await interaction.reply({ 
        content: "❌ Something went wrong!", 
        ephemeral: true 
      });
    }
  }
});

// Login
client.login(process.env.TOKEN);
