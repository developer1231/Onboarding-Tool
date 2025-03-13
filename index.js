require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { alreadyExisted } = require("./helpers/roleManager");
const {
  REST,
  Routes,
  ChannelType,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  AttachmentBuilder,
  Embed,
} = require("discord.js");
const {
  Client,
  Events,
  GatewayIntentBits,
  PermissionFlagsBits,
  Collection,
  EmbedBuilder,
} = require("discord.js");
const client = new Client({
  intents: Object.keys(GatewayIntentBits).map((a) => {
    return GatewayIntentBits[a];
  }),
});

const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);
client.commands = new Collection();
for (const folder of commandFolders) {
  if (fs.lstatSync("./commands/" + folder).isDirectory()) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }
}

const rest = new REST().setToken(process.env.BOT_TOKEN);
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );
    const data = await rest.put(
      Routes.applicationCommands(process.env.BOT_CLIENT_ID),
      {
        body: commands,
      }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  const checkIfUserAlreadyExisted = await alreadyExisted(oldMember);
  if (checkIfUserAlreadyExisted) return;

  const addedRoles = newMember.roles.cache.filter(
    (role) => !oldMember.roles.cache.has(role.id)
  );
  let proRole = addedRoles.find((role) => role.id === process.env.PRO_ROLE_ID);
  let noviceOrIntermediateRole = addedRoles.find(
    (role) =>
      role.id === process.env.NOVICE_ROLE_ID ||
      role.id === process.env.INTERMEDIATE_ROLE_ID
  );

  // Case user is pro: simply skip.
  if (proRole) return;
  if (noviceOrIntermediateRole) {
    setTimeout(() => {
      const Embed = new EmbedBuilder()
        .setTitle("🚀 Welcome to the server!")
        .setDescription(
          `Hello ${newMember.name}! Welcome to ${newMember.guild}!\n\nI'm **Mostafa's Bot**, also known as **The Thumbnail Bot**, and I'm here to guide you through your journey in this server. Whether you're new to Discord or just getting familiar with how we operate here, I am here to help you!

          To help you get started and ensure smooth communication, please take a moment to watch this short video:
          
          [👉 Watch the Welcome Video](${process.env.LOOM_LINK})
          
          **Feel free to ask if you have any questions. We're excited to have you here! 🚀**`
        )
        .setColor("#FFA500")
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter("The Thumbnail Bot | Onboarding");
      try {
        newMember.send({ embeds: [Embed] });
      } catch (e) {}
    }, 120000);
  }
});

client.login(process.env.BOT_TOKEN);
