import {PipeTransform, Pipe} from 'angular2/angular2';
import 'lodash';

var cachedInput;

@Pipe({name: 'qualitySort'})
export class QualitySortPipe implements PipeTransform {
    transform(input:any, seasons:string[]):any {
        if(!input || cachedInput === input) {
            return input;
        }

        cachedInput = input.sort(function(a, b) {
            return a['quality'] == b['quality'] ? _.max(b.content, 'score')['score'] - _.max(a.content, 'score')['score'] : b['quality'] - a['quality'];
        });

        return cachedInput;
    }
}
