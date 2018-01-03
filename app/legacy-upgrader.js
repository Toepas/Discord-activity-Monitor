// @ts-nocheck
const NewGuildData = require("./models/guild-data.js");
const FileSystem = require("fs");

module.exports = function () {
	if (!FileSystem.existsSync("./guilds.json"))
		return;

	const legacyJson = require("../guilds.json");

	for (let guildID of Object.keys(legacyJson)) {
		const oldGuildData = legacyJson[guildID];

		const users = {};

		for (let userID of Object.keys(oldGuildData.users))
			users[userID] = new Date(oldGuildData.users[userID]);

		const newGuildData = NewGuildData.create({
			guildID: guildID,
			inactiveThresholdDays: oldGuildData.inactiveThresholdDays,
			activeRoleID: oldGuildData.activeRoleID,
			users: users,
			allowRoleAddition: oldGuildData.allowRoleAddition,
			ignoredUserIDs: oldGuildData.ignoredUserIDs,
			ignoredRoleIDs: oldGuildData.ignoredRoleIDs
		});

		newGuildData.save();
	}

	FileSystem.rename("./guilds.json", "./guilds.json.backup");
};