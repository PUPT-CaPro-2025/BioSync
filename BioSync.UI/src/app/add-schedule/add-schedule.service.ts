import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environment/appsetting";
import {Schedule} from "../../model/schedule-model";

@Injectable()
export class AddScheduleService {

  constructor(private http: HttpClient) { }

  createSchedule(schedule: Schedule){
    const url = `${environment.apiUrl}/api/v1/schedules`;
    return this.http.post<Schedule>(url, schedule);
  }
}
