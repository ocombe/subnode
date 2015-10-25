import {PipeTransform, Pipe} from 'angular2/angular2';
import {Subtitle} from "../interfaces/Subtitle";

var cachedInput: Array<Object>;

@Pipe({name: 'qualitySort'})
export class QualitySortPipe implements PipeTransform {
    transform(input: Array<Subtitle>, seasons: string[]): any {
        if (!input || cachedInput === input) {
            return input;
        }

        cachedInput = input.sort(function (a: Subtitle, b: Subtitle) {
            return a.quality == b.quality ? _.max(b.content, 'score').score - _.max(a.content, 'score').score : b.quality - a.quality;
        });

        return cachedInput;
    }
}
