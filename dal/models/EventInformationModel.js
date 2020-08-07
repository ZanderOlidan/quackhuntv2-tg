export class EventInformationModel {
    constructor (o = {
        title: '',
        image: '',
        content: ''
    }) {
        this.title = o.title || '';
        this.image = o.image || '';
        this.content = o.content || '';
    }
}
