//node imports
const FileSystem = require("fs"); //manage files
const Util = require("util"); //various node utilities

//external lib imports
const Discord = require("discord.js");
const JsonFile = require("jsonfile"); //save/load data to/from json

//my imports
const DiscordUtil = require("discordjs-util"); //some discordjs helper functions of mine

//app components
const GuildData = require("./models/guild-data.js"); //data structure for guilds
const PackageJSON = require("../package.json"); //used to provide some info about the bot
const Bot = require("./bot.js");

//global vars
let writeFile = null; //method will be re-assigned in .exports method

//use module.exports as a psuedo "onready" function
module.exports = (client, config = null) => {
	config = config || require("./config.json");
	const guildsData = FileSystem.existsSync(config.generic.saveFile) ? fromJSON(JsonFile.readFileSync(config.generic.saveFile)) : {};

	writeFile = () => JsonFile.writeFile(config.generic.saveFile, guildsData, err => { if (err) DiscordUtil.dateError("Error writing file", err); });
	setInterval(() => writeFile(), config.generic.saveIntervalSec * 1000);

	client.on("message", message => {
		if (message.author.id !== client.user.id) {
			if (message.channel.type === "dm")
				HandleMessage.dm(client, config, message);
			else if (message.channel.type === "text" && message.member)
				HandleMessage.text(client, config, message, guildsData);
		}
	});

	Bot.onReady(client, guildsData, config).then(() => writeFile()).catch(err => DiscordUtil.dateError(err));
};

const HandleMessage = {
	dm: (client, config, message) => {
		message.reply(Util.format(config.generic.defaultDMResponse, config.generic.website, config.generic.discordInvite));
	},
	text: (client, config, message, guildsData) => {
		const isCommand = message.content.startsWith(message.guild.me.toString());
		let guildData = guildsData[message.guild.id];

		if (!guildData)
			guildData = guildsData[message.guild.id] = new GuildData({ id: message.guild.id });

		if (isCommand) {
			const userIsAdmin = message.member.permissions.has("ADMINISTRATOR");
			const botName = "@" + (message.guild.me.nickname || client.user.username);
			const { command, params, expectedParamCount } = getCommandDetails(message, config, userIsAdmin);

			if (!command || !params || isNaN(expectedParamCount))
				return;

			switch (command) {
				case config.commands.version:
					message.reply(`${PackageJSON.name} v${PackageJSON.version}`);
					break;
				case config.commands.help:
					message.channel.send(createHelpEmbed(botName, config, userIsAdmin));
					break;
				default:
					if (params.length >= expectedParamCount)
						Bot.onCommand({ command, config, params: params, guildData, botName, message, client })
							.then(msg => {
								message.reply(msg);
								writeFile();
							})
							.catch(err => {
								message.reply(err);
								DiscordUtil.dateError(err);
							});
					else
						message.reply(`Incorrect syntax!\n**Expected:** *${botName} ${command.syntax}*\n**Need help?** *${botName} ${config.commands.help.command}*`);
					break;
			}
		}
		else
			Bot.onNonCommandMsg(message, guildData);
	}
};

function getCommandDetails(message, config, userIsAdmin) {
	const splitMessage = message.content.toLowerCase().split(/ +/);
	const commandStr = splitMessage[1];
	const command = config.commands[Object.keys(config.commands).find(x => config.commands[x].command.toLowerCase() === commandStr)];

	if (!command || (command.admin && !userIsAdmin))
		return { command: null, params: null, expectedParamCount: null };

	const params = splitMessage.slice(2, splitMessage.length);
	const expectedParamCount = command.syntax.split(/ +/).length - 1;

	let finalisedParams;
	if (params.length > expectedParamCount)
		finalisedParams = params.slice(0, expectedParamCount - 1).concat([params.slice(expectedParamCount - 1, params.length).join(" ")]);
	else
		finalisedParams = params;

	return { command, params: finalisedParams, expectedParamCount };
}

function fromJSON(json) {
	const guildsData = Object.keys(json);
	guildsData.forEach(guildID => { json[guildID] = new GuildData(json[guildID]); });
	return json;
}

function createHelpEmbed(name, config, userIsAdmin) {
	const commandsArr = Object.keys(config.commands).map(x => config.commands[x]).filter(x => userIsAdmin || !x.admin);

	const embed = new Discord.RichEmbed().setTitle(`__Help__ for ${PackageJSON.name.replace("discord-bot-", "")}`);

	commandsArr.forEach(command => {
		embed.addField(command.command, `${command.description}\n**Usage:** *${name} ${command.syntax}*${userIsAdmin && command.admin ? "\n***Admin only***" : ""}`);
	});

	embed.addField("__Need more help?__", `[Visit my website](${config.generic.website}) or [Join my Discord](${config.generic.discordInvite})`, true);

	return { embed };
}