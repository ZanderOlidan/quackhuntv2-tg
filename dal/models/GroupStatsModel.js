export class GroupStatsModel {
    constructor (o = {
        topKillers: [],
        topFriendlies: [],
        topRejections: []
    }) {
        this.topKillers = o.topKillers || [];
        this.topFriendlies = o.topFriendlies || [];
        this.topRejections = o.topRejections || [];
    }
}
