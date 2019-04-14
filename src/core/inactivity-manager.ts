import { initialize as initializeDb } from "disharmony/dist/database/db-client"
import { Client as DjsClient } from "discord.js"
import Guild from "../models/guild";

export default class InactivityManager
{
    private djsClient: DjsClient

    public async connect(token: string)
    {
        const dbConnectionString = "nedb://nedb-data"
        initializeDb(dbConnectionString)

        this.djsClient = new DjsClient({
            messageCacheMaxSize: 2
        })
        await this.djsClient.login(token.replace(/\r?\n|\r/g, ""))
    }

    public async disconnect()
    {
        await this.djsClient.destroy()
    }

    public async manageInactiveUsers(guildId: string)
    {
        const djsGuild = this.djsClient.guilds.get(guildId)
        if (!djsGuild)
            return

        const guild = new Guild(djsGuild)
        await guild.loadDocument()

        if (!guild.activeRole)
            return

        await guild.activeRole.members.get("117966411548196870")!.removeRole(guild.activeRoleId)
    }
}