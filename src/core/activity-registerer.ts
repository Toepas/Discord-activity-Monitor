import { Client, BotGuildMember, Logger } from "disharmony";
import Message from "../models/message";
import Guild from "../models/guild";

export default class ActivityRegisterer
{
    private async registerActivity(guild: Guild, member: BotGuildMember)
    {
        await guild.loadDocument()
        if (guild
            && member && member.id != this.client.botId
            && this.isGuildSetUp(guild))
        {
            guild.users.set(member.id, new Date())
            await this.markActiveIfNotIgnored(guild, member, true)
            guild.save()
        }
    }

    private async markActiveIfNotIgnored(guild: Guild, member: BotGuildMember, isActive: boolean)
    {
        const addRole = isActive ? guild.activeRoleId : guild.inactiveRoleId
        const removeRole = isActive ? guild.inactiveRoleId : guild.activeRoleId

        try
        {
            if (this.isMemberIgnored(guild, member))
                return

            if (addRole && addRole !== "disabled")
                await member.addRole(addRole);

            if (removeRole && removeRole !== "disabled")
                await member.removeRole(removeRole)
        }
        catch (e)
        {
            Logger.consoleLog(
                `Error marking user ${member.username} ${isActive ? "active" : "inactive"} in guild ${guild.name}.
                    ${e.message || e}`,
                true)
        }
    }

    private isMemberIgnored(guild: Guild, member: BotGuildMember)
    {
        const isIgnoredUser = guild.ignoredUserIds.indexOf(member.id) >= 0
        const hasIgnoredRole = guild.ignoredRoleIds.some(roleId => member.hasRole(roleId))
        return isIgnoredUser || hasIgnoredRole
    }

    private isGuildSetUp(guild: Guild)
    {
        return guild.allowRoleAddition && guild.activeRoleId && guild.activeRoleId.length > 0
    }

    constructor(
        private client: Client<Message>
    )
    {
        this.client.onMessage.sub(message => this.registerActivity(message.guild, message.member))
        this.client.onVoiceStateUpdate.sub(member => this.registerActivity(new Guild(member.djsGuild), member))
    }
}