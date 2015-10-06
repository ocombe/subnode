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
    var __param = (this && this.__param) || function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };
    var angular2_1, router_1;
    var ShowComponent;
    return {
        setters:[
            function (angular2_1_1) {
                angular2_1 = angular2_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            }],
        execute: function() {
            ShowComponent = (function () {
                function ShowComponent(params) {
                    this.id = params.get('id');
                }
                ShowComponent.prototype.onShowSelected = function () {
                    return this.id;
                };
                ShowComponent = __decorate([
                    angular2_1.Component({ selector: 'shows' }),
                    angular2_1.View({
                        template: "\n        <div>Show {{id}}</div>\n  ",
                    }),
                    __param(0, angular2_1.Inject(router_1.RouteParams)), 
                    __metadata('design:paramtypes', [router_1.RouteParams])
                ], ShowComponent);
                return ShowComponent;
            })();
            exports_1("ShowComponent", ShowComponent);
        }
    }
});
