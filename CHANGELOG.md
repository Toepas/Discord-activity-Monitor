# Changelog
## v4.0.0
Version 4.0 is a complete re-write of the bot using TypeScript and built on top of my [disharmony library](https://github.com/benji7425/disharmony).
This changelog entry does not assume knowledge of v3.5 or prior, and so list additions as if this is a new project.

### Added
- Integration with [disharmony](https://github.com/benji7425/disharmony)
- Command *setup* to configure parameters for the current server
- Command *view-config* to view current server configuration
- Addition of 'active' role to member when message or voice activity detected
- Removal of 'active' role from member after no activity detected for configured duration
- Optional addition of 'inactive' role when 'active' role removed
- Configurable option to ignore certain users/roles
- Audit log reason messages when roles are added/removed
- Event logging for some key events