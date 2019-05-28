import { Command, IClient, PermissionLevel, Logger, CommandRejection } from "disharmony"
import Message from "../models/message";
import SetupHelper from "../core/setup-helper";

async function invoke(_: string[], message: Message, client: IClient)
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
        throw new CommandRejection(`Error during setup for guild ${message.guild.name}.\n`)
    }
}

export default new Command(
    /*syntax*/          "setup",
    /*description*/     "Setup activity monitor for this server",
    /*permissionLevel*/ PermissionLevel.Admin,
    /*invoke*/          invoke
)