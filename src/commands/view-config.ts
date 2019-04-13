import { Command, IClient, PermissionLevel } from "disharmony"
import Message from "../models/message";

async function invoke(params: string[], message: Message, client: IClient)
{
    return `\`\`\`JavaScript\n ${message.guild.configJson()}\`\`\``
}

module.exports = new Command(
    /*name*/            "view-config",
    /*description*/     "View configuration for this server",
    /*syntax*/          "view-config",
    /*permissionLevel*/ PermissionLevel.Admin,
    /*invoke*/          invoke
)