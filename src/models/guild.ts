import { BotGuild } from "disharmony"

export default class Guild extends BotGuild
{
    private _users: Map<string, Date>

    get inactiveThresholdDays(): number { return this.record.inactiveThresholdDays || 7 }
    set inactiveThresholdDays(value: number) { this.record.inactiveThresholdDays = value }

    get activeRoleId(): string { return this.record.activeRoleId || "" }
    set activeRoleId(value: string) { this.record.activeRoleId = value }

    get activeRole() { return this.djs.roles.get(this.activeRoleId) }

    get inactiveRoleId(): string { return this.record.inactiveRoleId || "" }
    set inactiveRoleId(value: string) { this.record.inactiveRoleId = value }

    get allowRoleAddition(): boolean { return this.record.allowRoleAddition }
    set allowRoleAddition(value: boolean) { this.record.allowRoleAddition = value }

    get ignoredUserIds(): string[] { return this.record.ignoredUserIds = this.record.ignoredUserIds || [] }
    get ignoredRoleIds(): string[] { return this.record.ignoredRoleIds = this.record.ignoredRoleIds || [] }

    get users(): Map<string, Date>
    {
        if (!this._users)
            this._users = new Map(this.record.users || [])
        return this._users
    }

    public configJson()
    {
        const blacklist = ["id", "_id", "users"]
        return JSON.stringify(
            this.toRecord(),
            (k, v) => blacklist.indexOf(k) < 0 ? v : undefined,
            "\t"
        )
    }

    public toRecord()
    {
        this.record.users = this._users ? [...this._users.entries()] : []
        return super.toRecord()
    }
}