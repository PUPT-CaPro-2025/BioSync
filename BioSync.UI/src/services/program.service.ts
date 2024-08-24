import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environment/appsetting";
import {CookieService} from "./cookie.service";
import {Program} from "../model/program.model";

@Injectable()
export class ProgramService {
  url = `${environment.apiUrl}/api/v1/programs`
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  getAllPrograms(){
    return this.http.get<Program[]>(this.url, {
      headers: this.headers,
      withCredentials: true
    });
  }

}
