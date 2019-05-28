import { Command, PermissionLevel } from "disharmony"
import Message from "../models/message";

async function invoke(_: string[], message: Message)
{
    return `\`\`\`JavaScript\n ${message.guild.configJson()}\`\`\``
}

module.exports = new Command(
    /*syntax*/          "view-config",
    /*description*/     "View configuration for this server",
    /*permissionLevel*/ PermissionLevel.Admin,
    /*invoke*/          invoke
)