import {Component, View, Inject, NgFor} from 'angular2/angular2';
import {RestService} from '../services/rest';
import ResolvedBinding = ng.ResolvedBinding;

@Component({
    selector: 'home',
    bindings: [RestService]
})
@View({
    template: `
        <div class="home">
            <div class="page-header">
                <h2>
                    Derniers épisodes
                    <a class="refreshBtn glyphicon glyphicon-refresh" (click)="getLastEpisodes(true)"></a>
                    <loader class="pull-right" loader-id="home" loader-active="true"></loader>
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
    directives: [NgFor]
})
export class HomeComponent {
    rest: RestService;
    lastEpisodes: Array<string> = [];

    getLastEpisodes(refresh: Boolean) {
        this.lastEpisodes = this.rest.get(`lastEpisodes/${refresh}`).toPromise();
    }

    constructor(@Inject(RestService) rest: RestService) {
        this.rest = rest;
        this.getLastEpisodes(false);
    }
}
