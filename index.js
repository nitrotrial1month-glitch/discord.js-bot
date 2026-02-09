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

  if (cmd !== "ticket") return;

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

const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Ticket system")
    .addSubcommand(sub =>
      sub
        .setName("panel")
        .setDescription("Create ticket panel")
        .addStringOption(o =>
          o.setName("title").setDescription("Panel title").setRequired(true)
        )
        .addStringOption(o =>
          o.setName("description").setDescription("Panel description").setRequired(true)
        )
        .addStringOption(o =>
          o.setName("button_text").setDescription("Button text").setRequired(true)
        )
        .addStringOption(o =>
          o.setName("color")
            .setDescription("Embed color")
            .setRequired(true)
            .addChoices(
              { name: "Green", value: "Green" },
              { name: "Blue", value: "Blue" },
              { name: "Red", value: "Red" },
              { name: "Yellow", value: "Yellow" }
            )
        )
        .addChannelOption(o =>
          o.setName("category")
            .setDescription("Ticket category")
            .setRequired(false)
        )
        .addRoleOption(o =>
          o.setName("support_role")
            .setDescription("Support role")
            .setRequired(false)
        )
    )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );
  console.log("✅ Slash commands registered");
})();
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "ticket") return;

  if (interaction.options.getSubcommand() === "panel") {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: "❌ Admin only", ephemeral: true });
    }

    const title = interaction.options.getString("title");
    const desc = interaction.options.getString("description");
    const btn = interaction.options.getString("button_text");
    const color = interaction.options.getString("color");
    const category = interaction.options.getChannel("category");
    const role = interaction.options.getRole("support_role");

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(desc)
      .setColor(color);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`ticket_${category?.id || "none"}_${role?.id || "none"}`)
        .setLabel(btn)
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: "✅ Ticket panel created", ephemeral: true });
  }
});
