import { BotGuildMember } from "disharmony"

export default class GuildMember extends BotGuildMember
{
    public get voiceChannelName(): string { return this.djs.voiceChannel && this.djs.voiceChannel.name || "" }
}