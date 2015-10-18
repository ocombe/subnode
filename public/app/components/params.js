System.register(['angular2/angular2', "./loader", "ng2-translate/ng2-translate", '../services/rest'], function(exports_1) {
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
    var angular2_1, loader_1, ng2_translate_1, rest_1;
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
            },
            function (rest_1_1) {
                rest_1 = rest_1_1;
            }],
        execute: function() {
            ParamsComponent = (function () {
                function ParamsComponent(rest, translate) {
                    var _this = this;
                    this.loading = false;
                    this.languages = [{
                            id: 'fr',
                            name: 'Français'
                        }];
                    this.lang = new angular2_1.Control("", angular2_1.Validators.required);
                    this.rootFolder = new angular2_1.Control("", angular2_1.Validators.required);
                    this.username = new angular2_1.Control("");
                    this.password = new angular2_1.Control("");
                    this.password2 = new angular2_1.Control("");
                    this.providers = new angular2_1.Control("", angular2_1.Validators.required);
                    this.subLang = new angular2_1.Control("", angular2_1.Validators.required);
                    this.autorename = new angular2_1.Control("", angular2_1.Validators.required);
                    this.autorename_ext = new angular2_1.Control("");
                    this.paramsForm = new angular2_1.ControlGroup({
                        lang: this.lang,
                        rootFolder: this.rootFolder,
                        username: this.username,
                        password: this.password,
                        password2: this.password2,
                        providers: this.providers,
                        subLang: this.subLang,
                        autorename: this.autorename,
                        autorename_ext: this.autorename_ext
                    });
                    this.rest = rest;
                    this.translate = translate;
                    this.rest.get('params').toPromise().then(function (params) {
                        //if(typeof params.rootFolder === 'undefined') {
                        $('#paramsModal').modal();
                        //}
                        _this.lang.updateValue(_this.translate.currentLanguage, {});
                        _this.rootFolder.updateValue(params.rootFolder, {});
                        _this.username.updateValue(params.username, {});
                        _this.password.updateValue(params.password, {});
                        _this.password2.updateValue(params.password, {});
                        _this.providers.updateValue(params.providers, {});
                        _this.subLang.updateValue(params.subLang, {});
                        _this.autorename.updateValue(params.autorename, {});
                        _this.autorename_ext.updateValue(params.autorename_ext, {});
                    });
                    //console.log(this.paramsForm);
                }
                ParamsComponent.prototype.test = function (event) {
                    console.log('change', event.target.value, this.providers);
                    var selected = _.pluck(_.filter(event.target.options, { selected: true }), 'value');
                    // todo update provider or use something that supports multiple values
                };
                ParamsComponent = __decorate([
                    angular2_1.Injectable(),
                    angular2_1.Component({
                        selector: 'params',
                        template: "\n        <div class=\"modal fade\" id=\"paramsModal\" tabindex=\"-1\" role=\"dialog\">\n            <div class=\"modal-dialog\" role=\"document\">\n                <div class=\"modal-content\">\n                    <div class=\"modal-header\">\n                        <button aria-hidden=\"true\" data-dismiss=\"modal\" class=\"close\" type=\"button\">\u00D7</button>\n                        <h4 class=\"modal-title\">{{ 'PARAMS' | translate }}</h4>\n                    </div>\n                    <div class=\"modal-body\">\n                        <form [ng-form-model]=\"paramsForm\" class=\"form-horizontal\">\n                            <div class=\"form-group\" [ng-class]=\"{'has-error': !paramsForm.controls.lang.valid}\">\n                                <label class=\"col-lg-4 control-label\">{{'INTERFACE_LANG' | translate}}</label>\n\n                                <div class=\"col-lg-8\">\n                                    <select id=\"lang\" name=\"lang\" ng-control=\"lang\" ng-change=\"selectLangChange()\" class=\"form-control\" required>\n                                        <option *ng-for=\"#lang of languages\" [value]=\"lang.id\">{{ lang.name }}</option>\n                                    </select>\n                                </div>\n\n                                <div class=\"col-lg-8 pull-right\">\n                                    <span class=\"help-block fade-in fade-out\" [hidden]=\"paramsForm.controls.lang.valid\">{{'REQUIRED' | translate}}</span>\n                                </div>\n                            </div>\n\n                            <div class=\"form-group\" [ng-class]=\"{'has-error': !paramsForm.controls.rootFolder.valid}\">\n                                <label class=\"col-lg-4 control-label\" for=\"rootFolder\">{{'ROOT_FOLDER' | translate}}</label>\n\n                                <div class=\"col-lg-8\">\n                                    <input type=\"text\" id=\"rootFolder\" name=\"rootFolder\" value=\"\" class=\"form-control\" ng-control=\"rootFolder\" placeholder=\"ex: /home/user/Videos/TV\" required>\n                                </div>\n\n                                <div class=\"col-lg-8 pull-right\">\n                                    <span class=\"help-block\">{{'ROOT_FOLDER_HINT' | translate}}</span>\n                                    <span [hidden]=\"paramsForm.controls.rootFolder.valid\" class=\"help-block fade-in fade-out\">{{'REQUIRED' | translate}}</span>\n                                </div>\n                            </div>\n\n                            <div class=\"form-group\" [ng-class]=\"{'has-error': !paramsForm.controls.username.valid}\">\n                                <label class=\"col-lg-4 control-label\" for=\"username\">{{'USERNAME' | translate}}</label>\n\n                                <div class=\"col-lg-8\">\n                                    <input type=\"text\" id=\"username\" name=\"username\" value=\"\" class=\"form-control\" ng-control=\"username\">\n                                </div>\n\n                                <div class=\"col-lg-8 pull-right\">\n                                    <span class=\"help-block\">{{'USERNAME_HINT' | translate}}</span>\n                                </div>\n                            </div>\n\n                            <div class=\"form-group fade-in\" [ng-class]=\"{'has-error': !paramsForm.controls.password.valid}\" [hidden]=\"!paramsForm.value.username || paramsForm.value.username === ''\">\n                                <label class=\"col-lg-4 control-label\" for=\"password\">{{ 'PASSWORD' | translate }}</label>\n\n                                <div class=\"col-lg-8\">\n                                    <input type=\"password\" id=\"password\" name=\"password\" class=\"form-control\" ng-control=\"password\" ng-pattern=\"/d+/\" ng-minlength=\"8\">\n                                </div>\n\n                                <div class=\"col-lg-8 pull-right\">\n                                    <span [hidden]=\"!paramsForm.controls.password.errors\" class=\"help-block fade-in fade-out\">{{'MIN_NUMBER' | translate:'{ nb: 1 }'}}</span>\n                                    <span [hidden]=\"!paramsForm.controls.password.errors\" class=\"help-block fade-in fade-out\">{{'MIN_LENGTH' | translate:'{ nb: 8 }'}}</span>\n                                </div>\n                            </div>\n\n                            <div class=\"form-group fade-in\" [hidden]=\"!paramsForm.value.password || paramsForm.value.password === ''\" [ng-class]=\"{'has-error': !paramsForm.controls.password2.valid || paramsForm.value.password != paramsForm.value.password2}\">\n                                <label class=\"col-lg-4 control-label\" for=\"password_password2\">{{ 'PASSWORD_CONFIRM' | translate }}</label>\n\n                                <div class=\"col-lg-8\">\n                                    <input type=\"password\" id=\"password_password2\" name=\"password2\" ng-control=\"password2\" class=\"form-control\">\n                                </div>\n\n                                <div class=\"col-lg-8 pull-right\">\n                                    <span [hidden]=\"paramsForm.value.password === paramsForm.value.password2\" class=\"help-block fade-in fade-out\">{{'MATCH_PASSWD' | translate}}</span>\n                                </div>\n                            </div>\n\n                            <div class=\"form-group\" class=\"{'has-error': !paramsForm.controls.providers.valid}\">\n                                <label class=\"col-lg-4 control-label\" for=\"username\">{{'PROVIDERS' | translate}}</label>\n\n                                <div class=\"col-lg-8\">\n                                    <select chosen id=\"providers\" (change)=\"test($event)\" multiple=\"true\" name=\"providers\" ng-control=\"providers\" class=\"form-control\" placeholder=\"'PROVIDERS_PLACEHOLDER' | translate\" required>\n                                        <option value=\"betaSeries\">BetaSeries</option>\n                                        <option value=\"addic7ed\">Addic7ed</option>\n                                    </select>\n                                </div>\n\n                                <div class=\"col-lg-8 pull-right\">\n                                    <span [hidden]=\"paramsForm.controls.providers.valid\" class=\"help-block fade-in fade-out\">{{'REQUIRED' | translate}}</span>\n                                </div>\n                            </div>\n\n                            <div class=\"form-group\" [ng-class]=\"{'has-error': !paramsForm.controls.subLang.valid}\">\n                                <label class=\"col-lg-4 control-label\" for=\"username\">{{'SUBTITLES_LANG' | translate}}</label>\n\n                                <div class=\"col-lg-8\">\n                                    <select id=\"subLang\" name=\"subLang\" ng-control=\"subLang\" class=\"form-control\" required>\n                                        <option *ng-for=\"#lang of languages\" [value]=\"lang.id\">{{ lang.name }}</option>\n                                    </select>\n                                </div>\n\n                                <div class=\"col-lg-8 pull-right\">\n                                    <span [hidden]=\"paramsForm.controls.subLang.valid\" class=\"help-block fade-in fade-out\">{{'REQUIRED' | translate}}</span>\n                                </div>\n\n                                <div class=\"col-lg-8 pull-right\">\n                                    <div class=\"checkbox\">\n                                        <label>\n                                            <input type=\"checkbox\" id=\"autorename\" name=\"autorename\" ng-control=\"autorename\"> {{ 'AUTORENAME' | translate }}\n                                        </label>\n                                    </div>\n                                </div>\n\n                                <div class=\"col-lg-8 pull-right\" [hidden]=\"!paramsForm.value.autorename\">\n                                    <div class=\"checkbox\">\n                                        <label>\n                                            <input type=\"checkbox\" id=\"autorename_ext\" name=\"autorename_ext\" ng-control=\"autorename_ext\"> {{ 'AUTORENAME_EXT' | translate }}\n                                        </label>\n                                    </div>\n                                </div>\n                            </div>\n                        </form>\n                    </div>\n                    <div class=\"modal-footer\">\n                        <loader [hidden]=\"!loading\"></loader>\n                        <button type=\"submit\" class=\"btn btn-success\" disabled=\"!paramsForm.valid || sending\" ng-click=\"saveParams()\">{{ 'SAVE' | translate }}</button>\n                        <span class=\"btn btn-default\" data-dismiss=\"modal\">{{ 'CLOSE' | translate }}</span>\n                    </div>\n                </div>\n            </div>\n        </div>\n    ",
                        directives: [angular2_1.FORM_DIRECTIVES, loader_1.LoaderComponent, angular2_1.NgFor, angular2_1.NgClass],
                        pipes: [ng2_translate_1.TranslatePipe]
                    }),
                    angular2_1.Injectable(), 
                    __metadata('design:paramtypes', [rest_1.RestService, ng2_translate_1.TranslateService])
                ], ParamsComponent);
                return ParamsComponent;
            })();
            exports_1("ParamsComponent", ParamsComponent);
        }
    }
});
