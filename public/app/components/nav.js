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
    var NavbarComponent;
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
            NavbarComponent = (function () {
                function NavbarComponent() {
                }
                NavbarComponent = __decorate([
                    angular2_1.Component({
                        selector: 'navbar',
                        template: "\n        <nav class=\"navbar navbar-fixed-top\">\n            <a class=\"navbar-brand hidden-sm-down\" [router-link]=\"['/Home']\"><img src=\"img/subnode-white.png\"></a>\n            <div class=\"dropdown hidden-md-up pull-left\">\n                <a class=\"navbar-brand\" data-toggle=\"dropdown\"><img src=\"img/subnode-icon-white.png\"></a>\n                <div class=\"dropdown-menu\">\n                    <a class=\"dropdown-item\" [router-link]=\"['/Home']\">{{ 'HOME' | translate }}</a>\n                    <!--<a class=\"dropdown-item\" [router-link]=\"['/Shows']\">{{ 'SHOWS' | translate }}</a>-->\n                </div>\n            </div>\n            <show-selector></show-selector>\n            <!--<ul class=\"nav navbar-nav hidden-sm-down\">-->\n                <!--<li class=\"nav-item active\">-->\n                  <!--<a class=\"nav-link\" [router-link]=\"['/Shows']\">{{ 'SHOWS' | translate }}</a>-->\n                <!--</li>-->\n            <!--</ul>-->\n            <div class=\"dropdown pull-right\">\n                <a class=\"paramsBtn glyphicon glyphicon-cog\" data-toggle=\"dropdown\"></a>\n                <div class=\"dropdown-menu dropdown-menu-right\">\n                    <a class=\"dropdown-item\" data-toggle=\"modal\" data-target=\"#paramsModal\">{{ 'PARAMS' | translate }}</a>\n                    <div class=\"dropdown-divider\"></div>\n                    <a href=\"api/exit\" class=\"dropdown-item\">\n                        <span class=\"glyphicon glyphicon-off\"></span> {{ 'SHUTDOWN' | translate }}\n                    </a>\n                </div>\n            </div>\n        </nav>\n\t",
                        directives: [showSelector_1.ShowSelector, loader_1.LoaderComponent, router_1.RouterLink],
                        pipes: [ng2_translate_1.TranslatePipe]
                    }), 
                    __metadata('design:paramtypes', [])
                ], NavbarComponent);
                return NavbarComponent;
            })();
            exports_1("NavbarComponent", NavbarComponent);
        }
    }
});
