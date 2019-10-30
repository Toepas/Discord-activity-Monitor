import { DisharmonyGuildMember } from "disharmony"

export default class GuildMember extends DisharmonyGuildMember
{
    public get voiceChannelName(): string { return this.djs.voiceChannel && this.djs.voiceChannel.name || "" }
}