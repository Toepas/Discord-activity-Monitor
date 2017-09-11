const DiscordUtil = require("discordjs-util");
const GuildSetupHelper = require("./models/guild-setup-helper.js");

const setupHelpers = [];

module.exports = {
	onReady(client, guildsData, config) {
		Activity.checkUsersInAllGuilds(client, guildsData);
		setInterval(() => Activity.checkUsersInAllGuilds(client, guildsData), 1 * 24 * 60 * 60 * 1000);

		return new Promise.resolve();
	},
	onCommand(commandObj, commandsObj, params, guildData, message) {
		switch (commandObj.command) {
			case commandsObj.setup.command:
				return setupFromMessage(client, message, guildData); //return promise!
			case commandsObj.viewSettings.command:
				return new Promise.resolve(`\`\`\`JavaScript\n ${guildData.toString()} \`\`\``);
		}
	},
	onNonCommandMsg(message, guildData) {
		Activity.registerActivity(message.guild, message.member, guildData);
	}
};

const Activity = {
	checkUsersInAllGuilds: (client, guildsData) => client.guilds.forEach(guild => {
		const guildData = guildsData[guild.id];
		if (guildData) {
			guildData.checkUsers(client);
		}
	}),
	registerActivity: (guild, member, guildData) => {
		if (guildData) {
			guildData.users[member.id] = new Date(); //store now as the latest date this user has interacted

			if (guildData.allowRoleAddition && guildData.activeRoleID && guildData.activeRoleID.length > 0) { //check if we're allowed to assign roles as well as remove them in this guild
				let activeRole = guild.roles.get(guildData.activeRoleID);

				if (activeRole
					&& !member.roles.get(activeRole.id) //member doesn't already have active role
					&& !guildData.ignoredUserIDs.includes(member.id) //member isn't in the list of ignored member ids
					&& !member.roles.some(role => guildData.ignoredRoleIDs.includes(role.id))) //member doesn't have one of the ignored role ids
				{
					member.addRole(activeRole)
						.catch(e => DiscordUtil.dateError("Error adding active role to user " + member.user.username + " in guild " + guild.name, e));
				}
			}
		}
	}
};

function setupFromMessage(client, message, guildData) {
	//create the helper to setup the guild
	const helper = new GuildSetupHelper(message);
	let idx = setupHelpers.push(helper);

	const existingUsers = guildData ? guildData.users : null; //extract any saved users if this guild has already run setup before

	helper.walkThroughSetup(client, message.channel, message.member, existingUsers)
		.then(responseData => {
			Object.assign(guildData, responseData); //map all the response data into our guild data object
			message.reply("Setup complete!");
		})
		.catch(e => DiscordUtil.dateError("Error walking through guild setup for guild " + message.guild.name, e))
		.then(() => setupHelpers.splice(idx - 1, 1)); //always remove this setup helper
}