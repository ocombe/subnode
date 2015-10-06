import {Component, View, Inject} from 'angular2/angular2';
import {RouteParams} from 'angular2/router';

@Component({ selector: 'shows' })
@View({
    template: `
        <div>Show {{id}}</div>
  `,
})
export class ShowComponent {
    id: string;

    constructor(@Inject(RouteParams) params: RouteParams) {
        this.id = params.get('id');
    }

    onShowSelected() {

        return this.id;
    }
}
