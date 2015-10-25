import {PipeTransform, Pipe} from 'angular2/angular2';
import {Season} from "../interfaces/Season";

@Pipe({name: 'season'})
export class SeasonPipe implements PipeTransform {
    transform(query: Array<Season>, seasons: number[]): any {
        if (query.length === 0) {
            return query;
        }

        var s = seasons[0];
        var res = _.find(query, obj => obj.season === s);
        return res ? [res] : [];
    }
}
