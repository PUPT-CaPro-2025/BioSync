import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Subject} from "../../model/subject-model";
import {environment} from "../../../environment/appsetting";

@Injectable()
export class AddSubjectService {
  url = `${environment.apiUrl}/api/v1/subjects`;

  constructor(private http: HttpClient) { }

  createSubject(subject: Subject){
    return this.http.post<Subject>(this.url, subject);
  }



}
