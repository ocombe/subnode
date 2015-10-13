System.register(['angular2/angular2', "./loader", "ng2-translate"], function(exports_1) {
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
    var angular2_1, loader_1, ng2_translate_1;
    var ParamsComponent;
    return {
        setters:[
            function (angular2_1_1) {
                angular2_1 = angular2_1_1;
            },
            function (loader_1_1) {
                loader_1 = loader_1_1;
            },
            function (ng2_translate_1_1) {
                ng2_translate_1 = ng2_translate_1_1;
            }],
        execute: function() {
            ParamsComponent = (function () {
                function ParamsComponent(builder) {
                    this.languages = [{
                            id: 'fr',
                            name: 'French'
                        }];
                    this.paramsForm = builder.group({
                        lang: ['', angular2_1.Validators.required],
                        rootFolder: ['', angular2_1.Validators.required],
                        userName: ['', angular2_1.Validators.required],
                        passwordRetry: builder.group({
                            password: ["", angular2_1.Validators.required],
                            password2: ["", angular2_1.Validators.required]
                        }),
                        providers: ['', angular2_1.Validators.required],
                        subLang: ['', angular2_1.Validators.required],
                        autorename: ['', angular2_1.Validators.required],
                        autorename_ext: ['', angular2_1.Validators.required]
                    });
                }
                ParamsComponent = __decorate([
                    angular2_1.Injectable(),
                    angular2_1.Component({
                        selector: 'params',
                        viewProviders: [angular2_1.FormBuilder],
                        template: "\n        <!-- Modal -->\n        <div class=\"modal fade\" id=\"paramsModal\" tabindex=\"-1\" role=\"dialog\">\n            <div class=\"modal-dialog\" role=\"document\">\n                <div class=\"modal-content\">\n                    <div class=\"modal-header\">\n                        <button aria-hidden=\"true\" data-dismiss=\"modal\" class=\"close\" type=\"button\">\u00D7</button>\n                        <h4 class=\"modal-title\">{{ 'PARAMS' | translate }}</h4>\n                    </div>\n                    <div class=\"modal-body\">\n                        <form class=\"form-horizontal\">\n              </div>\n                        </form>\n                    </div>\n                </div>\n            </div>\n        </div>\n    ",
                        directives: [angular2_1.FORM_DIRECTIVES, loader_1.LoaderComponent, angular2_1.NgFor],
                        pipes: [ng2_translate_1.TranslatePipe]
                    }), 
                    __metadata('design:paramtypes', [angular2_1.FormBuilder])
                ], ParamsComponent);
                return ParamsComponent;
            })();
            exports_1("ParamsComponent", ParamsComponent);
        }
    }
});
