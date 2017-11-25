# Discord activity monitor

<!--summary-->
A discord bot to assign/remove a role from users in your guild based on whether or not they have been active lately.
<!--/summary-->

## Features

<!--features-->
- Removes a role from a user who has not been active for a number of days
- Add the role to a user when they become active again (optional)
- Ignores specified users, eg if you don't want bots to be marked 'active'
- Configurable number of days before users are marked inactive
<!--/features-->

## Invite

By inviting this bot to your server you agree to the [terms and conditions](#privacy-statement) laid out in the privacy section of this document.  
If you agree, invite to your server with [this link](https://discordapp.com/oauth2/authorize?client_id=337005754684932098&scope=bot&permissions=0x10004c00).

## Setup

1. Create a role (or choose an existing) to use to mark active users
2. Make your chosen role *mentionable* (only needed until setup is complete)
3. Put the bot's role *higher* in teh list than your chosen role
4. Run `@Activity Monitor setup` in a channel the bot can *read* and *write* in
	- If you've nicknamed the bot, substitute `@Activity Monitor` for it's nickname
5. Respond with the information the bot asks you for, until setup is complete

- You can view your guild settings with `@Activity Monitor view-config`

Example:  
![example image](http://i.imgur.com/3W8jN4I.png)

## Permissions

The bot requires certain permissions, which you are prompted for on the invite screen.
Each permission has a reason for being required, explained below.

| Permission     | Reason                                                                |
|----------------|-----------------------------------------------------------------------|
| Read messsages | Detect when people are active                                         |
| Send messages  | Used to ask setup questions (can be disabled after setup is complete) |
| Manage roles   | Assign and remove the active role from users                          |
| Embed links    | Responses to 'help' requests use message embeds for nice formatting   |

## Privacy statement

In accordance with the [Discord developer Terms of Service](https://discordapp.com/developers/docs/legal), by inviting this bot to your Discord server you agree that this bot may collect and store the relevant data needed to function, including but not limited to:

- Details about the server being joined (server name, server ID, server roles and permissions)  
- Details about the users in the server (usernames, nicknames and user IDs)  
- The contents of messages necessary to function (invoked commands and their parameters)  

This bot will only collect data which is necessary to function.  
No data collected will be shared with any third parties.  

Should you wish for the data stored about your server to be removed, please contact me via [my support Discord server](https://discordapp.com/invite/SSkbwSJ) and I will oblige as soon as I am able. Please note that this will require you to remove the bot from your server.

## Want to host your own instance?

1. Clone the repository, or download and extract the zip file (preferrably from the release page)
2. Make sure you have *npm* and *git* installed
3. Run `npm install`
4. Add *token.json* in the root folder: `{ "token": "your-token-goes-here" }`
5. Run `npm start`

**Note for git users**  
If you cloned the repository with git, make sure you `git reset --hard vX.Y` to a specific version, as latest master isn't always production ready!

## Need help?

I am available for contact via my [support Discord server](https://discordapp.com/invite/SSkbwSJ). I will always do my best to respond, however I am often busy so can't always be available right away, and as this is a free service I may not always be able to resolve your query.
