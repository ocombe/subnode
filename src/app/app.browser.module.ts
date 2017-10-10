import {NgModule} from '@angular/core';
import {ServiceWorkerModule} from "@angular/service-worker";
import {environment} from "../environments/environment";
import {AppComponent} from './app.component';
import {AppModule} from "./app.module";

@NgModule({
  imports: [
    AppModule,

    // register the service worker
    environment.production ? ServiceWorkerModule.register('/ngsw-worker.js') : []
  ],
  providers: [],
  // Since the bootstrapped component is not inherited from your
  // imported AppModule, it needs to be repeated here.
  bootstrap: [AppComponent],
})
export class AppBrowserModule {
}
