import {View, Component} from 'angular2/angular2';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {NavbarComponent} from './nav';
import {ShowComponent} from './show';
import {HomeComponent} from './home';

@Component({ selector: 'subNode' })
@View({
  template: `
    <navbar></navbar>
    <!--<a [router-link]="['./Dashboard']">Dashboard</a>-->
    <!--<a [router-link]="['./Characters']">Characters</a>-->
    <div id="mainView" class="container">
        <router-outlet></router-outlet>
    </div>
    `,
  directives: [ROUTER_DIRECTIVES, NavbarComponent]
})
@RouteConfig([
  { path: '/', as: 'Home', component: HomeComponent },
  { path: '/show/:id', as: 'Show', component: ShowComponent }
])
export class AppComponent { }
