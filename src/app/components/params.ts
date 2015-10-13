import {Component, Injectable, FORM_DIRECTIVES, FORM_BINDINGS, NgFor, NgClass, Validators, ControlGroup, Control} from 'angular2/angular2';
import {ShowSelector} from "../directives/showSelector";
import {LoaderComponent} from "./loader";
import {TranslatePipe} from "ng2-translate";

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
                                        <option *ng-for="#lang of languages" value="lang.id">{{ lang.name }}</option>
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
                                    <select chosen id="providers" multiple="true" name="providers" ng-control="providers" class="form-control" placeholder="'PROVIDERS_PLACEHOLDER' | translate" required>
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
                        <loader></loader>
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
export class ParamsComponent {
    paramsForm: ControlGroup;

    languages: Array<Object> = [{
        id: 'fr',
        name: 'French'
    }];

    constructor() {
        this.paramsForm = new ControlGroup({
            lang: new Control("", Validators.required),
            rootFolder: new Control("", Validators.required),
            username: new Control(""),
            password: new Control(""),
            password2: new Control(""),
            providers: new Control("", Validators.required),
            subLang: new Control("", Validators.required),
            autorename: new Control("", Validators.required),
            autorename_ext: new Control("")
        });

        //console.log(this.paramsForm);
    }
}
