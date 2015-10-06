import {Component, View, Inject, ElementRef} from 'angular2/angular2';
import {RouteParams} from 'angular2/router';

@Component({ selector: 'loader' })
@View({
    template: `
        <canvas height="40px" width="40px"></canvas>
        <img src="img/subnode-mask2.png" alt="Loading...">
  `,
})
export class LoaderComponent {
    element: HTMLElement;

    constructor(@Inject(ElementRef) element: ElementRef) {
        this.element = element.nativeElement;
        this.element.hidden = true;

        var canvas : HTMLCanvasElement = null,
            context : CanvasRenderingContext2D = null,
            time = 0;

        var makeNoise = function() {
            var imgd = context.createImageData(canvas.width, canvas.height),
                pix = imgd.data,
                waveHeight = 800,
                opacity = 200; // 255 = 100% opaque

            for (var i = 0, n = pix.length; i < n; i += 4) {
                var c = 6 + Math.sin(i/waveHeight + time/7); // A sine wave of the form sin(ax + bt)
                pix[i] = pix[i+1] = pix[i+2] = 40 * Math.random() * c; // Set a random gray
                pix[i+3] = opacity;
            }

            context.putImageData(imgd, 0, 0);
            time = (time + 1) % canvas.height;

            setTimeout(makeNoise, 50);
        };

        var setup = function() {
            canvas = element.nativeElement.querySelector('canvas');
            context = canvas.getContext("2d");
        };

        setup();
        makeNoise();
    }
}
