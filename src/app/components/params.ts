import {Component, Injectable, FORM_DIRECTIVES, NgFor, NgClass, Validators, ControlGroup, Control} from 'angular2/angular2';
import {ShowSelector} from "../directives/showSelector";
import {LoaderComponent} from "./loader";
import {TranslateService, TranslatePipe} from "ng2-translate/ng2-translate";
import {RestService} from '../services/rest';

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
                            <div class="form-group" [ng-class]="{'has-error': !paramsForm.controls.lang.valid}">
                                <label class="col-lg-4 control-label">{{'INTERFACE_LANG' | translate}}</label>

                                <div class="col-lg-8">
                                    <select id="lang" name="lang" ng-control="lang" ng-change="selectLangChange()" class="form-control" required>
                                        <option *ng-for="#lang of languages" [value]="lang.id">{{ lang.name }}</option>
                                    </select>
                                </div>

                                <div class="col-lg-8 pull-right">
                                    <span class="help-block fade-in fade-out" [hidden]="paramsForm.controls.lang.valid">{{'REQUIRED' | translate}}</span>
                                </div>
                            </div>

                            <div class="form-group" [ng-class]="{'has-error': !paramsForm.controls.rootFolder.valid}">
                                <label class="col-lg-4 control-label" for="rootFolder">{{'ROOT_FOLDER' | translate}}</label>

                                <div class="col-lg-8">
                                    <input type="text" id="rootFolder" name="rootFolder" value="" class="form-control" ng-control="rootFolder" placeholder="ex: /home/user/Videos/TV" required>
                                </div>

                                <div class="col-lg-8 pull-right">
                                    <span class="help-block">{{'ROOT_FOLDER_HINT' | translate}}</span>
                                    <span [hidden]="paramsForm.controls.rootFolder.valid" class="help-block fade-in fade-out">{{'REQUIRED' | translate}}</span>
                                </div>
                            </div>

                            <div class="form-group" [ng-class]="{'has-error': !paramsForm.controls.username.valid}">
                                <label class="col-lg-4 control-label" for="username">{{'USERNAME' | translate}}</label>

                                <div class="col-lg-8">
                                    <input type="text" id="username" name="username" value="" class="form-control" ng-control="username">
                                </div>

                                <div class="col-lg-8 pull-right">
                                    <span class="help-block">{{'USERNAME_HINT' | translate}}</span>
                                </div>
                            </div>

                            <div class="form-group fade-in" [ng-class]="{'has-error': !paramsForm.controls.password.valid}" [hidden]="!paramsForm.value.username || paramsForm.value.username === ''">
                                <label class="col-lg-4 control-label" for="password">{{ 'PASSWORD' | translate }}</label>

                                <div class="col-lg-8">
                                    <input type="password" id="password" name="password" class="form-control" ng-control="password" ng-pattern="/\d+/" ng-minlength="8">
                                </div>

                                <div class="col-lg-8 pull-right">
                                    <span [hidden]="!paramsForm.controls.password.errors" class="help-block fade-in fade-out">{{'MIN_NUMBER' | translate:'{ nb: 1 }'}}</span>
                                    <span [hidden]="!paramsForm.controls.password.errors" class="help-block fade-in fade-out">{{'MIN_LENGTH' | translate:'{ nb: 8 }'}}</span>
                                </div>
                            </div>

                            <div class="form-group fade-in" [hidden]="!paramsForm.value.password || paramsForm.value.password === ''" [ng-class]="{'has-error': !paramsForm.controls.password2.valid || paramsForm.value.password != paramsForm.value.password2}">
                                <label class="col-lg-4 control-label" for="password_password2">{{ 'PASSWORD_CONFIRM' | translate }}</label>

                                <div class="col-lg-8">
                                    <input type="password" id="password_password2" name="password2" ng-control="password2" class="form-control">
                                </div>

                                <div class="col-lg-8 pull-right">
                                    <span [hidden]="paramsForm.value.password === paramsForm.value.password2" class="help-block fade-in fade-out">{{'MATCH_PASSWD' | translate}}</span>
                                </div>
                            </div>

                            <div class="form-group" class="{'has-error': !paramsForm.controls.providers.valid}">
                                <label class="col-lg-4 control-label" for="username">{{'PROVIDERS' | translate}}</label>

                                <div class="col-lg-8">
                                    <select chosen id="providers" (change)="test($event)" multiple="true" name="providers" ng-control="providers" class="form-control" placeholder="'PROVIDERS_PLACEHOLDER' | translate" required>
                                        <option value="betaSeries">BetaSeries</option>
                                        <option value="addic7ed">Addic7ed</option>
                                    </select>
                                </div>

                                <div class="col-lg-8 pull-right">
                                    <span [hidden]="paramsForm.controls.providers.valid" class="help-block fade-in fade-out">{{'REQUIRED' | translate}}</span>
                                </div>
                            </div>

                            <div class="form-group" [ng-class]="{'has-error': !paramsForm.controls.subLang.valid}">
                                <label class="col-lg-4 control-label" for="username">{{'SUBTITLES_LANG' | translate}}</label>

                                <div class="col-lg-8">
                                    <select id="subLang" name="subLang" ng-control="subLang" class="form-control" required>
                                        <option *ng-for="#lang of languages" [value]="lang.id">{{ lang.name }}</option>
                                    </select>
                                </div>

                                <div class="col-lg-8 pull-right">
                                    <span [hidden]="paramsForm.controls.subLang.valid" class="help-block fade-in fade-out">{{'REQUIRED' | translate}}</span>
                                </div>

                                <div class="col-lg-8 pull-right">
                                    <div class="checkbox">
                                        <label>
                                            <input type="checkbox" id="autorename" name="autorename" ng-control="autorename"> {{ 'AUTORENAME' | translate }}
                                        </label>
                                    </div>
                                </div>

                                <div class="col-lg-8 pull-right" [hidden]="!paramsForm.value.autorename">
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
                        <button type="submit" class="btn btn-success" disabled="!paramsForm.valid || sending" ng-click="saveParams()">{{ 'SAVE' | translate }}</button>
                        <span class="btn btn-default" data-dismiss="modal">{{ 'CLOSE' | translate }}</span>
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
    private rest: RestService;
    private translate;
    paramsForm: ControlGroup;
    loading: Boolean = false;

    languages: Array<Object> = [{
        id: 'fr',
        name: 'Français'
    }];

    lang: Control = new Control("", Validators.required);
    rootFolder: Control = new Control("", Validators.required);
    username: Control = new Control("");
    password: Control = new Control("");
    password2: Control = new Control("");
    providers: Control = new Control("", Validators.required);
    subLang: Control = new Control("", Validators.required);
    autorename: Control = new Control("", Validators.required);
    autorename_ext: Control = new Control("");

    paramsForm: ControlGroup = new ControlGroup({
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

    constructor(rest: RestService, translate: TranslateService) {
        this.rest = rest;
        this.translate = translate;

        this.rest.get('params').toPromise().then(params => {
            //if(typeof params.rootFolder === 'undefined') {
                $('#paramsModal').modal();
            //}

            this.lang.updateValue(this.translate.currentLanguage, {});
            this.rootFolder.updateValue(params.rootFolder, {});
            this.username.updateValue(params.username, {});
            this.password.updateValue(params.password, {});
            this.password2.updateValue(params.password, {});
            this.providers.updateValue(params.providers, {});
            this.subLang.updateValue(params.subLang, {});
            this.autorename.updateValue(params.autorename, {});
            this.autorename_ext.updateValue(params.autorename_ext, {});
        });

        //console.log(this.paramsForm);
    }

    test(event) {
        console.log('change', event.target.value, this.providers);
        var selected = _.pluck(_.filter(event.target.options, {selected: true}), 'value');
        // todo update provider or use something that supports multiple values
    }
}
