import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { Laboratory } from '../model/laboratory.model';
import {environment} from "../../environment/appsetting";
import {CookieService} from "./cookie.service";

@Injectable()
export class AddLaboratoryService {
  url = `${environment.apiUrl}/api/v1/laboratories`;
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  createLaboratory(laboratory: Laboratory){
    return this.http.post<Laboratory>(this.url, laboratory, {
      withCredentials: true,
      headers: this.headers
    });
  }
}