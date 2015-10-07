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
    var angular2_1;
    var cachedInput, QualitySortPipe;
    return {
        setters:[
            function (angular2_1_1) {
                angular2_1 = angular2_1_1;
            },
            function (_1) {}],
        execute: function() {
            QualitySortPipe = (function () {
                function QualitySortPipe() {
                }
                QualitySortPipe.prototype.transform = function (input, seasons) {
                    if (!input || cachedInput === input) {
                        return input;
                    }
                    cachedInput = input.sort(function (a, b) {
                        return a['quality'] == b['quality'] ? _.max(b.content, 'score')['score'] - _.max(a.content, 'score')['score'] : b['quality'] - a['quality'];
                    });
                    return cachedInput;
                };
                QualitySortPipe = __decorate([
                    angular2_1.Pipe({ name: 'qualitySort' }), 
                    __metadata('design:paramtypes', [])
                ], QualitySortPipe);
                return QualitySortPipe;
            })();
            exports_1("QualitySortPipe", QualitySortPipe);
        }
    }
});
