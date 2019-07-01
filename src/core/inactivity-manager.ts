import { GuildMember } from "discord.js";
import { LightClient, loadConfig, Logger } from "disharmony";
import Guild from "../models/guild";

export default class InactivityManager
{
    public async manageInactiveUsersInAllGuilds()
    {
        await Logger.debugLog("Beginning guild iteration to manage inactive users")
        for (const guild of this.client.djs.guilds.values())
            await this.manageInactiveUsersInGuild(guild.id)
        await Logger.debugLog("Guilds iteration complete")
    }

    public async manageInactiveUsersInGuild(guildId: string)
    {
        const djsGuild = this.client.djs.guilds.get(guildId)
        if (!djsGuild)
            return

        const guild = new Guild(djsGuild)
        await guild.loadDocument()

        if (!guild.activeRole)
            return

        Logger.debugLog(`Managing inactives for guild ${guild.name}`)
        for (const member of guild.activeRole.members.values())
        {
            // Don't ask me why, sometimes member is null
            if (!member)
                continue

            // If the member has the active role but isn't in the database, add them
            const now = new Date()
            if (!guild.users.get(member.id))
            {
                guild.users.set(member.id, now)
                Logger.debugLog(`User ${member.user.username} has active role but not found in database, adding new entry`)
                continue
            }

            // If the member is inactive, remove the active role and remove them from the database
            const isMemberInactive = this.isInactiveBeyondThreshold(guild.users.get(member.id)!, now, guild.inactiveThresholdDays)
            if (isMemberInactive)
                await this.markMemberInactive(guild, member)
                    .catch(e => Logger.debugLogError(`Error switching user ${member.user.username} to inactive in guild ${guild.name}`, e))
        }

        await guild.save()
    }

    private async markMemberInactive(guild: Guild, member: GuildMember)
    {
        const reasonStr = `No activity detected within last ${guild.inactiveThresholdDays} days`
        await member.removeRole(guild.activeRole!, reasonStr)
        if (guild.inactiveRoleId && guild.inactiveRoleId !== "disabled")
            await member.addRole(guild.inactiveRoleId, reasonStr)
        guild.users.delete(member.id)
        Logger.debugLog(`Updated now inactive user ${member.user.username}`)
    }

    private isInactiveBeyondThreshold(lastActiveDate: Date, now: Date, thresholdDays: number): boolean
    {
        const dayLength = 24 * 60 * 60 * 1000
        return Math.round(Math.abs(now.getTime() - lastActiveDate.getTime()) / dayLength) > thresholdDays
    }

    constructor(
        private client: LightClient,
    ) { }
}

if (!module.parent)
{
    const configPath = process.argv[2]
    const { config } = loadConfig(configPath)
    const client = new LightClient(config)
    const inactivityManager = new InactivityManager(client)
    client.login(config.token)
        .then(async () =>
        {
            await inactivityManager.manageInactiveUsersInAllGuilds()
            await client.destroy()
            await Logger.debugLog("Finished managing inactives, exiting worker")
            process.exit(0)
        })
        .catch(async err =>
        {
            await Logger.debugLogError("Error running the inactivity monitor", err)
            process.exit(1)
        })
}