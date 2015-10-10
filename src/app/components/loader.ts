import {Component, Inject, ElementRef, OnChanges, SimpleChange} from 'angular2/angular2';
import {RouteParams} from 'angular2/router';

@Component({
    selector: 'loader',
    properties: ['hidden'],
    template: `
        <canvas height="40px" width="40px"></canvas>
        <img src="img/subnode-mask2.png" alt="Loading...">
  `,
})
export class LoaderComponent implements OnChanges {
    canvas : HTMLCanvasElement = null;
    context : CanvasRenderingContext2D = null;
    time: number = 0;
    element: HTMLElement;

    constructor(@Inject(ElementRef) element: ElementRef) {
        this.element = element.nativeElement;
        this.canvas = element.nativeElement.querySelector('canvas');
        this.context = this.canvas.getContext("2d");

        this.makeNoise();
    }

    onChanges(changes: {[hidden: string]: SimpleChange}) {
        if(changes['hidden'].currentValue === false) {
            this.element.hidden = false;
            this.makeNoise();
        } else {
            this.element.hidden = true;
        }
    }

    makeNoise() {
        if (this.element && !this.element.hidden) {
            var imgd = this.context.createImageData(this.canvas.width, this.canvas.height),
                pix = imgd.data,
                waveHeight = 800,
                opacity = 200; // 255 = 100% opaque

            for (var i = 0, n = pix.length; i < n; i += 4) {
                var c = 6 + Math.sin(i / waveHeight + this.time / 7); // A sine wave of the form sin(ax + bt)
                pix[i] = pix[i + 1] = pix[i + 2] = 40 * Math.random() * c; // Set a random gray
                pix[i + 3] = opacity;
            }

            this.context.putImageData(imgd, 0, 0);
            this.time = (this.time + 1) % this.canvas.height;


            setTimeout(() => this.makeNoise(), 50);
        }
    };
}
