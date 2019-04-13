import { Command, IClient, PermissionLevel, Logger } from "disharmony"
import Message from "../models/message";
import SetupHelper from "../core/setup-helper";

async function invoke(params: string[], message: Message, client: IClient)
{
    const setupHelper = new SetupHelper()

    try
    {
        await setupHelper.walkThroughSetup(client, message)
        message.guild.save()
        return "Setup complete!"
    }
    catch (e)
    {
        const friendlyMsg = `Error during setup for guild ${message.guild.name}.\n`
        Logger.debugLog(
            `${friendlyMsg}
                ${e.message || e}`,
            true)
        throw friendlyMsg
    }
}

module.exports = new Command(
    /*name*/            "setup",
    /*description*/     "Setup activity monitor for this server",
    /*syntax*/          "setup",
    /*permissionLevel*/ PermissionLevel.Admin,
    /*invoke*/          invoke
)