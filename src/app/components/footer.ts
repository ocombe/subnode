import {Component} from 'angular2/angular2';
import {ShowSelector} from "../directives/showSelector";
import {LoaderComponent} from "./loader";
import {RouterLink} from 'angular2/router';
import {TranslatePipe} from "ng2-translate/ng2-translate";

@Component({
    selector: 'footer',
    template: `
        <p class="copyright"><a href='https://github.com/ocombe/subNode' target='_blank'>subNode</a> {{ 'BY' | translate }} <a href="https://twitter.com/OCombe" target="_blank">Olivier Combe</a> © 2015</p>
        <a href="http://www.betaseries.com" target="_blank">Betaseries</a> -
        <a href="http://www.addic7ed.com/" target="_blank">Addic7ed</a> -
        <a href="https://trakt.tv/" target="_blank">Trakt api</a>
	`,
    directives: [ShowSelector, LoaderComponent, RouterLink],
    pipes: [TranslatePipe]
})
export class FooterComponent {
}
