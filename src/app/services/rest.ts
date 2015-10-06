import {Inject} from 'angular2/angular2';
import {Http, HTTP_BINDINGS, Response} from 'angular2/http';

export class RestService {
    http: Http;

    constructor(@Inject(Http) http: Http) {
        this.http = http;
    }

    get(route: string) {
        return this.http.get(route)
            .map((res: Response) => res.json());
    }
}
