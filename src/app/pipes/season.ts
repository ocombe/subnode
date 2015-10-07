import {PipeTransform, Pipe} from 'angular2/angular2';
import 'lodash';

@Pipe({name: 'season'})
export class SeasonPipe implements PipeTransform {
    transform(query:any, seasons:string[]):any {
        if(query.length === 0) {
            return query;
        }

        var s = seasons[0];
        var res =  _.find(query, obj => obj['season'] == s);
        return res ? [res] : [];
    }
}
