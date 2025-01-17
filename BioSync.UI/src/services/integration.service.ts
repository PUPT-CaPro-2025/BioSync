import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environment/app.setting";
import * as CryptoJS from 'crypto-js';
import {CookieService} from "./cookie.service";

@Injectable()
export class IntegrationService {
  url = `${environment.apiUrl}/api/v1/schedules/sync`;
  integrationUrl = environment.integrationUrl;
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);
  private readonly SECRET_KEY = environment.INTEGRATION_SECRET_KEY;

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  getSchedulesToSync() {
    const headers = this.generateHMACHeaders();
    return this.http.get(this.integrationUrl, { headers });
  }

  syncSchedules(computer_laboratory_schedules: any) {
    return this.http.post(this.url, computer_laboratory_schedules, {
      headers: this.headers,
      withCredentials: true
    });
  }

  private generateHMACHeaders(): HttpHeaders {
    // Step 1: Get current timestamp
    const timestamp = Math.floor(Date.now() / 1000);

    // Step 2: Generate random nonce
    const nonce = Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Step 3: Construct the message for HMAC calculation
    const method = 'GET';
    const url = this.integrationUrl;
    const body = ''; // Empty string for GET requests
    const message = `${method}|${url}|${body}|${timestamp}|${nonce}`;

    // Step 4: Calculate HMAC signature
    const signature = CryptoJS.HmacSHA256(message, this.SECRET_KEY).toString();

    // Step 5: Return headers with all required fields
    return new HttpHeaders({
      'X-HMAC-Timestamp': timestamp.toString(),
      'X-HMAC-Nonce': nonce,
      'X-HMAC-Signature': signature,
      'Content-Type': 'application/json'
    });
  }
}
