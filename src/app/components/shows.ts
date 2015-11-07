import {Component, Injectable, Pipe, NgFor, NgClass, NgIf} from 'angular2/angular2';
import {RouteParams, OnActivate} from 'angular2/router';
import {TranslatePipe} from "ng2-translate/ng2-translate";
import {LoaderComponent} from "./loader";
import {Season} from "../interfaces/Season";
import {Show} from "../interfaces/Show";
import {RestService} from "../services/rest";

@Injectable()
@Component({
    template: `
    <div class="shows container">
        <div class="page-header">
            <h2>
                {{ 'SHOWS' | translate }}
            </h2>
        </div>

        <div class="page-body">
            <table class="table">
                <thead class="thead-inverse">
                <tr>
                    <th>ShowId</th>
                    <th>episodes</th>
                    <th>subtitles</th>
                </tr>
                </thead>
                <tbody>
                <tr *ng-for="#show of tvShows">
                    <td>{{show.showId}}</td>
                    <td>{{show.episodes}}</td>
                    <td>{{show.subtitles}}</td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
  `,
    directives: [NgFor, NgClass, LoaderComponent, NgIf],
    pipes: [TranslatePipe]
})
export class ShowsComponent implements OnActivate {
    onActivate(nextInstruction: ngRouter.ComponentInstruction, prevInstruction: ngRouter.ComponentInstruction): any {
        return this.refresh(); // init
    }
    private tvShows: Array<Show> = [];

    constructor(private rest: RestService) {
    }

    refresh() {
        this.tvShows = [];
        return this.rest.get(`api/showList/true`).toPromise().then((tvShows: Array<Show>) => {
            this.tvShows = _.sortBy(tvShows, 'showId');
        });
    }
}
