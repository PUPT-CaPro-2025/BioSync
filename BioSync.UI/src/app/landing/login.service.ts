import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environment/appsetting";
import {Authentication} from "../../model/authentication.model";
import {Observable} from "rxjs";

@Injectable()
export class LoginService {

  constructor(private http: HttpClient) { }

  login(loginCredentials: { usercode: string, password: string }): Observable<Authentication>{
    const url = `${environment.apiUrl}/api/v1/auth/login`;

    return this.http.post<Authentication>(url, loginCredentials);
  }
}
