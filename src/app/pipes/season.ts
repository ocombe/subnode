import {PipeTransform, Pipe} from 'angular2/angular2';
import _ = require('lodash');
import {Episode} from "../interfaces/Episode";

@Pipe({name: 'season'})
export class SeasonPipe implements PipeTransform {
    transform(query:Array<Episode>, seasons:string[]):any {
        if(query.length === 0) {
            return query;
        }

        var s = Number(seasons[0]);
        var res =  _.find(query, obj => obj.season === s);
        return res ? [res] : [];
    }
}
