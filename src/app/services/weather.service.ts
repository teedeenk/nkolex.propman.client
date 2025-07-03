import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable ({
  providedIn: "root"
})

export class WeatherService {
  private apiUrl = "http://nkolexpropmanserver-env.eba-kvm5usp9.eu-north-1.elasticbeanstalk.com/weatherforecast";

  constructor(private http: HttpClient) {}

  getweather(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
