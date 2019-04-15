import { initialize as initializeDb } from "disharmony/dist/database/db-client"
import { Client as DjsClient } from "discord.js"
import Guild from "../models/guild";
import { Logger } from "disharmony";

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

    public async manageInactiveUsersInAllGuilds()
    {
        Logger.debugLog("Beginning guild iteration to manage inactive users")
        for (let guild of this.djsClient.guilds.values())
            await this.manageInactiveUsersInGuild(guild.id)
        Logger.debugLog("Guilds iteration complete")
    }

    public async manageInactiveUsersInGuild(guildId: string)
    {
        const djsGuild = this.djsClient.guilds.get(guildId)
        if (!djsGuild)
            return

        const guild = new Guild(djsGuild)
        await guild.loadDocument()

        if (!guild.activeRole)
            return

        Logger.debugLog(`Managing inactives for guild ${guild.name}`)
        for (let member of guild.activeRole.members.values())
        {
            //don't ask me why, sometimes member is null
            if (!member)
                return

            const now = new Date()
            if (!guild.users.get(member.id))
            {
                guild.users.set(member.id, now) //if a user has the active role but isn't in the database, add them
                Logger.debugLog(`User ${member.user.username} has active role but not found in database, adding new entry`)
            }
            else if (this.isInactiveBeyondThreshold(guild.users.get(member.id)!, now, guild.inactiveThresholdDays))
                {
                    try
                    {
                        await member.removeRole(guild.activeRole)
                        if (guild.inactiveRoleId && guild.inactiveRoleId !== "disabled")
                            await member.addRole(guild.inactiveRoleId)
                        guild.users.delete(member.id)
                        Logger.debugLog(`Updated now inactive user ${member.user.username}`)
                    }
                    catch (e)
                    {
                        Logger.consoleLog(`Error switching user ${member.user.username} to inactive in guild ${guild.name}`, true)
                    }
                }
            }

            await guild.save()
        }

    private isInactiveBeyondThreshold(lastActiveDate: Date, now: Date, thresholdDays: number): boolean
    {
        const dayLength = 24 * 60 * 60 * 1000
        return Math.round(Math.abs(now.getTime() - lastActiveDate.getTime()) / dayLength) > thresholdDays
    }
}