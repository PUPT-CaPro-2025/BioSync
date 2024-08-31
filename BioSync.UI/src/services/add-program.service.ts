import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { Program } from '../model/program.model';
import {environment} from "../../environment/app.setting";
import {CookieService} from "./cookie.service";

@Injectable()
export class AddProgramService {
  url = `${environment.apiUrl}/api/v1/programs`;
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  createProgram(program: Program){
    return this.http.post<Program>(this.url, program, {
      withCredentials: true,
      headers: this.headers
    });
  }



}