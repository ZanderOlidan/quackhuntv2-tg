export class GroupModel {
    constructor (o = {
        totalKills: 0,
        totalFriends: 0,
        totalRejections: 0
    }) {
        this.totalKills = o.totalKills;
        this.totalFriends = o.totalFriends;
        this.totalRejections = o.totalRejections;
    }
}
