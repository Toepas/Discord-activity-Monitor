import { BotGuildMember, Client, Logger } from "disharmony";
import Guild from "../models/guild";
import GuildMember from "../models/guild-member";
import Message from "../models/message";

export default class ActivityRegisterer
{
    public startListening()
    {
        this.client.onMessage.sub(
            message => this.registerActivity(message.guild, message.member, message.textChannelName))
        this.client.onVoiceStateUpdate.sub(
            args => this.registerActivity(
                new Guild(args.newMember.djs.guild),
                args.newMember,
                args.newMember.voiceChannelName || args.oldMember.voiceChannelName))
    }

    private async registerActivity(guild: Guild, member: GuildMember, channelName: string)
    {
        await guild.loadDocument()
        if (guild
            && member && member.id !== this.client.botId
            && this.isGuildSetUp(guild))
        {
            guild.users.set(member.id, new Date())
            await this.markActiveIfNotIgnored(guild, member, channelName)
            await guild.save()
        }
    }

    private async markActiveIfNotIgnored(guild: Guild, member: GuildMember, channelName: string)
    {
        try
        {
            if (this.isMemberIgnored(guild, member))
                return

            await member.djs.addRole(guild.activeRoleId, `Activity detected in ${channelName}.`);

            if (guild.inactiveRoleId && guild.inactiveRoleId !== "disabled")
                await member.removeRole(guild.inactiveRoleId)
        }
        catch (e)
        {
            Logger.debugLogError(`Error marking user ${member.username} active in guild ${guild.name}.`, e)
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
        private client: Client<Message, GuildMember>,
    ) { }
}