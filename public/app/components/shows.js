System.register(['angular2/angular2', "ng2-translate/ng2-translate", "./loader", "../services/rest"], function(exports_1) {
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
    var angular2_1, ng2_translate_1, loader_1, rest_1;
    var ShowsComponent;
    return {
        setters:[
            function (angular2_1_1) {
                angular2_1 = angular2_1_1;
            },
            function (ng2_translate_1_1) {
                ng2_translate_1 = ng2_translate_1_1;
            },
            function (loader_1_1) {
                loader_1 = loader_1_1;
            },
            function (rest_1_1) {
                rest_1 = rest_1_1;
            }],
        execute: function() {
            ShowsComponent = (function () {
                function ShowsComponent(rest) {
                    this.rest = rest;
                    this.tvShows = [];
                }
                ShowsComponent.prototype.onActivate = function (nextInstruction, prevInstruction) {
                    return this.refresh(); // init
                };
                ShowsComponent.prototype.refresh = function () {
                    var _this = this;
                    this.tvShows = [];
                    return this.rest.get("api/showList/true").toPromise().then(function (tvShows) {
                        _this.tvShows = _.sortBy(tvShows, 'showId');
                    });
                };
                ShowsComponent = __decorate([
                    angular2_1.Injectable(),
                    angular2_1.Component({
                        template: "<div class=\"shows\">\n    <div class=\"page-header\">\n        <h2>\n            {{ 'SHOWS' | translate }}\n        </h2>\n    </div>\n\n    <table class=\"table\">\n        <thead class=\"thead-inverse\">\n        <tr>\n            <th>ShowId</th>\n            <th>episodes</th>\n            <th>subtitles</th>\n        </tr>\n        </thead>\n        <tbody>\n        <tr *ng-for=\"#show of tvShows\">\n            <td>{{show.showId}}</td>\n            <td>{{show.episodes}}</td>\n            <td>{{show.subtitles}}</td>\n        </tr>\n        </tbody>\n    </table>\n</div>\n  ",
                        directives: [angular2_1.NgFor, angular2_1.NgClass, loader_1.LoaderComponent, angular2_1.NgIf],
                        pipes: [ng2_translate_1.TranslatePipe]
                    }), 
                    __metadata('design:paramtypes', [rest_1.RestService])
                ], ShowsComponent);
                return ShowsComponent;
            })();
            exports_1("ShowsComponent", ShowsComponent);
        }
    }
});
