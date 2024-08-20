import { Injectable } from '@angular/core';
import {CookieService} from "../cookie.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private cookieService: CookieService) {}

  isAuthenticated(): boolean {
    const token = this.cookieService.getCookie('authToken');

    return !!token;
  }
}
