import {bootstrap, FORM_PROVIDERS, provide} from 'angular2/angular2';
import {ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';
import {AppComponent} from './components/app';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {RestService} from './services/rest';
import {RouterService} from "./services/router";

bootstrap(AppComponent, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    FORM_PROVIDERS,
    provide(LocationStrategy, {useClass: HashLocationStrategy}), // use #/ routes instead of HTML5 mode
    RestService,
    TranslateService,
    RouterService
]);
