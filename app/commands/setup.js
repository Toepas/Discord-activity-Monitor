const Core = require("../../discord-bot-core");
const GuildSetupHelper = require("../models/guild-setup-helper.js");

const setupHelpers = [];

module.exports = new Core.Command({
	name: "setup",
	description: "Set up activity monitor for this server",
	syntax: "setup",
	admin: true,
	invoke
});

function invoke({ message, params, guildData, client }) {
	return new Promise((resolve, reject) => {
		const helper = new GuildSetupHelper(message);
		let idx = setupHelpers.push(helper) - 1;

		const existingUsers = guildData ? guildData.users : null;

		helper.walkThroughSetup(client, message.channel, message.member, existingUsers)
			.then(responseData => {
				Object.assign(guildData, responseData);
				resolve("Setup complete!");
			})
			.catch(e => reject("Error walking through guild setup for guild " + message.guild.name + ".\n" + (e.message || e)))
			.then(() => setupHelpers.splice(idx - 1, 1));
	});
}