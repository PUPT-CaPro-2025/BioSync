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

  createSuffix(suffix: Suffix){
    return this.http.post<Suffix>(this.url, suffix, {
      headers: this.headers,
      withCredentials: true
    })
  }

  updateSuffix(suffix: Suffix){
    return this.http.put<Suffix>(this.url, suffix, {
      headers: this.headers,
      withCredentials: true
    })
  }

  deleteSuffix(suffix: Suffix){
    return this.http.delete(this.url, {
      body: { id: suffix.id },
      headers: this.headers,
      withCredentials: true
    })
  }
}
