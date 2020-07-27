export class GroupUserModel {
    constructor (object) {
        this.kills = 0;
        this.friends = 0;
        this.rejects = 0;

        if (object) {
            this.kills = object.kills || 0;
            this.friends = object.friends || 0;
            this.rejects = object.rejects || 0;
        }
    }
}
