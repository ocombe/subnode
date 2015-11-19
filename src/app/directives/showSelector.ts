import {Component, View, ElementRef, Injectable, FORM_DIRECTIVES, NgFor, NgModel} from 'angular2/angular2';
import 'select2';
import {RestService} from "../services/rest";
import {Router, Location} from 'angular2/router';
import {RouterService} from "../services/router";
import {TranslateService} from "ng2-translate/ng2-translate";

/**
 * This directive applies select2 on the nav <select> element
 */
@Injectable()
@Component({
    selector: 'show-selector',
    providers: [RestService]
})
@View({
    template: `
        <select data-placeholder="">
            <option *ng-for="#show of showList" [value]="show">{{show}}</option>
        </select>
    `,
    directives: [FORM_DIRECTIVES, NgFor, NgModel]
})
export class ShowSelector {
    select: HTMLSelectElement;
    $select: JQuery;
    showList: Array<string> = [];
    lastValue: string;

    constructor(rest: RestService, element: ElementRef, private routerService: RouterService, private router: Router, location: Location, translate: TranslateService) {
        this.select = element.nativeElement.querySelector('select');

        this.$select = $(this.select).select2()
            .on('change', (e: JQueryEventObject) => {
                this.showSelected();
            });

        // update placeholder on lang change
        translate.onLangChange.subscribe((params: any) => {
            translate.get('SELECT_SHOW').subscribe((trad: string) => {
                setTimeout(() => {
                        $('.select2-selection__placeholder').text(trad);
                });
            });
        });

        rest.get('api/showList').toPromise().then((showList: Array<string>) => {
            this.showList = showList;
            if (_.startsWith(location.path(), '/show/')) {
                // wait for the select to be populated
                window.setTimeout(() => {
                    var showId = decodeURIComponent(location.path().replace('/show/', ''));
                    this.syncSelectedShow(showId);
                })
            }
        });

        router.subscribe((path: any) => {
            if(_.startsWith(path, 'show/')) {
                var showId = decodeURIComponent(path.replace('show/', ''));
                this.syncSelectedShow(showId);
            } else {
                this.lastValue = '';
                this.$select.select2('val', '');
            }
        })
    }

    showSelected() {
        if(this.select.value && this.select.value !== this.lastValue) {
            this.lastValue = this.select.value;
            this.routerService.navigate(['/Show', {id: this.select.value}]);
        }
    }

    syncSelectedShow(showId: string) {
        // route was activated by something else, we don't want to navigate
        this.lastValue = showId;
        this.$select.select2('val', showId);
    }
}
