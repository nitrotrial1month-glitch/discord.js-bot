const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Ticket system")
    .addSubcommand(sub =>
      sub
        .setName("panel")
        .setDescription("Send ticket panel")
        .addStringOption(o =>
          o.setName("message")
            .setDescription("Panel message")
            .setRequired(true)
        )
        .addChannelOption(o =>
          o.setName("category")
            .setDescription("Ticket category (optional)")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(false)
        )
        .addRoleOption(o =>
          o.setName("support_role")
            .setDescription("Support role (optional)")
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: "❌ Admin only", ephemeral: true });
    }

    const message = interaction.options.getString("message");
    const category = interaction.options.getChannel("category");
    const supportRole = interaction.options.getRole("support_role");

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("create_ticket")
        .setLabel("🎫 Open Ticket")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      content: message,
      components: [button]
    });

    interaction.client.on("interactionCreate", async i => {
      if (!i.isButton()) return;
      if (i.customId !== "create_ticket") return;

      const channel = await i.guild.channels.create({
        name: `ticket-${i.user.username}`,
        type: ChannelType.GuildText,
        parent: category?.id || null,
        permissionOverwrites: [
          {
            id: i.guild.id,
            deny: ["ViewChannel"]
          },
          {
            id: i.user.id,
            allow: ["ViewChannel", "SendMessages"]
          },
          ...(supportRole
            ? [{
                id: supportRole.id,
                allow: ["ViewChannel", "SendMessages"]
              }]
            : [])
        ]
      });

      await channel.send(`🎫 Ticket opened by ${i.user}`);
      await i.reply({ content: "✅ Ticket created!", ephemeral: true });
    });
  }
};
