System.register(['angular2/angular2', 'select2', "../services/rest", 'angular2/router', "../services/router", "ng2-translate/ng2-translate"], function(exports_1) {
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
    var angular2_1, rest_1, router_1, router_2, ng2_translate_1;
    var ShowSelector;
    return {
        setters:[
            function (angular2_1_1) {
                angular2_1 = angular2_1_1;
            },
            function (_1) {},
            function (rest_1_1) {
                rest_1 = rest_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (router_2_1) {
                router_2 = router_2_1;
            },
            function (ng2_translate_1_1) {
                ng2_translate_1 = ng2_translate_1_1;
            }],
        execute: function() {
            /**
             * This directive applies select2 on the nav <select> element
             */
            ShowSelector = (function () {
                function ShowSelector(rest, element, routerService, router, location, translate) {
                    var _this = this;
                    this.routerService = routerService;
                    this.router = router;
                    this.showList = [];
                    this.select = element.nativeElement.querySelector('select');
                    this.$select = $(this.select).select2()
                        .on('change', function (e) {
                        _this.showSelected();
                    });
                    // update placeholder on lang change
                    translate.onLangChange.observer({
                        next: function (params) {
                            translate.get('SELECT_SHOW').subscribe(function (trad) {
                                setTimeout(function () {
                                    $('.select2-selection__placeholder').text(trad);
                                });
                            });
                        }
                    });
                    rest.get('api/showList').toPromise().then(function (showList) {
                        _this.showList = showList;
                        if (_.startsWith(location.path(), '/show/')) {
                            // wait for the select to be populated
                            window.setTimeout(function () {
                                var showId = decodeURIComponent(location.path().replace('/show/', ''));
                                _this.syncSelectedShow(showId);
                            });
                        }
                    });
                    router.subscribe(function (path) {
                        if (_.startsWith(path, 'show/')) {
                            var showId = decodeURIComponent(path.replace('show/', ''));
                            _this.syncSelectedShow(showId);
                        }
                        else {
                            _this.lastValue = '';
                            _this.$select.select2('val', '');
                        }
                    });
                }
                ShowSelector.prototype.showSelected = function () {
                    if (this.select.value !== this.lastValue) {
                        this.lastValue = this.select.value;
                        this.routerService.navigate(['/Show', { id: this.select.value }]);
                    }
                };
                ShowSelector.prototype.syncSelectedShow = function (showId) {
                    // route was activated by something else, we don't want to navigate
                    this.lastValue = showId;
                    this.$select.select2('val', showId);
                };
                ShowSelector = __decorate([
                    angular2_1.Injectable(),
                    angular2_1.Component({
                        selector: 'show-selector',
                        providers: [rest_1.RestService]
                    }),
                    angular2_1.View({
                        template: "\n        <select data-placeholder=\"\">\n            <option *ng-for=\"#show of showList\" [value]=\"show\">{{show}}</option>\n        </select>\n    ",
                        directives: [angular2_1.FORM_DIRECTIVES, angular2_1.NgFor, angular2_1.NgModel]
                    }), 
                    __metadata('design:paramtypes', [rest_1.RestService, angular2_1.ElementRef, router_2.RouterService, router_1.Router, router_1.Location, ng2_translate_1.TranslateService])
                ], ShowSelector);
                return ShowSelector;
            })();
            exports_1("ShowSelector", ShowSelector);
        }
    }
});
