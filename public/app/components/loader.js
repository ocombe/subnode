System.register(['angular2/angular2'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
            case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
            case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
            case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
        }
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = (this && this.__param) || function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };
    var angular2_1;
    var LoaderComponent;
    return {
        setters:[
            function (angular2_1_1) {
                angular2_1 = angular2_1_1;
            }],
        execute: function() {
            LoaderComponent = (function () {
                function LoaderComponent(element) {
                    this.element = element.nativeElement;
                    this.element.hidden = true;
                    var canvas = null, context = null, time = 0;
                    var makeNoise = function () {
                        var imgd = context.createImageData(canvas.width, canvas.height), pix = imgd.data, waveHeight = 800, opacity = 200; // 255 = 100% opaque
                        for (var i = 0, n = pix.length; i < n; i += 4) {
                            var c = 6 + Math.sin(i / waveHeight + time / 7); // A sine wave of the form sin(ax + bt)
                            pix[i] = pix[i + 1] = pix[i + 2] = 40 * Math.random() * c; // Set a random gray
                            pix[i + 3] = opacity;
                        }
                        context.putImageData(imgd, 0, 0);
                        time = (time + 1) % canvas.height;
                        setTimeout(makeNoise, 50);
                    };
                    var setup = function () {
                        canvas = element.nativeElement.querySelector('canvas');
                        context = canvas.getContext("2d");
                    };
                    setup();
                    makeNoise();
                }
                LoaderComponent = __decorate([
                    angular2_1.Component({ selector: 'loader' }),
                    angular2_1.View({
                        template: "\n        <canvas height=\"40px\" width=\"40px\"></canvas>\n        <img src=\"img/subnode-mask2.png\" alt=\"Loading...\">\n  ",
                    }),
                    __param(0, angular2_1.Inject(angular2_1.ElementRef)), 
                    __metadata('design:paramtypes', [Object])
                ], LoaderComponent);
                return LoaderComponent;
            })();
            exports_1("LoaderComponent", LoaderComponent);
        }
    }
});
