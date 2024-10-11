import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/app.setting';
import { User } from '../model/user.model';

@Injectable({
  providedIn: 'root',
})
export class FaceRecognitionService {
  url = `${environment.serviceUrl}`;
  headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  encodeFaceDate(user: User, base64String: string) {
    const payload = {
      user: user,
      image_data: base64String,
    };

    return this.http.post(`${this.url}/encode_face`, payload, {
      headers: this.headers,
      withCredentials: true,
    });
  }

  compareFaceData(schedule_id: number, base64Image: string){
    const payload = {
      schedule_id: schedule_id,
      image_data: base64Image,
    }

    return this.http.post(`${this.url}/recognize_face`, payload, {
      withCredentials: true,
    });
  }
}
