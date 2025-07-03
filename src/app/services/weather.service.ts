import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable ({
  providedIn: "root"
})

export class WeatherService {
  private apiUrl = "https://cnwnr4b3t9.execute-api.eu-north-1.amazonaws.com/prod/weatherforecast";

  constructor(private http: HttpClient) {}

  getweather(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
