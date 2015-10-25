import {Component} from 'angular2/angular2';
import {ShowSelector} from "../directives/showSelector";
import {LoaderComponent} from "./loader";
import {RouterLink} from 'angular2/router';

@Component({
    selector: 'navbar',
    template: `
        <nav class="navbar navbar-fixed-top">
            <a class="navbar-brand hidden-sm-down" [router-link]="['/Home']"><img src="img/subnode.png"></a>
            <a class="navbar-brand hidden-md-up" [router-link]="['/Home']"><i class="glyphicon glyphicon-home"></i></a>
            <show-selector></show-selector>
            <a class="pull-right paramsBtn glyphicon glyphicon-cog" data-toggle="modal" data-target="#paramsModal"></a>
        </nav>
	`,
    directives: [ShowSelector, LoaderComponent, RouterLink]
})
export class NavbarComponent {
}
