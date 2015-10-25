System.register(['angular2/angular2', 'angular2/router', '../services/rest', "./loader", "ng2-translate/ng2-translate", "../services/router"], function(exports_1) {
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
    var angular2_1, router_1, rest_1, loader_1, ng2_translate_1, router_2;
    var HomeComponent;
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
            function (loader_1_1) {
                loader_1 = loader_1_1;
            },
            function (ng2_translate_1_1) {
                ng2_translate_1 = ng2_translate_1_1;
            },
            function (router_2_1) {
                router_2 = router_2_1;
            }],
        execute: function() {
            HomeComponent = (function () {
                function HomeComponent(rest, routerService) {
                    this.rest = rest;
                    this.routerService = routerService;
                    /*onChanges(changes: {[hidden: string]: SimpleChange}) {
                        console.log('on changes', changes);
                    }*/
                    this.lastEpisodes = [];
                    this.showLoader = false;
                    this.getLastEpisodes(false);
                }
                HomeComponent.prototype.getLastEpisodes = function (refresh) {
                    var _this = this;
                    this.showLoader = true;
                    this.lastEpisodes = this.rest.get("api/lastEpisodes/" + refresh).toPromise().then(function (res) {
                        _this.showLoader = false;
                        return res;
                    });
                };
                HomeComponent = __decorate([
                    angular2_1.Injectable(),
                    angular2_1.Component({
                        selector: 'home',
                        template: "\n        <div class=\"home\">\n            <div class=\"page-header\">\n                <h2>\n                    {{ 'LAST_EPISODES' | translate }}\n                    <a class=\"refreshBtn glyphicon glyphicon-refresh\" (click)=\"getLastEpisodes(true)\"></a>\n                    <loader class=\"pull-right\" loader-id=\"home\" loader-active=\"true\" [hidden]=\"!showLoader\"></loader>\n                </h2>\n            </div>\n\n            <div class=\"lastEpisodes\">\n                <a class=\"card fade-in row\" *ng-for=\"#file of lastEpisodes | async\" [router-link]=\"routerService.normalize(['/Show', {id: file.showId}])\">\n                    <div class=\"col-lg-3 col-xs-12 card-block\">\n                        <div class=\"card-title\">{{ file.showId }}</div>\n                        <div class=\"card-text-wrapper\">\n                            <span class=\"card-text col-lg-12\">{{ file.episode.season | number:'2.0-0' }}x{{ file.episode.episode | number:'2.0-0' }}</span>\n                            <span class=\"card-subtitle col-lg-12\">{{ file.ctime | date }}</span>\n                        </div>\n                    </div>\n                    <div class=\"col-lg-9 col-xs-12 imgWrapper\">\n                        <img [src]=\"'api/banner/'+file.showId\">\n                    </div>\n                </a>\n            </div>\n        </div>\n\t",
                        directives: [angular2_1.NgFor, loader_1.LoaderComponent, router_1.ROUTER_DIRECTIVES],
                        pipes: [ng2_translate_1.TranslatePipe]
                    }), 
                    __metadata('design:paramtypes', [rest_1.RestService, router_2.RouterService])
                ], HomeComponent);
                return HomeComponent;
            })();
            exports_1("HomeComponent", HomeComponent);
        }
    }
});
