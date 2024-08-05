import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Schedule} from "../../model/schedule-model";
import {environment} from "../../../environment/appsetting";

@Injectable({
  providedIn: 'root'
})
export class ViewScheduleService {

  constructor(private http: HttpClient) { }

  getSchedule(id: number) {
    const url = `${environment.apiUrl}/api/v1/schedules/${id}`;
    return this.http.get<Schedule>(url);
  }
}
