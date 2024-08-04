import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environment/appsetting";
import {Subject} from "../../model/subject-model";

@Injectable()
export class SubjectService {
  url = `${environment.apiUrl}/api/v1/subjects`

  constructor(private http: HttpClient) { }

  getSubjects(){
    return this.http.get<Subject[]>(this.url);
  }

  deleteSubject(id: number | undefined) {
    return this.http.delete(this.url, { body: { id } });
  }
}
