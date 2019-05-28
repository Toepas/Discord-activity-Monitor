import { Client, Logger, forkWorkerClient, loadConfig } from "disharmony"
import Message from "./models/message";
import * as Cluster from "cluster"
import ActivityRegisterer from "./core/activity-registerer";
import commands from "./commands"
import { resolve } from "path";

const { config, configPath, isLocalDb } = loadConfig()

if (Cluster.isMaster)
{
    const client = new Client(commands, Message, config!)
    client.initialize(config.token)
        .then(() =>
        {
            new ActivityRegisterer(client).startListening()
            setInterval(runInactivityManager, 24 * 60 * 60 * 1000, client, !isLocalDb);
            runInactivityManager(client, !isLocalDb)
        })
        .catch(async err =>
        {
            await Logger.consoleLogError("Error during initialisation", err)
            process.exit(1)
        })
}

async function runInactivityManager(client: Client<Message>, useForkedProcess: boolean)
{
    const path = "./core/inactivity-manager"
    if (useForkedProcess)
        forkWorkerClient(resolve(__dirname, path), configPath)
    else
    {
        const InactivityManager = (await import(path)).default
        await new InactivityManager(client).manageInactiveUsersInAllGuilds()
        await Logger.debugLog("Finished managing inactives")
    }
}