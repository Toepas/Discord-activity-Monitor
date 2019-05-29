import { Command, CommandRejection, IClient, Logger, PermissionLevel } from "disharmony"
import SetupHelper from "../core/setup-helper";
import Message from "../models/message";

async function invoke(_: string[], message: Message, client: IClient)
{
    const setupHelper = new SetupHelper()

    try
    {
        await setupHelper.walkThroughSetup(client, message)
        await message.guild.save()
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
    /*invoke*/          invoke,
)