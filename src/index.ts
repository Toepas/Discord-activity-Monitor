import { Client } from "disharmony"
import Message from "./models/message";
import ActivityRegisterer from "./core/activity-registerer";

const client = new Client("Role Assigner", require("./commands"), Message)
const activityMonitor = new ActivityRegisterer(client)

client.initialize(require("fs").readFileSync("./token", "utf8"))