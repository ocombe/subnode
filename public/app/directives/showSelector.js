System.register(['angular2/angular2', 'select2', "../services/rest", 'angular2/router'], function(exports_1) {
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
    var angular2_1, rest_1, router_1;
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
            }],
        execute: function() {
            /**
             * This directive applies select2 on the nav <select> element
             */
            ShowSelector = (function () {
                //Todo: follow path changes to update the select
                function ShowSelector(rest, element, router, location) {
                    var _this = this;
                    this.showList = [];
                    this.router = router;
                    this.select = element.nativeElement.querySelector('select');
                    this.$select = $(this.select).select2()
                        .on('change', function (e) {
                        _this.showSelected();
                    });
                    rest.get('showList').toPromise().then(function (showList) {
                        _this.showList = showList;
                        if (location.path().startsWith('/show/')) {
                            // wait for the select to be populated
                            window.setTimeout(function () {
                                var show = location.path().replace('/show/', '');
                                _this.$select.select2('val', show);
                            });
                        }
                    });
                }
                ShowSelector.prototype.showSelected = function () {
                    this.router.navigate(['./Show', { id: this.select.value }]);
                };
                ShowSelector = __decorate([
                    angular2_1.Component({
                        selector: 'show-selector',
                        providers: [rest_1.RestService]
                    }),
                    angular2_1.View({
                        template: "\n        <select data-placeholder=\"Select a show\">\n            <option *ng-for=\"#show of showList\" [value]=\"show\">{{show}}</option>\n        </select>\n    ",
                        directives: [angular2_1.FORM_DIRECTIVES, angular2_1.NgFor, angular2_1.NgModel]
                    }),
                    __param(0, angular2_1.Inject(rest_1.RestService)),
                    __param(1, angular2_1.Inject(angular2_1.ElementRef)),
                    __param(2, angular2_1.Inject(router_1.Router)),
                    __param(3, angular2_1.Inject(router_1.Location)), 
                    __metadata('design:paramtypes', [rest_1.RestService, angular2_1.ElementRef, router_1.Router, router_1.Location])
                ], ShowSelector);
                return ShowSelector;
            })();
            exports_1("ShowSelector", ShowSelector);
        }
    }
});
