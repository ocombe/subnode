import {Component, Injectable, FORM_DIRECTIVES, NgFor, NgClass, Validators, ControlGroup, Control, ElementRef} from 'angular2/angular2';
import {ShowSelector} from "../directives/showSelector";
import {LoaderComponent} from "./loader";
import {TranslateService, TranslatePipe} from "ng2-translate/ng2-translate";
import {RestService, RestResponse} from '../services/rest';
import 'bootstrap/dist/js/bootstrap.min.js'

@Injectable()
@Component({
    selector: 'params',
    template: `
        <div class="modal fade" id="paramsModal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>
                        <h4 class="modal-title">{{ 'PARAMS' | translate }}</h4>
                    </div>
                    <div class="modal-body">
                        <form [ng-form-model]="paramsForm" class="form-horizontal">
                            <div class="form-group row" [ng-class]="{'has-error': !paramsForm.controls.lang.valid}">
                                <label class="col-sm-4 col-xs-12 control-label">{{'INTERFACE_LANG' | translate}}</label>

                                <div class="col-sm-8 col-xs-12">
                                    <select id="lang" name="lang" ng-control="lang" (change)="selectLangChange()" class="form-control" required>
                                        <option *ng-for="#lang of languages" [value]="lang.id">{{ lang.name }}</option>
                                    </select>
                                </div>

                                <div class="col-sm-8 col-sm-offset-4 col-xs-12">
                                    <span class="help-block fade-in fade-out" [hidden]="paramsForm.controls.lang.valid">{{'REQUIRED' | translate}}</span>
                                </div>
                            </div>

                            <div class="form-group row" [ng-class]="{'has-error': !paramsForm.controls.rootFolder.valid}">
                                <label class="col-sm-4 col-xs-12 control-label" for="rootFolder">{{'ROOT_FOLDER' | translate}}</label>

                                <div class="col-sm-8 col-xs-12">
                                    <input type="text" id="rootFolder" name="rootFolder" value="" class="form-control" ng-control="rootFolder" placeholder="ex: /home/user/Videos/TV" required>
                                </div>

                                <div class="col-sm-8 col-sm-offset-4 col-xs-12">
                                    <span class="help-block">{{'ROOT_FOLDER_HINT' | translate}}</span>
                                    <span [hidden]="paramsForm.controls.rootFolder.valid" class="help-block fade-in fade-out">{{'REQUIRED' | translate}}</span>
                                </div>
                            </div>

                            <div class="form-group row" [ng-class]="{'has-error': !paramsForm.controls.username.valid}">
                                <label class="col-sm-4 col-xs-12 control-label" for="username">{{'USERNAME' | translate}}</label>

                                <div class="col-sm-8 col-xs-12">
                                    <input type="text" id="username" name="username" value="" class="form-control" ng-control="username">
                                </div>

                                <div class="col-sm-8 col-sm-offset-4 col-xs-12">
                                    <span class="help-block">{{'USERNAME_HINT' | translate}}</span>
                                </div>
                            </div>

                            <div class="form-group row fade-in" [ng-class]="{'has-error': !paramsForm.controls.password.valid}" [hidden]="!paramsForm.value.username || paramsForm.value.username === ''">
                                <label class="col-sm-4 col-xs-12 control-label" for="password">{{ 'PASSWORD' | translate }}</label>

                                <div class="col-sm-8 col-xs-12">
                                    <input type="password" id="password" name="password" class="form-control" ng-control="password" ng-minlength="8">
                                </div>

                                <div class="col-sm-8 col-sm-offset-4 col-xs-12">
                                    <span [hidden]="!paramsForm.controls.password.errors" class="help-block fade-in fade-out">{{'MIN_LENGTH' | translate:'{ nb: 5 }'}}</span>
                                </div>
                            </div>

                            <div class="form-group row fade-in" [hidden]="!paramsForm.value.password || paramsForm.value.password === ''" [ng-class]="{'has-error': !paramsForm.controls.password2.valid || paramsForm.value.password != paramsForm.value.password2}">
                                <label class="col-sm-4 col-xs-12 control-label" for="password_password2">{{ 'PASSWORD_CONFIRM' | translate }}</label>

                                <div class="col-sm-8 col-xs-12">
                                    <input type="password" id="password_password2" name="password2" ng-control="password2" class="form-control">
                                </div>

                                <div class="col-sm-8 col-sm-offset-4 col-xs-12">
                                    <span [hidden]="paramsForm.value.password === paramsForm.value.password2" class="help-block fade-in fade-out">{{'MATCH_PASSWD' | translate}}</span>
                                </div>
                            </div>

                            <div class="form-group row" [ng-class]="{'has-error': getProviders().length === 0}">
                                <label class="col-sm-4 col-xs-12 control-label" for="username">{{'PROVIDERS' | translate}}</label>

                                <div class="col-sm-8 col-xs-12">
                                    <select chosen id="providers" (change)="test($event)" multiple="true" name="providers" class="form-control" placeholder="'PROVIDERS_PLACEHOLDER' | translate" required>
                                        <option value="betaSeries">BetaSeries</option>
                                        <option value="addic7ed">Addic7ed</option>
                                    </select>
                                </div>

                                <div class="col-sm-8 col-sm-offset-4 col-xs-12">
                                    <span [hidden]="getProviders().length > 0" class="help-block fade-in fade-out">{{'REQUIRED' | translate}}</span>
                                </div>
                            </div>

                            <div class="form-group row" [ng-class]="{'has-error': !paramsForm.controls.subLang.valid}">
                                <label class="col-sm-4 col-xs-12 control-label" for="username">{{'SUBTITLES_LANG' | translate}}</label>

                                <div class="col-sm-8 col-xs-12">
                                    <select id="subLang" name="subLang" ng-control="subLang" class="form-control" required>
                                        <option *ng-for="#lang of languages" [value]="lang.id">{{ lang.name }}</option>
                                    </select>
                                </div>

                                <div class="col-sm-8 col-sm-offset-4 col-xs-12">
                                    <span [hidden]="paramsForm.controls.subLang.valid" class="help-block fade-in fade-out">{{'REQUIRED' | translate}}</span>
                                </div>

                                <div class="col-sm-8 col-sm-offset-4 col-xs-12">
                                    <div class="checkbox">
                                        <label>
                                            <input type="checkbox" id="autorename" name="autorename" ng-control="autorename"> {{ 'AUTORENAME' | translate }}
                                        </label>
                                    </div>
                                </div>

                                <div class="col-sm-8 col-sm-offset-4 col-xs-12" [hidden]="!paramsForm.value.autorename">
                                    <div class="checkbox">
                                        <label>
                                            <input type="checkbox" id="autorename_ext" name="autorename_ext" ng-control="autorename_ext"> {{ 'AUTORENAME_EXT' | translate }}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <loader [hidden]="!loading"></loader>
                        <button type="submit" class="btn btn-success" [disabled]="!paramsForm.valid || sending || getProviders().length === 0" (click)="saveParams()">{{ 'SAVE' | translate }}</button>
                        <span class="btn btn-secondary" data-dismiss="modal">{{ 'CLOSE' | translate }}</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    directives: [FORM_DIRECTIVES, LoaderComponent, NgFor, NgClass],
    pipes: [TranslatePipe]
})
@Injectable()
export class ParamsComponent {
    loading: Boolean = false;
    sending: Boolean = false;
    static appParams: any = {};

    // Available languages
    languages: Array<Object> = [{
        id: 'en',
        name: 'English'
    }, {
        id: 'fr',
        name: 'Français'
    }, {
        id: 'nl',
        name: 'Nederlandse'
    }];

    providersSelect: HTMLSelectElement;
    $providersSelect: JQuery;

    lang: Control = new Control("", Validators.required);
    rootFolder: Control = new Control("", Validators.required);
    username: Control = new Control("");
    password: Control = new Control("", Validators.minLength(5));
    password2: Control = new Control("", Validators.minLength(5));
    subLang: Control = new Control("", Validators.required);
    autorename: Control = new Control("", Validators.required);
    autorename_ext: Control = new Control("");

    paramsForm: ControlGroup = new ControlGroup({
        lang: this.lang,
        rootFolder: this.rootFolder,
        username: this.username,
        password: this.password,
        password2: this.password2,
        subLang: this.subLang,
        autorename: this.autorename,
        autorename_ext: this.autorename_ext
    });

    constructor(private rest: RestService, private translate: TranslateService, element: ElementRef) {
        this.rest.get('api/params').toPromise().then((params: any) => {
            ParamsComponent.appParams = params;
            if(typeof params.rootFolder === 'undefined') {
                $('#paramsModal').modal();
            }

            this.translate.onLangChange.observer({
                next: (params: any) => {
                    if(this.lang.value !== params.lang) {
                        this.lang.updateValue(params.lang, {});
                    }
                }
            });
            this.lang.updateValue(this.translate.currentLang, {});
            this.rootFolder.updateValue(params.rootFolder, {});
            this.username.updateValue(params.username, {});
            this.password.updateValue(params.password, {});
            this.password2.updateValue(params.password, {});
            this.subLang.updateValue(params.subLang, {});
            this.autorename.updateValue(params.autorename, {});
            this.autorename_ext.updateValue(params.autorename_ext, {});

            setTimeout(() => {
                this.$providersSelect.select2('val', params.providers);
            });
        });

        this.providersSelect = element.nativeElement.querySelector('select[name=providers]');
        this.$providersSelect = $(this.providersSelect).select2();
    }

    getProviders() {
        var val = this.$providersSelect.select2('val');
        return val ? val : [];
    }

    selectLangChange() {
        this.translate.use(this.lang.value);
    }

    saveParams() {
        this.sending = true;
        var formData = this.paramsForm.value;
        formData.providers = this.getProviders();
        this.rest.post('api/params', formData).toPromise().then((res: RestResponse) => {
            if(res.success) {
                window.location.reload();
            } else {
                console.error(res);
            }
            this.sending = false;
        });
    }
}
