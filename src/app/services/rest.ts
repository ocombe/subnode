import {Inject} from 'angular2/angular2';
import {Http, Response, Headers} from 'angular2/http';

export class RestService {
    http: Http;

    constructor(@Inject(Http) http: Http) {
        this.http = http;
    }

    get(route: string) {
        return this.http.get(route)
            .map((res: Response) => res.json());
    }

    post(route: string, params: Object) {
        return this.http.post(route, JSON.stringify(params), {
            headers: new Headers({"Content-Type": "application/json"})
        }).map((res: Response) => res.json());
    }
}

export interface RestResponse {
    success?: Boolean;
}
