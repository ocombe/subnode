import {Component, Injectable, Pipe, NgFor, NgClass, NgIf} from 'angular2/angular2';
import {RouteParams, OnActivate} from 'angular2/router';
import {RestService, RestResponse} from "../services/rest";
import {SeasonPipe} from "../pipes/season";
import {QualitySortPipe} from "../pipes/qualitySort";
import {LoaderComponent} from "./loader";
import {Subtitle, SubtitlePack} from "../interfaces/Subtitle";
import {Episode} from "../interfaces/Episode";
import {Season} from "../interfaces/Season";
import {TranslatePipe} from "ng2-translate/ng2-translate";
import {ParamsComponent} from "./params";

@Injectable()
@Component({
    selector: 'shows',
    template: `
        <div class='show'>
            <div class="page-header">
                <img [src]="'api/banner/' + showId" image-fallback="showId" overview="showInfo.tvShow.overview">
            </div>

            <ul class="nav nav-tabs">
              <li class="nav-item" *ng-for="#epList of tvShowData" (click)="seasonFilter = epList.season">
                <span class="nav-link" [ng-class]="{active: seasonFilter == epList.season}">
                    {{ 'SEASON' | translate }} {{epList.season }}
                    <span *ng-if="epList.missingSubs > 0" class="badge pull-right">{{ epList.missingSubs }}</span>
                </span>
              </li>
            </ul>

            <div class="episodesList">
                <div class="card list-group epListWrapper" *ng-for="#epList of tvShowData | season:seasonFilter">
                    <div *ng-for="#ep of epList.episodes" class="episode alert" [ng-class]="{'alert-success': ep.subtitle, 'alert-warning': !ep.subtitle}">
                        <div class="name ellipsis" (click)="searchSubs(ep)">
                            <b>{{ ep.season | number:'2.0-0' }}x{{ ep.episode | number:'2.0-0' }}</b> - {{ ep.name }}
                        </div>
                        <i [hidden]="loading && selectedEpisode === ep" *ng-if="ep.subtitle" class="glyphicon glyphicon-paperclip"></i>
                        <loader [hidden]="!loading" *ng-if="selectedEpisode === ep"></loader>

                        <div class="subtitlesList col-xs-12 fade-in" *ng-if="selectedEpisode === ep">
                            <div class="card" [hidden]="subList.length !== 0 || !loadingDone">
                                <div class="no-subtitle name">{{ 'NO_RESULT' | translate }}</div>
                            </div>
                            <div class="card list-group subPackWrapper fade-in" *ng-for="#subPack of subList | qualitySort">
                                <div class="card-header qualite{{ subPack.quality }}">
                                    <span class="label pull-right qualite{{ subPack.quality }}">{{ 'SOURCE' | translate }}: {{ subPack.source }}</span>
                                    {{ subPack.file }}
                                </div>
                                <a *ng-for="#sub of subPack.content" class="subtitle list-group-item" (click)="downloadSub(sub, subPack, $event)">
                                    <div class="name">
                                        <span class="label">{{ sub.score }}</span> {{ sub.name }}
                                        <i *ng-if="sub === selectedEpisode.subtitle" class="success glyphicon glyphicon-ok"></i>
                                    </div>
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
  `,
    directives: [NgFor, NgClass, LoaderComponent, NgIf],
    pipes: [SeasonPipe, QualitySortPipe, TranslatePipe]
})
export class ShowComponent implements OnActivate {
    onActivate(nextInstruction: ngRouter.ComponentInstruction, prevInstruction: ngRouter.ComponentInstruction): any {
        return this.refresh(); // init
    }

    rest: RestService;
    showId: string;
    selectedEpisode: Episode;
    tvShowData: Array<Season> = [];
    subList: Array<Subtitle> = [];
    missingSubs: number = 0;
    seasonFilter: number;
    loading: Boolean = false;
    loadingDone: Boolean = false;

    constructor(private params: RouteParams, private rest: RestService) {
        this.rest = rest;
        this.showId = params.get('id');
    }

    updateMissingSubs() {
        _.each(this.tvShowData, (epList: Season) => {
            epList.missingSubs = this.unsubs(epList.episodes);
        });
    }

    refresh() {
        this.tvShowData = [];
        return this.rest.get('api/show/' + this.showId).toPromise().then((show: Array<Season>) => {
            this.tvShowData = show.reverse();
            this.updateMissingSubs();
            if(show.length > 0) {
                this.seasonFilter = show[0].season; // default filter on last season
            }
            //$("#selectedTVShow").val(this.showList.indexOf(this.showId)).trigger('liszt:updated');
        });
    }

    unsubs(episodes: Array<Episode>) {
        return _.filter(episodes, ep => typeof ep.subtitle === 'undefined').length;
    }

    searchSubs(ep: Episode) {
        if(ep === this.selectedEpisode) {
            this.selectedEpisode = undefined;
            return;
        }
        this.loading = true;
        this.loadingDone = false;
        this.selectedEpisode = ep;
        this.subList = [];

        var showSubs = (subtitles: Array<Subtitle>) => {
            if(subtitles[0] && subtitles[0].content[0].episode === this.selectedEpisode.episode && subtitles[0].content[0].season === this.selectedEpisode.season) {
                this.subList = this.subList.concat(subtitles);
            }
        };

        var providers: Array<any> = [];
        if(ParamsComponent.appParams.providers.indexOf('addic7ed') !== -1) {
            providers.push(this.rest.get('api/addic7ed/' + this.showId + '/' + ep.name).toPromise().then(showSubs));
        }

        if(ParamsComponent.appParams.providers.indexOf('betaSeries') !== -1) {
            providers.push(this.rest.get('api/betaSeries/' + this.showId + '/' + ep.name).toPromise().then(showSubs));
        }

        Promise.all(providers).then(() => {
            this.loading = false;
            this.loadingDone = true;
        });
    }

    downloadSub(sub: Subtitle, subPack: SubtitlePack, $event: MouseEvent) {
        this.loading = true;
        this.rest.post('api/download', {
            episode: this.selectedEpisode.file,
            url: subPack.url,
            subtitle: sub.file
        }).toPromise().then((res: RestResponse) => {
            this.loading = false;
            var $name = $($event.target),
                $icons = $name.find('i');
            if($icons.length > 0) {
                $icons.remove();
            }
            if(res.success) {
                this.selectedEpisode.subtitle = sub;
                this.updateMissingSubs();
            }
        });
    }
}
