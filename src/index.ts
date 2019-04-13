import { Client } from "disharmony"
import Message from "./models/message";
import ActivityMonitor from "./core/activity-monitor";

const client = new Client("Role Assigner", require("./commands"), Message)
const activityMonitor = new ActivityMonitor(client)

client.initialize(require("fs").readFileSync("./token", "utf8"))