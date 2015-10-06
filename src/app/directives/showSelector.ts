import {Component, View, ElementRef, Inject, FORM_DIRECTIVES, NgFor, NgModel} from 'angular2/angular2';
import 'select2';
import {RestService} from "../services/rest";
import {Router, Location} from 'angular2/router';

/**
 * This directive applies select2 on the nav <select> element
 */
@Component({
    selector: 'show-selector',
    bindings: [RestService]
})
@View({
    template: `
        <select data-placeholder="Select a show">
            <option *ng-for="#show of showList" [value]="show">{{show}}</option>
        </select>
    `,
    directives: [FORM_DIRECTIVES, NgFor, NgModel]
})
export class ShowSelector {
    select: HTMLSelectElement;
    $select: JQuery;
    showList: Array<string> = [];
    router: Router;

    showSelected() {
        this.router.navigate(['./Show', {id: this.select.value}]);
    }

    //Todo: follow path changes to update the select
    constructor(@Inject(RestService) rest: RestService, @Inject(ElementRef) element: ElementRef, @Inject(Router) router: Router, @Inject(Location) location: Location) {
        this.router = router;
        this.select = element.nativeElement.querySelector('select');

        this.$select = $(this.select).select2()
            .on('change', e => {
                this.showSelected();
            });

        rest.get('showList').toPromise().then((showList: Array<string>) => {
            this.showList = showList;
            if(location.path().startsWith('/show/')) {
                // wait for the select to be populated
                window.setTimeout(() => {
                    var show = location.path().replace('/show/', '');
                    this.$select.select2('val', show);
                })
            }
        });
    }
}
