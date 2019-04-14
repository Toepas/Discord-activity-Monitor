import { Client } from "disharmony"
import Message from "./models/message";
import * as Cluster from "cluster"
import ActivityRegisterer from "./core/activity-registerer";
import InactivityManager from "./core/inactivity-manager";

if (Cluster.isMaster)
{
    const client = new Client("Role Assigner", require("./commands"), Message)
    new ActivityRegisterer(client).startListening()

    client.initialize(require("fs").readFileSync("./token", "utf8"))

    const worker = Cluster.fork()

    process.on("SIGINT", () => worker.kill())
    process.on("exit", () => worker.kill())
}
else
{
    forked()
}

async function forked()
{
    console.log("Hello!")
    const inactivityManager = new InactivityManager()
    await inactivityManager.connect(require("fs").readFileSync("./token", "utf8"))
    await inactivityManager.manageInactiveUsers("264420391282409473")
}