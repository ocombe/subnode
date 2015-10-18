import {bind, bootstrap, FORM_PROVIDERS} from 'angular2/angular2';
import {ROUTER_PROVIDERS, HashLocationStrategy, LocationStrategy} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';
import {AppComponent} from './components/app';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {RestService} from './services/rest';

bootstrap(AppComponent, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    FORM_PROVIDERS,
    bind(LocationStrategy).toClass(HashLocationStrategy),
    RestService,
    TranslateService
]);
