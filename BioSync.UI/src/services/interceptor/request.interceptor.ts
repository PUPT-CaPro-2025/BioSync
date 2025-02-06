import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { CookieService } from '../cookie.service';
import { Router } from '@angular/router';
import {MatDialog} from "@angular/material/dialog";
import {
    PromptOkayComponent
} from "../../app/prompt/prompt-okay/prompt-okay.component";

export function requestInterceptorFactory(
    cookieService: CookieService,
    router: Router,
    dialog: MatDialog
): HttpInterceptorFn {
  return (req, next) => {
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // custom status for expired tokens
            // since we use 401 for attendance verification

          let isDialogOpen = false;

          if (error.status === 419 && !isDialogOpen) {
              isDialogOpen = true;
              const ref = dialog.open(PromptOkayComponent, {
                  width: '500px',
                  data: {
                      title: 'Credentials Expired',
                      message: 'Credentials have been expired. Please log in' +
                          ' again.'
                  }
              })

              ref.afterClosed().subscribe(() => {
                  cookieService.deleteCookie('authToken');
                  cookieService.deleteCookie('role');
                  cookieService.deleteCookie('user_id');
                  localStorage.removeItem('activeButton');
                  router.navigate(['/login']).then(() => {
                      isDialogOpen = false;
                  });
              })
          }
          return throwError(() => error);
        })
    );
  };
}
