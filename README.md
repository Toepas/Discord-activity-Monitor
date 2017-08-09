# Discord activity monitor

A discord bot to assign/remove a role from users in your guild based on whether or not they have been active lately.

## Features

- Removes a role from a user who has not been active for a number of days
- Add the role to a user when they become active again (optional)
- Ignores specified users, eg if you don't want bots to be marked 'active'
- Configurable number of days before users are marked inactive

## Inviting the bot

Invite the bot to your server using [this link](https://discordapp.com/oauth2/authorize?client_id=337005754684932098&scope=bot&permissions=0x10000c00)

## Configuring the bot

1. Create a role (or choose an existing) to use to mark active users
2. Make your chosen role *mentionable* (only needed until setup is complete)
3. Put the bot's role *higher* in teh list than your chosen role
4. Run `@Activity_Monitor setup` in a channel the bot can *read* and *write* in
	- If you've nicknamed the bot, substitute `@Activity_Monitor` for it's nickname
5. Respond with the information the bot asks you for, until setup is complete

- You can view your guild settings with `@Activity_Monitor view-config`

Example:  
![example image](http://i.imgur.com/3W8jN4I.png)

## Permissions needed

| Permission     | Reason                                                                |
|----------------|-----------------------------------------------------------------------|
| Read messsages | Detect when people are active                                         |
| Send messages  | Used to ask setup questions (can be disabled after setup is complete) |
| Manage roles   | Assign and remove the active role from users                          |

## Need help?

Join my [support discord server](https://discord.gg/SSkbwSJ), or submit an issue via GitHub
