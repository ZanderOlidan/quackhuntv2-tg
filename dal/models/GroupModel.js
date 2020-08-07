export class GroupModel {
    constructor (o = {
        totalKills: 0,
        totalFriends: 0,
        totalRejecs: 0,
        events: 0
    }) {
        this.totalKills = o.totalKills || 0;
        this.totalFriends = o.totalFriends || 0;
        this.totalRejects = o.totalRejects || 0;
        this.events = {};
    }
}
