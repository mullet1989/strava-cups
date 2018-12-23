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

    return this._http.get(url, config)
      .pipe(
        tap(resp => {
          const [fifteenMin, day] = resp.headers['x-ratelimit-usage'].split(',').map(Number);
          this._rates.fifteenCalls = fifteenMin;
          this._rates.dayCalls = day;

          // todo : adjust the interval according to the distance from the limit
          const allowance = _.max([fifteenMin / RatesService.FifteenRate, fifteenMin / RatesService.DayRate]);

          if (allowance > 0.9) {
            this._rates.interval = 1000 * 60 * 15; // set to 15 min timeout
          } else if (allowance > 0.8) {
            let int = this._rates.interval * 2;
            int = _.min([int, 1000 * 60 * 15]); // never go above 15 mins
            if (int !== this._rates.interval) {
              this._rates.interval = int;
            }
          } else {
            let int = this._rates.interval / 2; // less time between requests
            int = _.max([int, 1000 * 30]); // never drop below this number
            if (int !== this._rates.interval) {
              this._rates.interval = int;
            }
          }

        }));
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