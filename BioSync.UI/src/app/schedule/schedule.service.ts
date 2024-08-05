import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environment/appsetting";
import {Schedule} from "../../model/schedule-model";

@Injectable()
export class ScheduleService {
  url = `${environment.apiUrl}/api/v1/schedules`
  constructor(private http: HttpClient) { }

  getAllSchedules(){
    return this.http.get<Schedule[]>(this.url);
  }
}
