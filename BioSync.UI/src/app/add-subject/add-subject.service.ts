import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Subject} from "../../model/subject-model";
import {environment} from "../../../environment/appsetting";

@Injectable()
export class AddSubjectService {

  constructor(private http: HttpClient) { }

  createSubject(subject: Subject){
    const url = `${environment.apiUrl}/api/v1/subjects`;
    return this.http.post<Subject>(url, subject);
  }

}
