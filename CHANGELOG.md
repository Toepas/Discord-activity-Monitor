# Changelog
## v4.0.0-b1
Version 4.0 is a complete re-write of the bot using TypeScript and built on top of my [disharmony library](https://github.com/benji7425/disharmony).
This changelog entry does not assume knowledge of v3.5 or prior, and so list additions as if this is a new project.

### Added
- Integration with [disharmony](https://github.com/benji7425/disharmony)
- Command *setup* to configure parameters for the current server
- Command *view-config* to view current server configuration
- Activity timer monitoring for inactive detection
- Removal of 'active' role from user on inactivity
- Optional addition of 'inactive' role to user on inactivity
- Configurable option to ignore certain users/roles