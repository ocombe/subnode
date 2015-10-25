import {Injectable} from 'angular2/angular2';
import {Router, Location} from 'angular2/router';

@Injectable()
export class RouterService {
    constructor(public router: Router, public location: Location) {}

    encodeURIComponent(str: string) {
        return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
            return '%' + c.charCodeAt(0).toString(16);
        });
    }

    normalize(params: Array<string|Object>) {
        return _.map(params, (param: string|Object) => typeof param === 'object' ? _.mapValues(param, (p: string) => this.encodeURIComponent(p)) : param);
    }

    navigate(params: Array<string|Object>) {
        this.router.navigate(this.normalize(params));
    }
}
