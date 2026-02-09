const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder
} = require("discord.js");

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

/* =======================
   TICKET PANEL COMMAND
======================= */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift()?.toLowerCase();

  if (cmd !== "ticketpanel") return;

  if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return message.reply("❌ Only admins can use this.");
  }

  const categoryId = args[0] || "none";
  const roleId = args[1] || "none";

  const embed = new EmbedBuilder()
    .setTitle("🎫 Support Ticket")
    .setDescription("Click the button below to open a ticket.")
    .setColor("Green");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`ticket_${categoryId}_${roleId}`)
      .setLabel("🎟️ Open Ticket")
      .setStyle(ButtonStyle.Primary)
  );

  message.channel.send({ embeds: [embed], components: [row] });
});

/* =======================
   BUTTON HANDLER
======================= */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith("ticket_")) {
    const data = interaction.customId.split("_");
    const categoryId = data[1] !== "none" ? data[1] : null;
    const roleId = data[2] !== "none" ? data[2] : null;

    const exists = interaction.guild.channels.cache.find(
      (c) => c.name === `ticket-${interaction.user.id}`
    );

    if (exists) {
      return interaction.reply({
        content: "❗ You already have a ticket.",
        ephemeral: true
      });
    }

    const perms = [
      {
        id: interaction.guild.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages
        ]
      }
    ];

    if (roleId) {
      perms.push({
        id: roleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages
        ]
      });
    }

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.id}`,
      type: ChannelType.GuildText,
      parent: categoryId,
      permissionOverwrites: perms
    });

    const closeRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("🔒 Close")
        .setStyle(ButtonStyle.Danger)
    );

    channel.send({
      content: `<@${interaction.user.id}>`,
      embeds: [
        new EmbedBuilder()
          .setTitle("🎫 Ticket Opened")
          .setDescription("Describe your issue here.")
          .setColor("Blue")
      ],
      components: [closeRow]
    });

    interaction.reply({
      content: `✅ Ticket created: ${channel}`,
      ephemeral: true
    });
  }

  if (interaction.customId === "close_ticket") {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "❌ Only admins can close tickets.",
        ephemeral: true
      });
    }

    await interaction.channel.send("🔒 Closing ticket in 5 seconds...");
    setTimeout(() => interaction.channel.delete(), 5000);
  }
});

client.login(process.env.TOKEN);
