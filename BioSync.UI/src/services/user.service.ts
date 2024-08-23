import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environment/appsetting";
import {CookieService} from "./cookie.service";
import {User} from "../model/user.model";
import {Observable} from "rxjs";

@Injectable()
export class UserService {
  url = `${environment.apiUrl}/api/v1`;
  token = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.url}/auth/register`, user, {
      headers: this.headers,
      withCredentials: true
    });
  }

  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.url}/users/role/${role}`, {
      headers: this.headers,
      withCredentials: true
    })
  }
}
