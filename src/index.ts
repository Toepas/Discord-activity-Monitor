import * as Joi from "@hapi/joi"
import * as Cluster from "cluster"
import { Client, forkWorkerClient, loadConfig, Logger } from "disharmony"
import { resolve } from "path"
import commands from "./commands"
import ActivityRegisterer from "./core/activity-registerer"
import ActivityMonitorConfig from "./models/activity-monitor-config"
import GuildMember from "./models/guild-member"
import Message from "./models/message"

const configSchema = Joi.object().keys({ cullingIntervalSec: Joi.number().required() })
const { config, configPath, isLocalDb } = loadConfig<ActivityMonitorConfig>(configSchema)

if (Cluster.isMaster)
{
    const client = new Client(commands, config!, Message, GuildMember)
    client.login(config.token)
        .then(() =>
        {
            new ActivityRegisterer(client).startListening()
            setInterval(runInactivityManager, config.cullingIntervalSec * 1000, client, !isLocalDb)
            runInactivityManager(client, !isLocalDb)
                .catch(err => Logger.debugLogError("Error running inactivity monitor for the first time. It is likely that subsequent executions will also error.", err))
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
        // tslint:disable-next-line: variable-name
        const InactivityManager = (await import(path)).default
        await new InactivityManager(client).manageInactiveUsersInAllGuilds()
        await Logger.debugLog("Finished managing inactives")
    }
}
