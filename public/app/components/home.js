System.register(['angular2/angular2', '../services/rest', "./loader", "ng2-translate"], function(exports_1) {
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
    var angular2_1, rest_1, loader_1, ng2_translate_1;
    var HomeComponent;
    return {
        setters:[
            function (angular2_1_1) {
                angular2_1 = angular2_1_1;
            },
            function (rest_1_1) {
                rest_1 = rest_1_1;
            },
            function (loader_1_1) {
                loader_1 = loader_1_1;
            },
            function (ng2_translate_1_1) {
                ng2_translate_1 = ng2_translate_1_1;
            }],
        execute: function() {
            HomeComponent = (function () {
                function HomeComponent(rest) {
                    this.lastEpisodes = [];
                    this.showLoader = false;
                    this.rest = rest;
                    this.getLastEpisodes(false);
                }
                HomeComponent.prototype.getLastEpisodes = function (refresh) {
                    var _this = this;
                    this.showLoader = true;
                    this.lastEpisodes = this.rest.get("lastEpisodes/" + refresh).toPromise().then(function (res) {
                        _this.showLoader = false;
                        return res;
                    });
                };
                HomeComponent = __decorate([
                    angular2_1.Component({
                        selector: 'home',
                        bindings: [rest_1.RestService],
                        template: "\n        <div class=\"home\">\n            <div class=\"page-header\">\n                <h2>\n                    {{ 'LAST_EPISODES' | translate }}\n                    <a class=\"refreshBtn glyphicon glyphicon-refresh\" (click)=\"getLastEpisodes(true)\"></a>\n                    <loader class=\"pull-right\" loader-id=\"home\" loader-active=\"true\" [hidden]=\"!showLoader\"></loader>\n                </h2>\n            </div>\n\n            <div class=\"lastEpisodes\">\n                <div class=\"col-lg-12 card fade-in\" *ng-for=\"#file of lastEpisodes | async\">\n                    <a [href]=\"'#show/' + file.showId\">\n                        <div class=\"col-lg-3\">\n                            <div class=\"card-block\">\n                                <h4 class=\"card-title\">{{ file.showId }}</h4>\n                                <h5 class=\"card-text\">{{ file.episode.season | number:'2.0-0' }}x{{ file.episode.episode | number:'2.0-0' }}</h5>\n\n                                <p class=\"card-text\">{{ file.ctime | date }}</p>\n                            </div>\n                        </div>\n                        <div class=\"col-lg-9 imgWrapper\">\n                            <img [src]=\"'banner/'+file.showId\">\n                        </div>\n                    </a>\n                </div>\n            </div>\n        </div>\n\t",
                        directives: [angular2_1.NgFor, loader_1.LoaderComponent],
                        pipes: [ng2_translate_1.TranslatePipe]
                    }),
                    __param(0, angular2_1.Inject(rest_1.RestService)), 
                    __metadata('design:paramtypes', [rest_1.RestService])
                ], HomeComponent);
                return HomeComponent;
            })();
            exports_1("HomeComponent", HomeComponent);
        }
    }
});
