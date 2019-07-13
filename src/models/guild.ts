import { BotGuild, BotGuildMember } from "disharmony"

export default class Guild extends BotGuild
{
    private _users: Map<string, Date>

    public get inactiveThresholdDays(): number { return this.record.inactiveThresholdDays || 7 }
    public set inactiveThresholdDays(value: number) { this.record.inactiveThresholdDays = value }

    public get activeRoleId(): string { return this.record.activeRoleId || "" }
    public set activeRoleId(value: string) { this.record.activeRoleId = value }

    public get activeRole() { return this.djs.roles.get(this.activeRoleId) }

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

    public getConfigJson()
    {
        const blacklist = ["id", "_id", "users"]
        return JSON.stringify(
            this.toRecord(),
            (k, v) => blacklist.indexOf(k) < 0 ? v : undefined,
            "\t",
        )
    }

    public isMemberIgnored(member: BotGuildMember)
    {
        const isIgnoredIndividually = this.ignoredUserIds.indexOf(member.id) >= 0
        const hasIgnoredRole = this.ignoredRoleIds.some(roleId => member.hasRole(roleId))
        return isIgnoredIndividually || hasIgnoredRole
    }

    public loadRecord(record: any)
    {
        this.ignoredUserIds = record.ignoredUserIds || []
        this.ignoredRoleIds = record.ignoredRoleIds || []
        return super.loadRecord(record)
    }

    public toRecord()
    {
        this.record.ignoredUserIds = this.ignoredUserIds
        this.record.ignoredRoleIds = this.ignoredRoleIds
        this.record.users = this._users ? [...this._users.entries()] : []
        return super.toRecord()
    }
}