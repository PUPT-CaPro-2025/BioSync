import { Injectable } from '@angular/core';

@Injectable({
  providedIn: "root"
})
export class CookieService {

  getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
  }

  setCookie(name: string, value: string, expiry?: number): void {
    if(expiry) {
      const expires = new Date(expiry).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
    } else {
      document.cookie = `${name}=${encodeURIComponent(value)}; path=/`;
    }
  }

  deleteCookie(name: string): void {
    this.setCookie(name, '', -1);
  }
}
