System.register(['angular2/angular2', 'lodash'], function(exports_1) {
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
    var angular2_1, _;
    var SeasonPipe;
    return {
        setters:[
            function (angular2_1_1) {
                angular2_1 = angular2_1_1;
            },
            function (_1) {
                _ = _1;
            }],
        execute: function() {
            SeasonPipe = (function () {
                function SeasonPipe() {
                }
                SeasonPipe.prototype.transform = function (query, seasons) {
                    if (query.length === 0) {
                        return query;
                    }
                    var s = Number(seasons[0]);
                    var res = _.find(query, function (obj) { return obj.season === s; });
                    return res ? [res] : [];
                };
                SeasonPipe = __decorate([
                    angular2_1.Pipe({ name: 'season' }), 
                    __metadata('design:paramtypes', [])
                ], SeasonPipe);
                return SeasonPipe;
            })();
            exports_1("SeasonPipe", SeasonPipe);
        }
    }
});
