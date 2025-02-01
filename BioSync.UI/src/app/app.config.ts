import {ApplicationConfig, inject} from '@angular/core';
import {provideRouter, Router} from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {CookieService} from "../services/cookie.service";
import {
  requestInterceptorFactory
} from "../services/interceptor/request.interceptor";
import {MatDialog} from "@angular/material/dialog";

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(
        withInterceptors([
          (req, next) => requestInterceptorFactory(
              inject(CookieService),
              inject(Router),
              inject(MatDialog)
          )(req, next)
        ])
    )]
};
