import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environment/appsetting";
import {Subject} from "../../model/subject-model";

@Injectable()
export class SubjectService {

  constructor(private http: HttpClient) { }

  getSubjects(){
    const url = `${environment.apiUrl}/api/v1/subjects`
    return this.http.get<Subject[]>(url);
  }
}
