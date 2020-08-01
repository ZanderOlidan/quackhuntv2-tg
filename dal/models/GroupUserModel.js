export class GroupUserModel {
    constructor (o = {
        kills: 0,
        friends: 0,
        rejects: 0,
        name: ''
    }) {
        this.kills = o.kills || 0;
        this.friends = o.friends || 0;
        this.rejects = o.rejects || 0;
        this.name = o.name || '';
    }
}
