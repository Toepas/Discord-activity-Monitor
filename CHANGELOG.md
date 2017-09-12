# Changelog

## v3.0.0-b1

### Added

- Fancy new @bot help command

### Updated

- Significant back-end command handling updates

## v2.2.1

### Added

- Added ability to pass in configuration object on startup

## v2.2.0

### Added
- Automatic tracking of people who have the role, even if it wasn't the bot who assigned it to them
- Ability to make entire roles exempt from being marked/unmarked as active
- `@Activity_Monitor view-config` command to view guild settings

### Updated
- Setup
	- Now started with `@Activity_Montitor setup`
	- Now warns you if you respond with invalid answers

## v2.1.3

### Fixed
- Fix seemingly random crashes during message detection

## v2.1.2

### Added

- "Playing" indicator with my website url

## v2.1.1

### Fixed

- Fixed issue where data being present for a user who had left the respective guild caused an exception, stopping other users from being processed

## v2.1.0

### Updated

- Refactored a bunch of code for stability improvements

### Fixed

- Fixed some issues with setup not running properly

## v2.0.1

### Fixed

- Bot able to get stuck in setup mode forever
- Bot replying to itself if it has admin permissions
- Incorrect reply formats during setup causing various problems

## v2.0.1

### Updated

- Any administrator can now perform the setup

### Fixed

- Fixed issue where guild could enter setup multiple times
- Fixed a couple of errors that caused the bot to crash when it should have just logged them

## v2.0.0

### Updated

- Updated core library to use discord.js rather than discord.io (discord.js handles rate limiting automatically)
- Updated bot to support multiple guilds, rather than requiring a new instance for each one

## Added

- Guild setup helper via in-chat commands

### Fixed

- Fixed rate limit issues when assigning/removing roles from users (by switching to discord.js)
- Prevent attempt to re-assign existing roles to users
- Add date + time to logged errors

## v1.2.0

### Added

- Add config option to ignore certain IDs

## v1.1.0

### Added

- Command to register all existing users with the "active" role assigned to them with last active time as "now"
	- Useful when setting up the bot for the first time, and the role is already in use

## v1.0.0

### Features

- Assigns users a role to mark them as active when they send a message or join a voice channel
- Checks at a configurable interval to see if any users have been inactive for longer than a configurable threshold
- Users have the "active" role removed after a configurable period of inactivity