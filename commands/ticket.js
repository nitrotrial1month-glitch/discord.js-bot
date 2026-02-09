import { 
  SlashCommandBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ticket")
  .setDescription("🎟️ Open ticket panel")
  .addStringOption(option =>
    option
      .setName("message")
      .setDescription("Custom ticket panel message")
      .setRequired(false)
  );

export async function execute(interaction) {
  const panelMessage =
    interaction.options.getString("message") ||
    "🎟️ **Support Ticket Panel**\n\nClick the button below to open a ticket.";

  const button = new ButtonBuilder()
    .setCustomId("open_ticket")
    .setLabel("🎫 Open Ticket")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(button);

  await interaction.reply({
    content: panelMessage,
    components: [row]
  });
}
