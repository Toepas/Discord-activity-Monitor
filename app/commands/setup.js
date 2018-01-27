const Core = require("../../core");
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

                /* Wait half a second before resolving as a cheap workaround for race conditions.
                   The final setup step message sent by the user will be attached to the old config, and will
                   actually be registered after the setup finishes. Without this .5 sec wait, the old config would
                   immediately overwrite the new config in the database. */

                setTimeout(() => resolve("Setup complete!"), 500);
            })
            .catch(e => reject("Error walking through guild setup for guild " + message.guild.name + ".\n" + (e.message || e)))
            .then(() => setupHelpers.splice(idx - 1, 1));
    });
}