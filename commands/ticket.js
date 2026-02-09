import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Open support ticket panel"),

  async execute(interaction) {
    const button = new ButtonBuilder()
      .setCustomId("open_ticket")
      .setLabel("🎫 Open Ticket")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({
      embeds: [{
        title: "🎫 Support Ticket Panel",
        description: "Click the button below to open a ticket",
        color: 0x5865F2
      }],
      components: [row]
    });
  }
};
