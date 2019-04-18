import { Client, Logger } from "disharmony"
import Message from "./models/message";
import * as Cluster from "cluster"
import ActivityRegisterer from "./core/activity-registerer";
import InactivityManager from "./core/inactivity-manager";

const token = require("fs").readFileSync("./token", "utf8")

if (Cluster.isMaster)
{
    const client = new Client("Role Assigner", require("./commands"), Message)
    new ActivityRegisterer(client).startListening()

    client.initialize(token)

    setTimeout(spawnInactiveUserManagementWorker, 24 * 60 * 60 * 1000)
}
else
{
    manageInactiveMembersInAllGuilds()
}

async function manageInactiveMembersInAllGuilds()
{
    const inactivityManager = new InactivityManager()
    await inactivityManager.connect(token)
    await inactivityManager.manageInactiveUsersInAllGuilds()
    await inactivityManager.disconnect();
    process.exit(0)
}

function spawnInactiveUserManagementWorker()
{
    const worker = Cluster.fork()
    Logger.debugLog(`Spawned process PID ${worker.process.pid} to manage inactive users`)
    const killWorker = () => worker.kill()

    process.on("SIGINT", killWorker)
    process.on("exit", killWorker)

    worker.on("exit", () =>
    {
        Logger.debugLog(`Process ${worker.process.pid} exited`)
        process.removeListener("SIGINT", killWorker)
        process.removeListener("exit", killWorker)
    })
}