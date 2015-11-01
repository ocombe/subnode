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
                        <div class="episode-header">
                            <button class="one-click-dl btn btn-secondary" [disabled]="downloading" (click)="oneClickDownload(ep)"><i class="glyphicon glyphicon-download-alt"></i> <span class="title">{{ 'ONE_CLICK_DL' | translate }}</span></button>
                            <div class="name ellipsis" (click)="searchSubs(ep)">
                                <b>{{ ep.season | number:'2.0-0' }}x{{ ep.episode | number:'2.0-0' }}</b> - {{ ep.name }}
                            </div>
                            <i [hidden]="loading && selectedEpisode === ep" *ng-if="ep.subtitle" class="glyphicon glyphicon-paperclip" [title]="ep.subtitle.name"></i>
                            <loader [hidden]="!loading" *ng-if="selectedEpisode === ep"></loader>
                        </div>

                        <div class="subtitlesList col-xs-12 fade-in" [ng-class]="{disabled: downloading}" *ng-if="selectedEpisode === ep && subList">
                            <div class="card" [hidden]="subList.length > 0 || !loadingDone">
                                <div class="no-subtitle name">{{ 'NO_RESULT' | translate }}</div>
                            </div>
                            <div class="card list-group subPackWrapper fade-in" *ng-for="#subPack of subList | qualitySort">
                                <div class="card-header qualite{{ subPack.quality }}">
                                    <span class="label pull-right qualite{{ subPack.quality }}">{{ 'SOURCE' | translate }}: {{ subPack.source }}</span>
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
  `,
    directives: [NgFor, NgClass, LoaderComponent, NgIf],
    pipes: [SeasonPipe, QualitySortPipe, TranslatePipe]
})
export class ShowComponent implements OnActivate {
    onActivate(nextInstruction: ngRouter.ComponentInstruction, prevInstruction: ngRouter.ComponentInstruction): any {
        return this.refresh(); // init
    }

    showId: string;
    selectedEpisode: Episode;
    tvShowData: Array<Season> = [];
    subList: Array<Subtitle> = [];
    missingSubs: number = 0;
    seasonFilter: number;
    loading: Boolean = false;
    downloading: Boolean = false;
    searchingDone: Boolean = false;

    constructor(private params: RouteParams, private rest: RestService) {
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
            this.subList = undefined;
            return;
        }
        this.loading = true;
        this.searchingDone = false;
        this.selectedEpisode = ep;

        var showSubs = (res: RestResponse) => {
            if(this.selectedEpisode) {
                var subtitles: Array<Subtitle> = res.data;
                if(subtitles[0] && subtitles[0].content[0].episode === this.selectedEpisode.episode && subtitles[0].content[0].season === this.selectedEpisode.season) {
                    if(!this.subList) {
                        this.subList = [];
                    }
                    this.subList = this.subList.concat(subtitles);
                }
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
            this.searchingDone = true;
        });
    }

    oneClickDownload(ep) {
        this.loading = true;
        this.downloading = true;
        this.selectedEpisode = ep;
        this.subList = undefined;
        this.rest.post('api/download', {
                episode: ep
            }).toPromise().then((res: RestResponse) => {
            if(res.success) {
                this.loading = false;
                this.downloading = false;
                this.selectedEpisode = undefined;
                ep.subtitle = res.data;
                this.updateMissingSubs();
            }
        })
    }

    // todo add websockets support
    downloadSub(sub: Subtitle, subPack: SubtitlePack, ep: Episode, $event: MouseEvent) {
        this.loading = true;
        this.downloading = true;
        this.rest.post('api/download', {
            episode: ep,
            url: subPack.url,
            subtitle: sub.file
        }).toPromise().then((res: RestResponse) => {
            this.loading = false;
            this.downloading = false;
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
