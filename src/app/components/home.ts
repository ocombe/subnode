import {Component, Injectable, NgFor, ChangeDetectionStrategy} from 'angular2/angular2';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {RestService} from '../services/rest';
import {LoaderComponent} from "./loader";
import {TranslatePipe} from "ng2-translate/ng2-translate";
import {ShowComponent} from "./show";
import {RouterService} from "../services/router";

@Injectable()
@Component({
    selector: 'home',
    template: `
        <div class="home">
            <div class="page-header">
                <h2>
                    {{ 'LAST_EPISODES' | translate }}
                    <a class="refreshBtn glyphicon glyphicon-refresh" (click)="getLastEpisodes(true)"></a>
                    <loader class="pull-right" loader-id="home" loader-active="true" [hidden]="!showLoader"></loader>
                </h2>
            </div>

            <div class="lastEpisodes">
                <a class="card fade-in row" *ng-for="#file of lastEpisodes | async" [router-link]="routerService.normalize(['/Show', {id: file.showId}])">
                    <div class="col-lg-3 col-xs-12 card-block">
                        <div class="card-title">{{ file.showId }}</div>
                        <div class="card-text-wrapper">
                            <span class="card-text col-lg-12">{{ file.episode.season | number:'2.0-0' }}x{{ file.episode.episode | number:'2.0-0' }}</span>
                            <span class="card-subtitle col-lg-12">{{ file.ctime | date }}</span>
                        </div>
                    </div>
                    <div class="col-lg-9 col-xs-12 imgWrapper">
                        <img [src]="'api/banner/'+file.showId">
                    </div>
                </a>
            </div>
        </div>
	`,
    directives: [NgFor, LoaderComponent, ROUTER_DIRECTIVES],
    pipes: [TranslatePipe]
})
export class HomeComponent {
    /*onChanges(changes: {[hidden: string]: SimpleChange}) {
        console.log('on changes', changes);
    }*/
    lastEpisodes: Array<string> = [];
    showLoader: Boolean = false;

    constructor(private rest: RestService, private routerService: RouterService) {
        this.getLastEpisodes(false);
    }

    getLastEpisodes(refresh: Boolean) {
        this.showLoader = true;
        this.lastEpisodes = this.rest.get(`api/lastEpisodes/${refresh}`).toPromise().then((res: Array<string>) => {
            this.showLoader = false;
            return res;
        });
    }
}
