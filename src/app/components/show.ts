import {Component, Injectable, Pipe, NgFor, NgClass, NgIf, NgStyle} from 'angular2/angular2';
import {RouteParams} from 'angular2/router';
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
    template: `
        <div class='show'>
            <div class="page-header" [ng-style]="{'background-image': 'url(api/image/fanart/'+ showId + '/medium)'}">

                <div class="title-wrapper">
                    <img class="poster" [src]="'api/image/poster/'+showId+'/thumb'" [alt]="showId">
                    <h1 class="title">
                        {{tvShowData.title || showName}}
                        <span class="year" *ng-if="tvShowData.year">{{tvShowData.year}}</span>
                    </h1>
                </div>
            </div>

            <div class="page-body container">
                <div *ng-if="!seasons.length && !loading" class="alert alert-danger text-center">No data for this show. Are you sure that the name is correct ?</div>
                <div *ng-if="!seasons.length && loading" class="text-center"><loader></loader> Loading data...</div>

                <div class="dropdown seasons-list hidden-sm-up" *ng-if="seasons.length">
                    <button class="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown">
                        {{ 'SEASON' | translate }} {{ seasonFilter }}
                    </button>
                    <div class="dropdown-menu">
                        <a class="dropdown-item" *ng-for="#epList of seasons" [ng-class]="{active: seasonFilter == epList.season}" (click)="seasonFilter = epList.season">
                            {{ 'SEASON' | translate }} {{epList.season }}
                            <span *ng-if="epList.missingSubs > 0" class="badge pull-right">{{ epList.missingSubs }}</span>
                        </a>
                    </div>
                </div>

                <ul class="nav nav-tabs seasons-list hidden-xs-down" *ng-if="seasons.length">
                  <li class="nav-item" *ng-for="#epList of seasons" (click)="seasonFilter = epList.season">
                    <span class="nav-link" [ng-class]="{active: seasonFilter == epList.season}">
                        {{ 'SEASON' | translate }} {{epList.season }}
                        <span *ng-if="epList.missingSubs > 0" class="badge pull-right">{{ epList.missingSubs }}</span>
                    </span>
                  </li>
                  <!--<li class="nav-item pull-right" (click)="refresh(true)" title="{{ 'REFRESH' | translate }}">-->
                    <!--<span class="nav-link">-->
                        <!--<i class="glyphicon glyphicon-refresh"></i>-->
                    <!--</span>-->
                  <!--</li>-->
                </ul>

                <div class="episodes-list" *ng-if="seasons.length">
                    <div class="card list-group epListWrapper" *ng-for="#epList of seasons | season:seasonFilter">
                        <div *ng-for="#ep of epList.episodes" class="episode alert" [ng-class]="{'alert-success': ep.subtitle, 'alert-warning': !ep.subtitle}">
                            <div class="episode-header">
                                <button class="one-click-dl btn btn-secondary" [disabled]="ep.downloading" (click)="oneClickDownload(ep)"><i class="glyphicon glyphicon-download-alt"></i> <span class="title">{{ 'ONE_CLICK_DL' | translate }}</span></button>
                                <div class="name ellipsis" (click)="searchSubs(ep)">
                                    <b>{{ ep.season | number:'2.0-0' }}x{{ ep.episode | number:'2.0-0' }}</b> - {{ ep.name }}
                                </div>
                                <i [hidden]="ep.loading" *ng-if="ep.subtitle" class="glyphicon glyphicon-paperclip" [title]="ep.subtitle.name"></i>
                                <loader [hidden]="!ep.loading"></loader>
                            </div>

                            <div class="subtitlesList col-xs-12 fade-in" [ng-class]="{disabled: ep.downloading}" *ng-if="selectedEpisode === ep && subList && (subList.length > 0 || !ep.loading)">
                                <div class="card" [hidden]="subList.length > 0 || !searchingDone">
                                    <div class="no-subtitle name">{{ 'NO_RESULT' | translate }}</div>
                                </div>
                                <div class="card list-group subPackWrapper fade-in" *ng-for="#subPack of subList | qualitySort">
                                    <div class="card-header quality-{{ subPack.quality }}">
                                        <span class="label pull-right quality-{{ subPack.quality }}">{{ 'SOURCE' | translate }}: {{ subPack.source }}</span>
                                        {{ subPack.file }}
                                    </div>
                                    <a *ng-for="#sub of subPack.content" class="subtitle list-group-item" (click)="downloadSub(sub, subPack, ep, $event)">
                                        <div class="name">
                                            <span class="label">{{ sub.score }}</span> {{ sub.name }}
                                            <i *ng-if="sub === ep.subtitle" class="success glyphicon glyphicon-ok"></i>
                                        </div>
                                    </a>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
  `,
    directives: [NgFor, NgClass, LoaderComponent, NgIf, NgStyle],
    pipes: [SeasonPipe, QualitySortPipe, TranslatePipe]
})
export class ShowComponent {
    showId: string;
    showName: string;
    selectedEpisode: Episode;
    tvShowData: any = {};
    seasons: Array<Season> = [];
    subList: Array<Subtitle> = [];
    missingSubs: number = 0;
    seasonFilter: number;
    loading: Boolean = false;
    downloading: Boolean = false;
    searchingDone: Boolean = false;

    constructor(private params: RouteParams, private rest: RestService) {
        this.showId = params.get('id');
        this.showName = decodeURIComponent(this.showId);
        this.refresh(); // init
    }

    updateMissingSubs() {
        _.each(this.seasons, (epList: Season) => {
            epList.missingSubs = this.unsubs(epList.episodes);
        });
    }

    refresh(force: Boolean = false) {
        this.seasons = [];
        this.tvShowData = {};
        this.loading = true;
        return this.rest.get(`api/show/${this.showId}/${force}`).toPromise().then((res: any) => {
            this.loading = false;
            this.tvShowData = res.data.showInfo;
            this.seasons = res.data.seasons.reverse();
            this.updateMissingSubs();
            if(this.seasons.length > 0) {
                this.seasonFilter = this.seasons[0].season; // default filter on last season
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
            ep.loading = false;
            return;
        }
        this.subList = [];
        ep.loading = true;
        this.searchingDone = false;
        this.selectedEpisode = ep;

        var showSubs = (res: RestResponse) => {
            if(ep === this.selectedEpisode) {
                var subtitles: Array<Subtitle> = res.data;
                if(subtitles[0] && subtitles[0].content[0].episode === this.selectedEpisode.episode && subtitles[0].content[0].season === this.selectedEpisode.season) {
                    this.subList = this.subList.concat(subtitles);
                }
            }
        };

        var providers = [];
        if(ParamsComponent.appParams.providers.indexOf('addic7ed') !== -1) {
            providers.push(this.rest.get('api/addic7ed/' + this.showId + '/' + ep.name).toPromise().then(showSubs));
        }

        if(ParamsComponent.appParams.providers.indexOf('betaSeries') !== -1) {
            providers.push(this.rest.get('api/betaSeries/' + this.showId + '/' + ep.name).toPromise().then(showSubs));
        }

        Promise.all(providers).then(() => {
            ep.loading = false;
            this.searchingDone = true;
        });
    }

    oneClickDownload(ep: Episode) {
        ep.loading = true;
        ep.downloading = true;
        this.selectedEpisode = ep;
        this.subList = undefined;
        this.rest.post('api/download', {
            episode: ep
        }).toPromise().then((res: RestResponse) => {
            ep.loading = false;
            ep.downloading = false;
            this.selectedEpisode = undefined;
            if(res.success) {
                ep.subtitle = res.data;
                this.updateMissingSubs();
            }
        })
    }

    // todo add websockets support
    downloadSub(sub: Subtitle, subPack: SubtitlePack, ep: Episode, $event: MouseEvent) {
        ep.loading = true;
        ep.downloading = true;
        this.rest.post('api/download', {
            episode: ep,
            url: subPack.url,
            subtitle: sub.file
        }).toPromise().then((res: RestResponse) => {
            ep.loading = false;
            ep.downloading = false;
            var $name = $($event.target),
                $icons = $name.find('i');
            if($icons.length > 0) {
                $icons.remove();
            }
            if(res.success) {
                ep.subtitle = sub;
                this.updateMissingSubs();
            }
        });
    }
}
