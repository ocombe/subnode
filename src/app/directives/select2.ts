import {Directive, ElementRef, Inject, EventEmitter} from 'angular2/angular2';
import 'select2';

/**
 * This directive applies select2 on each <select> element
 */
@Directive({
    selector: 'select'
})
export class Select2 {
    constructor(@Inject(ElementRef) element: ElementRef) {
        $(element.nativeElement).select2().on('change', function(e) {
            element.nativeElement.dispatchEvent(new Event('selected')); // relay the event
        });
    }
}
