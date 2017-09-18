const Core = require("../discord-bot-core");
const DiscordUtil = Core.util;
const GuildSetupHelper = require("./models/guild-setup-helper.js");
const GuildData = require("./models/guild-data.js");

const setupHelpers = [];

//IMPLEMENTATIONS//
function onReady(coreClient) {
	checkUsersInAllGuilds(coreClient.actual, coreClient.guildsData);
	setInterval(() => checkUsersInAllGuilds(coreClient.actual, coreClient.guildsData), 1 * 24 * 60 * 60 * 1000);

	return Promise.resolve();
}

function onTextMessage(message, guildData) {
	registerActivity(message.guild, message.member, guildData);
	return Promise.resolve();
}

function setup({ command, params, guildData, botName, message, coreClient }) {
	return new Promise((resolve, reject) => {
		const helper = new GuildSetupHelper(message);
		let idx = setupHelpers.push(helper) - 1;

		const existingUsers = guildData ? guildData.users : null;

		helper.walkThroughSetup(coreClient.actual, message.channel, message.member, existingUsers)
			.then(responseData => {
				Object.assign(guildData, responseData);
				resolve("Setup complete!");
			})
			.catch(e => reject("Error walking through guild setup for guild " + message.guild.name + ".\n" + (e.message || e)))
			.then(() => setupHelpers.splice(idx - 1, 1));
	});
}

function viewSettings({ command, params, guildData, botName, message, coreClient }) {
	return Promise.resolve(`\`\`\`JavaScript\n ${guildData.toString()} \`\`\``);
}


//INTERNAL FUNCTIONS//
function checkUsersInAllGuilds(client, guildsData) {
	client.guilds.forEach(guild => {
		const guildData = guildsData[guild.id];
		if (guildData) {
			guildData.checkUsers(client);
		}
	});
}

function registerActivity(guild, member, guildData) {
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


//CLIENT SETUP//
const token = require("../" + process.argv[2]).token,
	dataFile = process.argv[3],
	commands = require("./commands.json"),
	implementations = {
		onReady,
		onTextMessage,
		setup,
		viewSettings
	};
const client = new Core.Client(token, dataFile, commands, implementations, GuildData);
client.bootstrap();