System.register(['angular2/angular2', 'angular2/router', "../services/rest", "../pipes/season", 'lodash'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
            case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
            case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
            case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
        }
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = (this && this.__param) || function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };
    var angular2_1, router_1, rest_1, season_1;
    var ShowComponent;
    return {
        setters:[
            function (angular2_1_1) {
                angular2_1 = angular2_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (rest_1_1) {
                rest_1 = rest_1_1;
            },
            function (season_1_1) {
                season_1 = season_1_1;
            },
            function (_1) {}],
        execute: function() {
            ShowComponent = (function () {
                function ShowComponent(params, rest) {
                    this.selectedEpisode = {};
                    this.tvShowData = [];
                    this.subList = [];
                    this.missingSubs = 0;
                    this.rest = rest;
                    this.showId = params.get('id');
                    this.refresh(); // init
                }
                ShowComponent.prototype.onShowSelected = function () {
                    return this.showId;
                };
                ShowComponent.prototype.refresh = function () {
                    var _this = this;
                    this.tvShowData = [];
                    this.rest.get('show/' + this.showId).toPromise().then(function (show) {
                        _this.tvShowData = show;
                        _.each(_this.tvShowData, function (epList) {
                            epList['missingSubs'] = _this.unsubs(epList['episodes']);
                        });
                        if (show.length > 0) {
                            _this.seasonFilter = show[show.length - 1].season; // default filter on last season
                        }
                        //$("#selectedTVShow").val(this.showList.indexOf(this.showId)).trigger('liszt:updated');
                    });
                };
                ShowComponent.prototype.unsubs = function (episodes) {
                    return _.filter(episodes, function (ep) { return typeof ep['subtitle'] === 'undefined'; }).length;
                };
                ShowComponent = __decorate([
                    angular2_1.Component({
                        selector: 'shows',
                        bindings: [rest_1.RestService]
                    }),
                    angular2_1.View({
                        template: "\n        <div class='show'>\n            <div class=\"page-header\">\n                <img [src]=\"'banner/' + showId\" image-fallback=\"showId\" overview=\"showInfo.tvShow.overview\">\n\n                <!--<div id=\"overview\" class=\"panel panel-default fade-in\" ng-show='overview'>-->\n                    <!--<div class=\"panel-heading\">-->\n                        <!--{{ overview.header }}-->\n                        <!--<button type=\"button\" class=\"close\" ng-click=\"hideOverview()\">&times;</button>-->\n                    <!--</div>-->\n                    <!--<div class=\"content\">{{ overview.content }}</div>-->\n                <!--</div>-->\n            </div>\n\n            <div class=\"row\" [ng-class]=\"{compact: compact}\">\n                <div class=\"seasonsList col-lg-3\">\n                    <div class=\"list-group\">\n                        <a class=\"list-group-item\" [ng-class]=\"{active: !seasonFilter, seasonCompact: compact, ellipsis: !show}\" ng-click=\"filter()\">\n                            <span [hidden]=\"compact\" class=\"uncompacted\">{{ 'SHOW_ALL' }}</span>\n                            <i class=\"glyphicon glyphicon-filter\" title=\"{{ 'SHOW_ALL' }}\" tooltip></i>\n                        </a>\n                        <a class=\"list-group-item\" [ng-class]=\"{active: seasonFilter == epList.season, seasonCompact: compact}\" *ng-for=\"#epList of tvShowData\" ng-click=\"filter(epList.season)\">\n                            <!--<span [hidden]=\"compact\" class=\"uncompacted\">{{ 'SEASON' }} </span>{{epList.season }}-->\n                            <!--<span [hidden]=\"!epList.missingSubs > 0 && !compact\" class=\"uncompacted badge pull-right\">{{ epList.missingSubs }}</span>-->\n                        </a>\n                    </div>\n                </div>\n\n                <div class=\"episodesList col-lg-9\">\n                    <div class=\"panel panel-default list-group epListWrapper\" *ng-for=\"#epList of tvShowData | season:seasonFilter\">\n                        <div class=\"panel-heading\">\n                            <span [hidden]=\"compact\" class=\"uncompacted\">{{ 'SEASON' }} </span>{{ epList.season }}\n                        </div>\n                        <div *ng-for=\"#ep of epList.episodes\" class=\"episode alert list-group-item\" [ng-class]=\"{'alert-success': ep.subtitle, 'alert-warning': !ep.subtitle}\">\n                            <a ng-click=\"searchSubs($event)\"><span [hidden]=\"!compact\">{{ ep.episode | number:'1.0-0' }}</span><span [hidden]=\"compact\" class=\"name ellipsis\">{{ ep.name }}</span></a>\n                        </div>\n                    </div>\n                </div>\n\n                <div class=\"subtitlesList fade-in\" [ng-class]=\"{'col-lg-10': compact, in: compact}\" [hidden]=\"!subtitlesListShow\">\n                    <div class=\"panel panel-default\">\n                        <div class=\"panel-heading\">\n                            {{ selectedEpisode.name }}\n                            <button type=\"button\" class=\"close\" ng-click=\"expand()\">&times;</button>\n                            <loader loader-id=\"subtitles\" class=\"pull-right\"></loader>\n                        </div>\n                        <div [hidden]=\"subList.length !== 0 || !loadingDone\">{{ 'NO_RESULT' }}</div>\n                        <div class=\"panel panel-default list-group subPackWrapper fade-in\" *ng-for=\"#subPack of subList\"><!-- | qualitySort\">-->\n                            <div class=\"panel-heading qualite{{ subPack.quality }}\">\n                                <span class=\"label pull-right qualite{{ subPack.quality }}\">{{ 'SOURCE' }}: {{ subPack.source }}</span>\n                                {{ subPack.file }}\n                            </div>\n                            <a *ng-for=\"#sub of subPack.content\" class=\"subtitle list-group-item\" ng-click=\"downloadSub($event)\">\n                                <span class=\"name\"><span class=\"label\">{{ sub.score }}</span> {{ sub.name }}</span>\n                            </a>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n  ",
                        directives: [angular2_1.NgFor, angular2_1.NgClass],
                        pipes: [season_1.SeasonPipe]
                    }),
                    __param(0, angular2_1.Inject(router_1.RouteParams)),
                    __param(1, angular2_1.Inject(rest_1.RestService)), 
                    __metadata('design:paramtypes', [router_1.RouteParams, rest_1.RestService])
                ], ShowComponent);
                return ShowComponent;
            })();
            exports_1("ShowComponent", ShowComponent);
        }
    }
});
