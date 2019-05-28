import Guild from "../models/guild";
import { Logger, LightClient, loadConfig } from "disharmony";

export default class InactivityManager
{
    public async manageInactiveUsersInAllGuilds()
    {
        Logger.debugLog("Beginning guild iteration to manage inactive users")
        for (let guild of this.client.djs.guilds.values())
            await this.manageInactiveUsersInGuild(guild.id)
        Logger.debugLog("Guilds iteration complete")
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
                    Logger.debugLogError(`Error switching user ${member.user.username} to inactive in guild ${guild.name}`, e)
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

    constructor(
        private client: LightClient
    ) { }
}

if (!module.parent)
{
    const configPath = process.argv[2]
    const { config } = loadConfig(configPath)
    const client = new LightClient(config)
    const inactivityManager = new InactivityManager(client)
    client.initialize(config.token)
        .then(async () =>
        {
            await inactivityManager.manageInactiveUsersInAllGuilds()
            await client.destroy()
            process.exit(0)
        })
        .catch(async err =>
        {
            await (Logger.debugLogError("Error running the inactivity monitor", err) as Promise<void>)
            process.exit(1)
        })
}