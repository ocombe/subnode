import {Component, Injectable, NgFor, ChangeDetectionStrategy, OnDestroy, NgZone} from 'angular2/angular2';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {RestService} from '../services/rest';
import {LoaderComponent} from "./loader";
import {TranslatePipe} from "ng2-translate/ng2-translate";
import {ShowComponent} from "./show";
import {RouterService} from "../services/router";
import {SocketService} from "../services/socket";

@Injectable()
@Component({
    selector: 'home',
    template: `
        <div class="home container">
            <div class="page-header">
                <h2>{{ 'LAST_EPISODES' | translate }}</h2>
                <small class="text-muted" [hidden]="scanDone">{{ 'INITIAL_SCAN' | translate }}</small>
            </div>

            <div class="page-body">
                <a class="card fade-in" *ng-for="#file of lastEpisodes | async" [router-link]="routerService.normalize(['/Show', {id: file.showId}])">
                    <div class="img-wrapper hidden-lg-up">
                        <img [src]="'api/image/poster/'+file.showId+'/thumb'">
                    </div>
                    <div class="card-block">
                        <div class="card-title">{{ file.showId }}</div>
                        <div class="card-text-wrapper">
                            <span class="card-text">{{ file.season | number:'2.0-0' }}x{{ file.episode | number:'2.0-0' }}</span>
                            <span class="card-subtitle">{{ file.ctime | date }}</span>
                        </div>
                    </div>
                    <div class="img-wrapper hidden-md-down">
                        <img [src]="'api/image/banner/'+file.showId+'/full'" [alt]="file.showId">
                    </div>
                </a>
            </div>
        </div>
	`,
    directives: [NgFor, LoaderComponent, ROUTER_DIRECTIVES],
    pipes: [TranslatePipe]
})
export class HomeComponent implements OnDestroy {
    onDestroy() {
        // clean up socket listeners
        SocketService.off('scan:new');
        SocketService.off('scan:status');
    }

    lastEpisodes: Array<string> = [];
    scanDone: Boolean = false;

    constructor(private rest: RestService, private routerService: RouterService, private ngZone: NgZone) {
        this.getLastEpisodes().then(() => {
            SocketService.on('scan:new', () => {
                this.scanDone = true;
                this.getLastEpisodes();
            });

            SocketService.on('scan:status', (status: string) => {
                this.scanDone = status === 'done';
            });

            // ask for status
            SocketService.socket.emit('scan:status');
        });
    }

    // todo add websockets support & memoize the results
    getLastEpisodes() {
        return this.lastEpisodes = this.rest.get(`api/lastEpisodes`).toPromise().then((res: Array<string>) => {
            return res;
        });
    }
}
