import {Component} from 'angular2/angular2';
import {ShowSelector} from "../directives/showSelector";
import {LoaderComponent} from "./loader";
import {RouterLink} from 'angular2/router';
import {TranslatePipe} from "ng2-translate/ng2-translate";

@Component({
    selector: 'footer',
    template: `
        <p class="copyright"><a href='https://github.com/ocombe/subNode' target='_blank'>subNode</a> {{ 'BY' | translate }} <a href="https://twitter.com/OCombe" target="_blank">Olivier Combe</a> © 2013-2015</p>
        <a href="http://www.betaseries.com" target="_blank"><img src="img/betaseries.png"></a>
        <a href="http://www.addic7ed.com/" target="_blank"><img src="img/addic7ed.png"></a><br/><br/>
        <div class="btn-toolbar ng-cloak">
            <a href="api/exit" class="btn btn-danger"><span class="glyphicon glyphicon-off"></span> {{ 'SHUTDOWN' | translate }}</a>
        </div>
	`,
    directives: [ShowSelector, LoaderComponent, RouterLink],
    pipes: [TranslatePipe]
})
export class FooterComponent {
}
