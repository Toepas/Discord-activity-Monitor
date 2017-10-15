const Core = require("../discord-bot-core");
const DiscordUtil = Core.util;
const GuildData = require("./models/guild-data.js");

const token = require("../" + process.argv[2]).token,
	dataFile = process.argv[3];

const client = new Core.Client(token, dataFile, __dirname + "/commands", GuildData);

client.on("beforeLogin", () => {
	setInterval(() => checkUsersInAllGuilds(client, client.guildsData), 1 * 24 * 60 * 60 * 1000);
});

client.on("ready", () => {
	checkUsersInAllGuilds(client, client.guildsData);

	client.on("message", message =>
		registerActivity(message.guild, message.member, client.guildsData[message.guild.id]));
});

client.bootstrap();

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
					.catch(err => DiscordUtil.dateError("Error adding active role to user " + member.user.username + " in guild " + guild.name, err.message || err));
			}
		}
	}
}