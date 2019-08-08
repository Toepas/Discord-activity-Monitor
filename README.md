[![Build status](https://badge.buildkite.com/0721103d18e2921880c1f18df491229eea35b2075e3d58b270.svg)](https://buildkite.com/benji7425-discord/activity-monitor)
# Discord Activity Monitor
<!--summary-->
A Discord bot to assign/remove a role from users in your guild based on whether or not they have been active lately
<!--/summary-->

## Features
<!--features-->
- Remove an 'active' role from a user who has not been active for a number of days
- Optionally assign an 'inactive' role to a user when they lose the 'active' role
- Optionally re-assign the 'active' role when a user who becomes active again
- Configure specific users or roles to be exempt from monitoring
- Configure threshold for inactivity
<!--/features-->

## Use cases
- Keep active members at the top of the members sidebar
- Reward active members for participating in the community
- Recognise how many inactive members your server has

## Getting started
### Invite
- By using this bot you agree to the terms laid out in the [Privacy & Terms](./docs/privacy-and-terms.md) document
- If you agree, you can use my [public invite](https://discordapp.com/oauth2/authorize?client_id=575115003875688448&scope=bot&permissions=268454912) to invite the bot to your server
- See the [self hosting section](#self-hosting) for details on running on your own server

### Setup
**Admin only**
Setup requires administrator permission in the Discord server
1. Create a role (or choose an existing one) to use to mark active users
2. Make your chosen role *mentionable* (only needed until setup is complete)
3. Put the bot's role *higher* in the list than your chosen role
4. Run `@Activity Monitor setup` in a channel the bot can *read* and *write* in
	- If you've nicknamed the bot, substitute `@Activity Monitor` for it's nickname
5. Respond with the information the bot asks you for, until setup is complete

- You can view your guild settings with `@Activity Monitor view-config`

Example:  
![Example setup](https://user-images.githubusercontent.com/14295333/61799425-01468d00-ae23-11e9-9e88-604eaa033a24.png)

### Permissions

The bot requires certain permissions, which you are prompted for on the invite screen.
Each permission has a reason for being required, explained below.

| Permission     | Reason                                                                |
|----------------|-----------------------------------------------------------------------|
| Read messsages | Detect when people are active                                         |
| Send messages  | Used to ask setup questions (can be disabled after setup is complete) |
| Manage roles   | Assign and remove the active role from users                          |
| Embed links    | Responses to 'help' requests use message embeds for nice formatting   |

## Self hosting
1. Install [Node.js v10](https://nodejs.org/en/) and 
2. Clone the repository, or download and extract the zip file (preferrably from the [release page](https://github.com/benji7425/discord-activity-monitor/releases))
3. Add a file named *token* in the root folder; paste in your bot token
3. Run `npm run full-start` to compile and run the bot
	- If you see yellow 'WARN' messages about peer dependencies, you can safely ignore these

**Note for git users**  
If you cloned the repository with git, make sure you `git reset --hard vX.Y` to a specific version, as latest master isn't always production ready!

### Database
- Out of the box the project uses [NeDB](https://github.com/louischatriot/nedb/) as a local database, storing the data in *./nedb-data*
- Both [NeDB](https://github.com/louischatriot/nedb/) and [MongoDB](https://www.mongodb.com) are supported
- Edit the connection string in [config.json](./config.json) or by setting the *DB_STRING* environment variable

### Docker
`docker run -v /path/to/logs:/app/logs -v /path/to/data:/app/nedb-data -e TOKEN="your-token-here" -e DB_STRING="your-db-string-here" benji7425/discord-activity-monitor`

- **Due to limitations with volume mounting cross-OS you cannost use a Windows host with the inbuilt NeDB database**
- View the image on Docker Hub [here](https://hub.docker.com/r/benji7425/discord-activity-monitor)
- You can omit the *DB_STRING* environment variable if using the default local *nedb-data* database
- You can omit the *nedb-data* volume mount if connecting to a MongoDB instance

## Need help?

I am available for contact via my [support Discord server](https://discordapp.com/invite/SSkbwSJ). I will always do my best to respond, however I am often busy so can't always be available right away, and as this is a free service I may not always be able to resolve your query.

## Built With
- [Node.js](https://nodejs.org/en/) - *Runtime*
- [discord.js](https://github.com/discordjs/discord.js) - *Discord library*
- [disharmony](https://github.com/benji7425/disharmony) - *Bot framework*

## Versioning
[SemVer](http://semver.org/) is used for versioning; view available versions on the [tags page](https://github.com/your/project/tags)

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details
