System.register(['angular2/angular2', 'angular2/router', 'angular2/http', './components/app', 'ng2-translate/ng2-translate', './services/rest', "./services/router"], function(exports_1) {
    var angular2_1, router_1, http_1, app_1, ng2_translate_1, rest_1, router_2;
    return {
        setters:[
            function (angular2_1_1) {
                angular2_1 = angular2_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (app_1_1) {
                app_1 = app_1_1;
            },
            function (ng2_translate_1_1) {
                ng2_translate_1 = ng2_translate_1_1;
            },
            function (rest_1_1) {
                rest_1 = rest_1_1;
            },
            function (router_2_1) {
                router_2 = router_2_1;
            }],
        execute: function() {
            angular2_1.bootstrap(app_1.AppComponent, [
                router_1.ROUTER_PROVIDERS,
                http_1.HTTP_PROVIDERS,
                angular2_1.FORM_PROVIDERS,
                angular2_1.provide(router_1.LocationStrategy, { useClass: router_1.HashLocationStrategy }),
                rest_1.RestService,
                ng2_translate_1.TranslateService,
                router_2.RouterService
            ]);
        }
    }
});
