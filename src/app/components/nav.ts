import {Component, View} from 'angular2/angular2';
import {ShowSelector} from "../directives/showSelector";

@Component({
    selector: 'navbar'
})
@View({
    template: `
        <nav class="navbar navbar-fixed-top">
            <a class="navbar-brand hidden-sm" href="#"><img src="img/subnode.png"></a>
            <a class="navbar-brand visible-sm glyphicon glyphicon-home" href="#"></a>
            <show-selector></show-selector>
            <a class="pull-right paramsBtn glyphicon glyphicon-cog" modal-open="partials/config.html"></a>
        </nav>
	`,
    directives: [ShowSelector]
})
export class NavbarComponent {

}
