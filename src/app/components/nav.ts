import {Component} from 'angular2/angular2';
import {ShowSelector} from "../directives/showSelector";
import {LoaderComponent} from "./loader";
import {RouterLink} from 'angular2/router';
import {TranslatePipe} from "ng2-translate/ng2-translate";

@Component({
    selector: 'navbar',
    template: `
        <nav class="navbar navbar-fixed-top">
            <a class="navbar-brand hidden-sm-down" [router-link]="['/Home']"><img src="img/subnode-white.png"></a>
            <a class="navbar-brand hidden-md-up" [router-link]="['/Home']"><i class="glyphicon glyphicon-home"></i></a>
            <show-selector></show-selector>
            <span class="nav-divider"></span>
            <ul class="nav navbar-nav">
                <li class="nav-item active">
                  <a class="nav-link" [router-link]="['/Shows']">{{ 'SHOWS' | translate }}</a>
                </li>
            </ul>
            <a class="pull-right paramsBtn glyphicon glyphicon-cog" data-toggle="modal" data-target="#paramsModal"></a>
        </nav>
	`,
    directives: [ShowSelector, LoaderComponent, RouterLink],
    pipes: [TranslatePipe]
})
export class NavbarComponent {
}
