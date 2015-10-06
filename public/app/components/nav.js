System.register(['angular2/angular2', "../directives/showSelector", "./loader"], function(exports_1) {
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
    var angular2_1, showSelector_1, loader_1;
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
            }],
        execute: function() {
            NavbarComponent = (function () {
                function NavbarComponent() {
                }
                NavbarComponent = __decorate([
                    angular2_1.Component({
                        selector: 'navbar'
                    }),
                    angular2_1.View({
                        template: "\n        <nav class=\"navbar navbar-fixed-top\">\n            <a class=\"navbar-brand hidden-sm\" href=\"#\"><img src=\"img/subnode.png\"></a>\n            <a class=\"navbar-brand visible-sm glyphicon glyphicon-home\" href=\"#\"></a>\n            <loader></loader>\n            <show-selector></show-selector>\n            <a class=\"pull-right paramsBtn glyphicon glyphicon-cog\" modal-open=\"partials/config.html\"></a>\n        </nav>\n\t",
                        directives: [showSelector_1.ShowSelector, loader_1.LoaderComponent]
                    }), 
                    __metadata('design:paramtypes', [])
                ], NavbarComponent);
                return NavbarComponent;
            })();
            exports_1("NavbarComponent", NavbarComponent);
        }
    }
});
