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
            <div class="dropdown hidden-md-up pull-left">
                <a class="navbar-brand" data-toggle="dropdown"><img src="img/subnode-icon-white.png"></a>
                <div class="dropdown-menu">
                    <a class="dropdown-item" [router-link]="['/Home']">{{ 'HOME' | translate }}</a>
                    <!--<a class="dropdown-item" [router-link]="['/Shows']">{{ 'SHOWS' | translate }}</a>-->
                </div>
            </div>
            <show-selector></show-selector>
            <!--<ul class="nav navbar-nav hidden-sm-down">-->
                <!--<li class="nav-item active">-->
                  <!--<a class="nav-link" [router-link]="['/Shows']">{{ 'SHOWS' | translate }}</a>-->
                <!--</li>-->
            <!--</ul>-->
            <div class="dropdown pull-right">
                <a class="paramsBtn glyphicon glyphicon-cog" data-toggle="dropdown"></a>
                <div class="dropdown-menu dropdown-menu-right">
                    <a class="dropdown-item" data-toggle="modal" data-target="#paramsModal">{{ 'PARAMS' | translate }}</a>
                    <div class="dropdown-divider"></div>
                    <a href="api/exit" class="dropdown-item">
                        <span class="glyphicon glyphicon-off"></span> {{ 'SHUTDOWN' | translate }}
                    </a>
                </div>
            </div>
        </nav>
	`,
    directives: [ShowSelector, LoaderComponent, RouterLink],
    pipes: [TranslatePipe]
})
export class NavbarComponent {
}
