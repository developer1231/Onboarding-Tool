const fs = require("fs");
const { Events } = require("discord.js");
module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log("Client is Ready for onboarding members");
  },
};
