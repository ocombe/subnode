System.register(['angular2/angular2', 'select2'], function(exports_1) {
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
    var Select2;
    return {
        setters:[
            function (angular2_1_1) {
                angular2_1 = angular2_1_1;
            },
            function (_1) {}],
        execute: function() {
            /**
             * This directive applies select2 on each <select> element
             */
            Select2 = (function () {
                function Select2(element) {
                    $(element.nativeElement).select2().on('change', function (e) {
                        element.nativeElement.dispatchEvent(new Event('selected')); // relay the event
                    });
                }
                Select2 = __decorate([
                    angular2_1.Directive({
                        selector: 'select'
                    }),
                    __param(0, angular2_1.Inject(angular2_1.ElementRef)), 
                    __metadata('design:paramtypes', [Object])
                ], Select2);
                return Select2;
            })();
            exports_1("Select2", Select2);
        }
    }
});
