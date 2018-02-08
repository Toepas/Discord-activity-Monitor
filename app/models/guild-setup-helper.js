const DiscordUtil = require("../../core").util;

const setupSteps = [
    {
        message: "How many days would you like to set the inactive threshold at?",
        action: (message, responseData) => {
            return new Promise((resolve, reject) => {
                //expect the message to be an integer value
                const response = parseInt(message.content);
                if (response && response > 0)
                    resolve(responseData.inactiveThresholdDays = response);
                else
                    reject("Value must be a whole number of days greater than 0");
            });
        }
    },
    {
        message: "Please @mention the role you with to use to indicate an *active* user",
        action: (message, responseData) => {
            return new Promise((resolve, reject) => {
                //expect the message to be in the format @<snowflake>
                if (message.mentions.roles.size > 0)
                    resolve(responseData.activeRoleID = message.mentions.roles.first().id);
                else
                    reject("You must @mention an existing role");
            });
        }
    },
    {
        message: "Would you like the bot to *add* people to this role if they send a message and *don't* already have it? (yes/no)",
        action: (message, responseData) => {
            return new Promise((resolve, reject) => {
                //expect the message to be "yes" or "no"
                const msg = message.content.toLowerCase();
                if (msg === "yes" || msg === "no")
                    resolve(responseData.allowRoleAddition = msg === "yes");
                else
                    reject("Please respond with either 'yes' or 'no'");
            });
        }
    },
    {
        message: "Pleas @mention the role you wish to use to indicate an *inactive* user, or type 'disable' if you don't want this feature",
        action: (message, responseData) => {
            return new Promise((resolve, reject) => {
                if (message.mentions.roles.size > 0)
                    resolve(responseData.inactiveRoleID = message.mentions.roles.first().id);
                else if (message.content.toLowerCase() === "disable")
                    resolve(responseData.inactiveRoleID = "disabled");
                else
                    reject("Please @mention a role or say 'disable'");
            });
        }
    },
    {
        message: "Please @mention any *members* or *roles* who are to be exempt from being marked/unmarked as active (or type 'none')",
        action: (message, responseData) => {
            return new Promise((resolve, reject) => {
                responseData.ignoredUserIDs = [];
                responseData.ignoredRoleIDs = [];
                if (message.mentions.members.size > 0 || message.mentions.roles.size > 0) {
                    message.mentions.members.forEach(member => responseData.ignoredUserIDs.push(member.id));
                    message.mentions.roles.forEach(role => responseData.ignoredRoleIDs.push(role.id));
                    resolve();
                }
                else if (message.content.toLowerCase() !== "none")
                    reject("Please either @mention some members or type 'none'");
                else
                    resolve();
            });
        }
    }
];

module.exports = class {
    constructor(message) {
        this.guild = message.channel.guild;
    }

    walkThroughSetup(client, textChannel, member, existingUsers) {
        return new Promise((resolve, reject) => {
            var responseData = {};
            //use a closure to count up the steps
            const askNext = (() => {
                let i = 0;
                return (overrideMsg) => {
                    if (i <= setupSteps.length - 1)
                        //ask in the channel and wait for the promised response before asking the next question
                        DiscordUtil.ask(client, textChannel, member, overrideMsg || setupSteps[i].message)
                            .then(response => {
                                setupSteps[i].action(response, responseData)
                                    .then(() => { i++; askNext(); })
                                    .catch(e => askNext(e));
                            }).catch(reject);
                    else
                        resolve({
                            inactiveThresholdDays: responseData.inactiveThresholdDays,
                            activeRoleID: responseData.activeRoleID,
                            inactiveRoleID: responseData.inactiveRoleID,
                            users: existingUsers || {},
                            allowRoleAddition: responseData.allowRoleAddition,
                            ignoredUserIDs: responseData.ignoredUserIDs,
                            ignoredRoleIDs: responseData.ignoredRoleIDs
                        });
                };
            })();
            askNext();
        });
    }
};