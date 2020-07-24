export class GroupUserModel {
    constructor (object) {
        this.kills = object.kills || 0;
        this.friends = object.friends || 0;
        this.rejects = object.rejects || 0;
    }
}
