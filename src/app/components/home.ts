import {Component, Inject, NgFor, ChangeDetectionStrategy} from 'angular2/angular2';
import {RestService} from '../services/rest';
import ResolvedBinding = ng.ResolvedBinding;
import {LoaderComponent} from "./loader";
import {TranslatePipe} from "ng2-translate";

@Component({
    selector: 'home',
    bindings: [RestService],
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
                <div class="col-lg-12 card fade-in" *ng-for="#file of lastEpisodes | async">
                    <a [href]="'#show/' + file.showId">
                        <div class="col-lg-3">
                            <div class="card-block">
                                <h4 class="card-title">{{ file.showId }}</h4>
                                <h5 class="card-text">{{ file.episode.season | number:'2.0-0' }}x{{ file.episode.episode | number:'2.0-0' }}</h5>

                                <p class="card-text">{{ file.ctime | date }}</p>
                            </div>
                        </div>
                        <div class="col-lg-9 imgWrapper">
                            <img [src]="'banner/'+file.showId">
                        </div>
                    </a>
                </div>
            </div>
        </div>
	`,
    directives: [NgFor, LoaderComponent],
    pipes: [TranslatePipe]
})
export class HomeComponent {
    /*onChanges(changes: {[hidden: string]: SimpleChange}) {
        console.log('on changes', changes);
    }*/
    rest: RestService;
    lastEpisodes: Array<string> = [];
    showLoader: Boolean = false;

    getLastEpisodes(refresh: Boolean) {
        this.showLoader = true;
        this.lastEpisodes = this.rest.get(`lastEpisodes/${refresh}`).toPromise().then((res: Array<string>) => {
            this.showLoader = false;
            return res;
        });
    }

    constructor(@Inject(RestService) rest: RestService) {
        this.rest = rest;
        this.getLastEpisodes(false);
    }
}
