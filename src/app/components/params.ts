import {Component, Injectable, FORM_DIRECTIVES, FORM_BINDINGS, NgFor, FormBuilder, Validators, ControlGroup} from 'angular2/angular2';
import {ShowSelector} from "../directives/showSelector";
import {LoaderComponent} from "./loader";
import {TranslatePipe} from "ng2-translate";

@Injectable()
@Component({
    selector: 'params',
    viewProviders: [FormBuilder],
    template: `
        <!-- Modal -->
        <div class="modal fade" id="paramsModal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>
                        <h4 class="modal-title">{{ 'PARAMS' | translate }}</h4>
                    </div>
                    <div class="modal-body">
                        <form class="form-horizontal">
              </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `,
    directives: [FORM_DIRECTIVES, LoaderComponent, NgFor],
    pipes: [TranslatePipe]
})
export class ParamsComponent {
    paramsForm: ControlGroup;

    languages: Array<Object> = [{
        id: 'fr',
        name: 'French'
    }];

    constructor(builder: FormBuilder) {
        this.paramsForm = builder.group({
            lang: ['', Validators.required],
            rootFolder: ['', Validators.required],
            userName: ['', Validators.required],
            passwordRetry: builder.group({
                password: ["", Validators.required],
                password2: ["", Validators.required]
            }),
            providers: ['', Validators.required],
            subLang: ['', Validators.required],
            autorename: ['', Validators.required],
            autorename_ext: ['', Validators.required]
        });
    }
}
