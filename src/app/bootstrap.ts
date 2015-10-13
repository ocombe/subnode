import {bind, bootstrap, FORM_BINDINGS} from 'angular2/angular2';
import {routerBindings, HashLocationStrategy, LocationStrategy} from 'angular2/router';
import {HTTP_BINDINGS} from 'angular2/http';
import {AppComponent} from './components/app';

//noinspection TypeScriptValidateTypes
bootstrap(AppComponent, [
	routerBindings(AppComponent),
    HTTP_BINDINGS,
    FORM_BINDINGS,
	bind(LocationStrategy).toClass(HashLocationStrategy)
]);
