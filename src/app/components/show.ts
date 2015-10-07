import {Component, View, Inject, Pipe, NgFor, NgClass} from 'angular2/angular2';
import {RouteParams} from 'angular2/router';
import {RestService} from "../services/rest";
import {SeasonPipe} from "../pipes/season";
import 'lodash';

@Component({
    selector: 'shows',
    bindings: [RestService]
})
@View({
    template: `
        <div class='show'>
            <div class="page-header">
                <img [src]="'banner/' + showId" image-fallback="showId" overview="showInfo.tvShow.overview">

                <!--<div id="overview" class="panel panel-default fade-in" ng-show='overview'>-->
                    <!--<div class="panel-heading">-->
                        <!--{{ overview.header }}-->
                        <!--<button type="button" class="close" ng-click="hideOverview()">&times;</button>-->
                    <!--</div>-->
                    <!--<div class="content">{{ overview.content }}</div>-->
                <!--</div>-->
            </div>

            <div class="row" [ng-class]="{compact: compact}">
                <div class="seasonsList col-lg-3">
                    <div class="list-group">
                        <a class="list-group-item" [ng-class]="{active: !seasonFilter, seasonCompact: compact, ellipsis: !show}" ng-click="filter()">
                            <span [hidden]="compact" class="uncompacted">{{ 'SHOW_ALL' }}</span>
                            <i class="glyphicon glyphicon-filter" title="{{ 'SHOW_ALL' }}" tooltip></i>
                        </a>
                        <a class="list-group-item" [ng-class]="{active: seasonFilter == epList.season, seasonCompact: compact}" *ng-for="#epList of tvShowData" ng-click="filter(epList.season)">
                            <!--<span [hidden]="compact" class="uncompacted">{{ 'SEASON' }} </span>{{epList.season }}-->
                            <!--<span [hidden]="!epList.missingSubs > 0 && !compact" class="uncompacted badge pull-right">{{ epList.missingSubs }}</span>-->
                        </a>
                    </div>
                </div>

                <div class="episodesList col-lg-9">
                    <div class="panel panel-default list-group epListWrapper" *ng-for="#epList of tvShowData | season:seasonFilter">
                        <div class="panel-heading">
                            <span [hidden]="compact" class="uncompacted">{{ 'SEASON' }} </span>{{ epList.season }}
                        </div>
                        <div *ng-for="#ep of epList.episodes" class="episode alert list-group-item" [ng-class]="{'alert-success': ep.subtitle, 'alert-warning': !ep.subtitle}">
                            <a ng-click="searchSubs($event)"><span [hidden]="!compact">{{ ep.episode | number:'1.0-0' }}</span><span [hidden]="compact" class="name ellipsis">{{ ep.name }}</span></a>
                        </div>
                    </div>
                </div>

                <div class="subtitlesList fade-in" [ng-class]="{'col-lg-10': compact, in: compact}" [hidden]="!subtitlesListShow">
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            {{ selectedEpisode.name }}
                            <button type="button" class="close" ng-click="expand()">&times;</button>
                            <loader loader-id="subtitles" class="pull-right"></loader>
                        </div>
                        <div [hidden]="subList.length !== 0 || !loadingDone">{{ 'NO_RESULT' }}</div>
                        <div class="panel panel-default list-group subPackWrapper fade-in" *ng-for="#subPack of subList"><!-- | qualitySort">-->
                            <div class="panel-heading qualite{{ subPack.quality }}">
                                <span class="label pull-right qualite{{ subPack.quality }}">{{ 'SOURCE' }}: {{ subPack.source }}</span>
                                {{ subPack.file }}
                            </div>
                            <a *ng-for="#sub of subPack.content" class="subtitle list-group-item" ng-click="downloadSub($event)">
                                <span class="name"><span class="label">{{ sub.score }}</span> {{ sub.name }}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  `,
    directives: [NgFor, NgClass],
    pipes: [SeasonPipe]


//<i [hidden]="compact" class="info-sign pull-right" ng-show="showInfo"></i>
//<i ng-show="ep.subtitle && !compact" class="glyphicon glyphicon-paperclip pull-right"></i>
})
export class ShowComponent {
    rest: RestService;
    showId: string;
    selectedEpisode: Object = {};
    tvShowData: Array<Object> = [];
    subList: Array<Object> = [];
    missingSubs: number = 0;
    seasonFilter: Object;

    constructor(@Inject(RouteParams) params: RouteParams, @Inject(RestService) rest: RestService) {
        this.rest = rest;
        this.showId = params.get('id');
        this.refresh(); // init
    }

    onShowSelected() {

        return this.showId;
    }

    refresh() {
        this.tvShowData = [];
        this.rest.get('show/' + this.showId).toPromise().then(show => {
            this.tvShowData = show;
            _.each(this.tvShowData, epList => {
                epList['missingSubs'] = this.unsubs(epList['episodes']);
            });
            if (show.length > 0) {
                this.seasonFilter = show[show.length - 1].season; // default filter on last season
            }
            //$("#selectedTVShow").val(this.showList.indexOf(this.showId)).trigger('liszt:updated');
        });
    }

    unsubs(episodes) {
        return _.filter(episodes, ep => typeof ep['subtitle'] === 'undefined').length;
    }
}
