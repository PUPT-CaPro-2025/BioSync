import { Injectable } from '@angular/core';
import {environment} from "../../environment/app.setting";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CookieService} from "./cookie.service";
import {Suffix} from "../model/suffix.model";

@Injectable()
export class SuffixService {
  url = `${environment.apiUrl}/api/v1/suffixes`
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  getSuffixes(){
    return this.http.get<Suffix[]>(this.url, {
      headers: this.headers,
      withCredentials: true
    })
  }
}
