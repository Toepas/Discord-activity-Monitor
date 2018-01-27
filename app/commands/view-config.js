const Core = require("../../core");

module.exports = new Core.Command({
    name: "view-config",
    description: "View configured settings for this server",
    syntax: "view-config",
    admin: true,
    invoke
});

function invoke({ message, params, guildData, client }) {
    return Promise.resolve(`\`\`\`JavaScript\n ${guildData.toString()} \`\`\``);
}