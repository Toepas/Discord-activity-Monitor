import { Message as BotMessage } from "disharmony"
import Guild from "./guild";
import { Message as DjsMessage } from "discord.js"

export default class Message extends BotMessage
{
    readonly guild: Guild

    constructor(djsMessage: DjsMessage)
    {
        super(djsMessage)
        this.guild = new Guild(djsMessage.guild)
    }
}