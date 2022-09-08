import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Data} from "../interfaces/data";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private readonly http: HttpClient) { }

  getDataFromApi(word: string): Observable<Data> {
    return this.http.get<Data>(`https://chroniclingamerica.loc.gov/search/titles/results/?terms=${word}&format=json`);
  }
}
