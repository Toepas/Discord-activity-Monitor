// @ts-ignore
const Config = require("./config.json");
const Core = require("../core");
const CronJob = require("cron").CronJob;
const GuildData = require("./models/guild-data.js");

// @ts-ignore
const client = new Core.Client(require("../token.json"), __dirname + "/commands", GuildData);

client.on("beforeLogin", () => {
    new CronJob(Config.activityUpdateSchedule, checkUsersInAllGuilds, null, true);
});

client.on("ready", checkUsersInAllGuilds);

client.on("message", message => {
    if (message.guild && message.member)
        GuildData.findOne({ guildID: message.guild.id })
            .then(guildData => registerActivity(message.guild, message.member, guildData));
});

client.on("voiceStateUpdate", member => {
    GuildData.findOne({ guildID: member.guild.id })
        .then(guildData => registerActivity(member.guild, member, guildData));
});

client.bootstrap();

function checkUsersInAllGuilds() {
    client.guilds.forEach(guild =>
        GuildData.findOne({ guildID: guild.id })
            .then(guildData => guildData && guildData.checkUsers(client)));
}

function registerActivity(guild, member, guildData) {
    if (member && guildData && member.id !== client.user.id) {
        guildData.users[member.id] = new Date(); //store now as the latest date this user has interacted

        if (canManageRoles(guildData)) {
            if (guildData.shouldMarkActive(member))
                guildData.doMarkActive(member);
        }
        guildData.save();
    }
}

function canManageRoles(guildData) {
    return guildData.allowRoleAddition && guildData.activeRoleID && guildData.activeRoleID.length > 0;
}