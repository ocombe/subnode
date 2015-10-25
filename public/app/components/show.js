System.register(['angular2/angular2', 'angular2/router', "../services/rest", "../pipes/season", "../pipes/qualitySort", "./loader", "ng2-translate/ng2-translate", "./params"], function(exports_1) {
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
    var angular2_1, router_1, rest_1, season_1, qualitySort_1, loader_1, ng2_translate_1, params_1;
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
            function (qualitySort_1_1) {
                qualitySort_1 = qualitySort_1_1;
            },
            function (loader_1_1) {
                loader_1 = loader_1_1;
            },
            function (ng2_translate_1_1) {
                ng2_translate_1 = ng2_translate_1_1;
            },
            function (params_1_1) {
                params_1 = params_1_1;
            }],
        execute: function() {
            ShowComponent = (function () {
                function ShowComponent(params, rest) {
                    this.params = params;
                    this.rest = rest;
                    this.tvShowData = [];
                    this.subList = [];
                    this.missingSubs = 0;
                    this.loading = false;
                    this.loadingDone = false;
                    this.rest = rest;
                    this.showId = params.get('id');
                }
                ShowComponent.prototype.onActivate = function (nextInstruction, prevInstruction) {
                    return this.refresh(); // init
                };
                ShowComponent.prototype.updateMissingSubs = function () {
                    var _this = this;
                    _.each(this.tvShowData, function (epList) {
                        epList.missingSubs = _this.unsubs(epList.episodes);
                    });
                };
                ShowComponent.prototype.refresh = function () {
                    var _this = this;
                    this.tvShowData = [];
                    return this.rest.get('api/show/' + this.showId).toPromise().then(function (show) {
                        _this.tvShowData = show.reverse();
                        _this.updateMissingSubs();
                        if (show.length > 0) {
                            _this.seasonFilter = show[0].season; // default filter on last season
                        }
                        //$("#selectedTVShow").val(this.showList.indexOf(this.showId)).trigger('liszt:updated');
                    });
                };
                ShowComponent.prototype.unsubs = function (episodes) {
                    return _.filter(episodes, function (ep) { return typeof ep.subtitle === 'undefined'; }).length;
                };
                ShowComponent.prototype.searchSubs = function (ep) {
                    var _this = this;
                    if (ep === this.selectedEpisode) {
                        this.selectedEpisode = undefined;
                        return;
                    }
                    this.loading = true;
                    this.loadingDone = false;
                    this.selectedEpisode = ep;
                    this.subList = [];
                    var showSubs = function (subtitles) {
                        if (subtitles[0] && subtitles[0].content[0].episode === _this.selectedEpisode.episode && subtitles[0].content[0].season === _this.selectedEpisode.season) {
                            _this.subList = _this.subList.concat(subtitles);
                        }
                    };
                    var providers = [];
                    if (params_1.ParamsComponent.appParams.providers.indexOf('addic7ed') !== -1) {
                        providers.push(this.rest.get('api/addic7ed/' + this.showId + '/' + ep.name).toPromise().then(showSubs));
                    }
                    if (params_1.ParamsComponent.appParams.providers.indexOf('betaSeries') !== -1) {
                        providers.push(this.rest.get('api/betaSeries/' + this.showId + '/' + ep.name).toPromise().then(showSubs));
                    }
                    Promise.all(providers).then(function () {
                        _this.loading = false;
                        _this.loadingDone = true;
                    });
                };
                ShowComponent.prototype.downloadSub = function (sub, subPack, $event) {
                    var _this = this;
                    this.loading = true;
                    this.rest.post('api/download', {
                        episode: this.selectedEpisode.file,
                        url: subPack.url,
                        subtitle: sub.file
                    }).toPromise().then(function (res) {
                        _this.loading = false;
                        var $name = $($event.target), $icons = $name.find('i');
                        if ($icons.length > 0) {
                            $icons.remove();
                        }
                        if (res.success) {
                            _this.selectedEpisode.subtitle = sub;
                            _this.updateMissingSubs();
                        }
                    });
                };
                ShowComponent = __decorate([
                    angular2_1.Injectable(),
                    angular2_1.Component({
                        selector: 'shows',
                        template: "\n        <div class='show'>\n            <div class=\"page-header\">\n                <img [src]=\"'api/banner/' + showId\" image-fallback=\"showId\" overview=\"showInfo.tvShow.overview\">\n            </div>\n\n            <ul class=\"nav nav-tabs\">\n              <li class=\"nav-item\" *ng-for=\"#epList of tvShowData\" (click)=\"seasonFilter = epList.season\">\n                <span class=\"nav-link\" [ng-class]=\"{active: seasonFilter == epList.season}\">\n                    {{ 'SEASON' | translate }} {{epList.season }}\n                    <span *ng-if=\"epList.missingSubs > 0\" class=\"badge pull-right\">{{ epList.missingSubs }}</span>\n                </span>\n              </li>\n            </ul>\n\n            <div class=\"episodesList\">\n                <div class=\"card list-group epListWrapper\" *ng-for=\"#epList of tvShowData | season:seasonFilter\">\n                    <div *ng-for=\"#ep of epList.episodes\" class=\"episode alert\" [ng-class]=\"{'alert-success': ep.subtitle, 'alert-warning': !ep.subtitle}\">\n                        <div class=\"name ellipsis\" (click)=\"searchSubs(ep)\">\n                            <b>{{ ep.season | number:'2.0-0' }}x{{ ep.episode | number:'2.0-0' }}</b> - {{ ep.name }}\n                        </div>\n                        <i [hidden]=\"loading && selectedEpisode === ep\" *ng-if=\"ep.subtitle\" class=\"glyphicon glyphicon-paperclip\"></i>\n                        <loader [hidden]=\"!loading\" *ng-if=\"selectedEpisode === ep\"></loader>\n\n                        <div class=\"subtitlesList col-xs-12 fade-in\" *ng-if=\"selectedEpisode === ep\">\n                            <div class=\"card\" [hidden]=\"subList.length !== 0 || !loadingDone\">\n                                <div class=\"no-subtitle name\">{{ 'NO_RESULT' | translate }}</div>\n                            </div>\n                            <div class=\"card list-group subPackWrapper fade-in\" *ng-for=\"#subPack of subList | qualitySort\">\n                                <div class=\"card-header qualite{{ subPack.quality }}\">\n                                    <span class=\"label pull-right qualite{{ subPack.quality }}\">{{ 'SOURCE' | translate }}: {{ subPack.source }}</span>\n                                    {{ subPack.file }}\n                                </div>\n                                <a *ng-for=\"#sub of subPack.content\" class=\"subtitle list-group-item\" (click)=\"downloadSub(sub, subPack, $event)\">\n                                    <div class=\"name\">\n                                        <span class=\"label\">{{ sub.score }}</span> {{ sub.name }}\n                                        <i *ng-if=\"sub === selectedEpisode.subtitle\" class=\"success glyphicon glyphicon-ok\"></i>\n                                    </div>\n                                </a>\n                            </div>\n                        </div>\n\n                    </div>\n                </div>\n            </div>\n        </div>\n  ",
                        directives: [angular2_1.NgFor, angular2_1.NgClass, loader_1.LoaderComponent, angular2_1.NgIf],
                        pipes: [season_1.SeasonPipe, qualitySort_1.QualitySortPipe, ng2_translate_1.TranslatePipe]
                    }), 
                    __metadata('design:paramtypes', [router_1.RouteParams, rest_1.RestService])
                ], ShowComponent);
                return ShowComponent;
            })();
            exports_1("ShowComponent", ShowComponent);
        }
    }
});
