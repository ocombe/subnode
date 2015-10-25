System.register(['angular2/angular2', 'angular2/router'], function(exports_1) {
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
    var angular2_1, router_1;
    var RouterService;
    return {
        setters:[
            function (angular2_1_1) {
                angular2_1 = angular2_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            }],
        execute: function() {
            RouterService = (function () {
                function RouterService(router, location) {
                    this.router = router;
                    this.location = location;
                }
                RouterService.prototype.encodeURIComponent = function (str) {
                    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
                        return '%' + c.charCodeAt(0).toString(16);
                    });
                };
                RouterService.prototype.normalize = function (params) {
                    var _this = this;
                    return _.map(params, function (param) { return typeof param === 'object' ? _.mapValues(param, function (p) { return _this.encodeURIComponent(p); }) : param; });
                };
                RouterService.prototype.navigate = function (params) {
                    this.router.navigate(this.normalize(params));
                };
                RouterService = __decorate([
                    angular2_1.Injectable(), 
                    __metadata('design:paramtypes', [router_1.Router, router_1.Location])
                ], RouterService);
                return RouterService;
            })();
            exports_1("RouterService", RouterService);
        }
    }
});
