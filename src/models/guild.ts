import { Role } from "discord.js"
import { BotGuild, BotGuildMember } from "disharmony"

export default class Guild extends BotGuild
{
    private _users: Map<string, Date>

    public get inactiveThresholdDays(): number { return this.record.inactiveThresholdDays || 7 }
    public set inactiveThresholdDays(value: number) { this.record.inactiveThresholdDays = value }

    public get activeRoleId(): string { return this.record.activeRoleId || "" }
    public set activeRoleId(value: string) { this.record.activeRoleId = value }

    public get activeRole() { return this.djs.roles.get(this.activeRoleId) }
    public get inactiveRole() { return this.djs.roles.get(this.inactiveRoleId) }

    public get inactiveRoleId(): string { return this.record.inactiveRoleId || "" }
    public set inactiveRoleId(value: string) { this.record.inactiveRoleId = value }

    public get allowRoleAddition(): boolean { return this.record.allowRoleAddition }
    public set allowRoleAddition(value: boolean) { this.record.allowRoleAddition = value }

    public get users(): Map<string, Date>
    {
        if (!this._users)
            this._users = new Map(this.record.users || [])
        return this._users
    }

    public ignoredUserIds: string[]
    public ignoredRoleIds: string[]

    public getConfigJson(): string
    {
        const blacklist = ["id", "_id", "users"]
        return JSON.stringify(
            this.toRecord(),
            (k, v) => blacklist.indexOf(k) < 0 ? v : undefined,
            "\t",
        )
    }

    public isMemberIgnored(member: BotGuildMember): boolean
    {
        const isIgnoredIndividually = this.ignoredUserIds.indexOf(member.id) >= 0
        const hasIgnoredRole = this.ignoredRoleIds.some(roleId => member.hasRole(roleId))
        return isIgnoredIndividually || hasIgnoredRole
    }

    public canBotManageRole(targetRole: Role): boolean
    {
        return !!this.me.djs.roles.find(role =>
            role.position > targetRole.position // Bot has a role higher than the target role...
            && role.hasPermission("MANAGE_ROLES")) // ...which has the permission to manage other roles
    }

    public isActiveRoleConfigured(): boolean
    {
        return (this.activeRoleId // Guild is configured with an active role
            && this.activeRoleId.length > 0 // Configured active role is valid snowflake
            && this.activeRole // Configured snowflake corresponds to a valid role
        ) as boolean
    }

    public isActiveRoleBadlyConfigured(): boolean
    {
        return this.isActiveRoleConfigured() && !this.canBotManageRole(this.activeRole!) // Role hierarchy is configured to allow the bot to manage this role
    }

    public isInactiveRoleConfigured(): boolean
    {
        return (this.inactiveRoleId // Guild is configured with an inactive role
            && this.inactiveRoleId.length > 0 // Configured inactive role is valid snowflake
            && this.inactiveRole // Configured snowflake corresponds to a valid role
        ) as boolean
    }

    public isInactiveRoleBadlyConfigured(): boolean
    {
        return this.isActiveRoleConfigured() && !this.canBotManageRole(this.inactiveRole!) // Role hierarchy is configured to allow the bot to manage this role
    }

    public loadRecord(record: any): void
    {
        this.ignoredUserIds = record.ignoredUserIds || []
        this.ignoredRoleIds = record.ignoredRoleIds || []
        return super.loadRecord(record)
    }

    public toRecord(): any
    {
        this.record.ignoredUserIds = this.ignoredUserIds
        this.record.ignoredRoleIds = this.ignoredRoleIds
        if (this._users)
            this.record.users = [...this._users.entries()]
        return super.toRecord()
    }
}