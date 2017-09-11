const GuildData = require("./models/guild-data.js");

module.exports = {
	onReady(client, guildsData, config) {
		return new Promise.resolve();
	},
	onCommand(commandObj, commandsObj, params, guildData, message) {
		switch (commandObj.command) {
			case commandsObj.commandName.command:
				return; //return promise!
		}
	},
	onNonCommandMsg(message, guildData) {
		return;
	}
};