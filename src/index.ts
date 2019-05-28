import { Client, Logger, forkWorkerClient, loadConfig } from "disharmony"
import Message from "./models/message";
import * as Cluster from "cluster"
import ActivityRegisterer from "./core/activity-registerer";
import commands from "./commands"
import { resolve } from "path";

const { config, configPath } = loadConfig()

if (Cluster.isMaster)
{
    const client = new Client(commands, Message, config!)
    client.initialize(config.token)
        .then(() =>
        {
            new ActivityRegisterer(client).startListening()
            setTimeout(runInactivityManager, 24 * 60 * 60 * 1000);
        })
        .catch(err =>
        {
            (Logger.consoleLogError("Error during initialisation", err) as Promise<void>)
                .then(() => process.exit(1)).catch(() => process.exit(1))
        })
}

async function runInactivityManager(client: Client<Message>, useForkedProcess: boolean)
{
    const path = "./core/inactivity-manager"
    if (useForkedProcess)
        forkWorkerClient(resolve(__dirname, path), configPath)
    else
    {
        const InactivityMonitor = (await import(path)).default
        await new InactivityMonitor(client).manageInactiveUsersInAllGuilds()
        process.exit(0)
    }
}