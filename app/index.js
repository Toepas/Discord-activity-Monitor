// @ts-ignore
const Config = require("./config.json");
const Core = require("../discord-bot-core");
const DiscordUtil = Core.util;
const GuildData = require("./models/guild-data.js");

// @ts-ignore
const client = new Core.Client(require("../token.json"), __dirname + "/commands", GuildData);

client.on("beforeLogin", () => {
	setInterval(checkUsersInAllGuilds, 1 * 24 * 60 * 60 * 1000);
	client.overrideDefaultCompactionSchedule(Config.dbCompactionSchedule);
	require("./legacy-upgrader.js")(); //upgrade legacy json into new db format
});

client.on("ready", checkUsersInAllGuilds);

client.on("message", message => {
	if (message.guild && message.member)
		client.guildDataModel.findOne({ guildID: message.guild.id })
			.then(guildData => registerActivity(message.guild, message.member, guildData));
});

client.bootstrap();

function checkUsersInAllGuilds() {
	client.guilds.forEach(guild =>
		client.guildDataModel.findOne({ guildID: guild.id })
			.then(guildData => guildData && guildData.checkUsers(client)));
}

function registerActivity(guild, member, guildData) {
	if (member && guildData) {
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
		guildData.save();
	}
}