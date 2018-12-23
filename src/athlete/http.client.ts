import { HttpService, Injectable } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { RatesService } from '../rates/rates.service';
import { tap } from 'rxjs/operators';
import * as _ from 'lodash';

@Injectable()
export class HttpClient {

  private readonly requests: {} = {};

  constructor(private readonly _http: HttpService,
              private readonly _rates: RatesService) {
  }

  request<T = any>(config: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    return this._http.request(config);
  }

  get<T = any>(url: string, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    // todo : anything extra here that you want
    // console.log(`API calls to : ${path}, ${this.requests[path]}`);
    if (this._rates.fifteenCalls + 5 < RatesService.FifteenRate
      || this._rates.dayCalls + 5 < RatesService.DayRate) {

      return this._http.get(url, config)
        .pipe(
          tap(resp => {
            const [fifteenMin, day] = resp.headers['x-ratelimit-usage'].split(',').map(Number);
            this._rates.fifteenCalls = fifteenMin;
            this._rates.dayCalls = day;

            // todo : adjust the interval according to the distance from the limit
            const allowance = _.max([fifteenMin / RatesService.FifteenRate, fifteenMin / RatesService.DayRate]);

            if (allowance > 0.9) {
              this._rates.interval *= 5;
            } else if (allowance > 0.9) {
              this._rates.interval *= 2;
            } else {
              let int = this._rates.interval / 2; // less time between requests
              int = _.max([int, 5000]); // never drop below this number
              if (int !== this._rates.interval) {
                this._rates.interval = int;
              }
            }

          }));

    } else {
      throw new Error('need to slow down');
    }
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    return this._http.delete(url, config);
  }

  head<T = any>(url: string, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    return this._http.head(url, config);
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    return this._http.post(url, data, config);
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    return this._http.put(url, data, config);
  }

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    return this._http.patch(url, data, config);
  }

}