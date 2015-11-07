System.register(['angular2/angular2', "../directives/showSelector", "./loader", 'angular2/router', "ng2-translate/ng2-translate"], function(exports_1) {
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
    var angular2_1, showSelector_1, loader_1, router_1, ng2_translate_1;
    var FooterComponent;
    return {
        setters:[
            function (angular2_1_1) {
                angular2_1 = angular2_1_1;
            },
            function (showSelector_1_1) {
                showSelector_1 = showSelector_1_1;
            },
            function (loader_1_1) {
                loader_1 = loader_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (ng2_translate_1_1) {
                ng2_translate_1 = ng2_translate_1_1;
            }],
        execute: function() {
            FooterComponent = (function () {
                function FooterComponent() {
                }
                FooterComponent = __decorate([
                    angular2_1.Component({
                        selector: 'footer',
                        template: "\n        <p class=\"copyright\"><a href='https://github.com/ocombe/subNode' target='_blank'>subNode</a> {{ 'BY' | translate }} <a href=\"https://twitter.com/OCombe\" target=\"_blank\">Olivier Combe</a> \u00A9 2015</p>\n        <a href=\"http://www.betaseries.com\" target=\"_blank\">Betaseries</a> -\n        <a href=\"http://www.addic7ed.com/\" target=\"_blank\">Addic7ed</a> -\n        <a href=\"https://trakt.tv/\" target=\"_blank\">Trakt api</a>\n\t",
                        directives: [showSelector_1.ShowSelector, loader_1.LoaderComponent, router_1.RouterLink],
                        pipes: [ng2_translate_1.TranslatePipe]
                    }), 
                    __metadata('design:paramtypes', [])
                ], FooterComponent);
                return FooterComponent;
            })();
            exports_1("FooterComponent", FooterComponent);
        }
    }
});
