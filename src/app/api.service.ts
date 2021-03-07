import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageService } from './message.service';

import { RequestWrapper, Filter, Fields } from './request';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://api-v3.mbta.com/';
  private regExp = /[&]{2,}/g; // Reg Exp targets consecutive occurences of ampersands >= 2

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) { }

  getResource(r: RequestWrapper): Observable<any> {
    const resource = r.getResource();
    const filters = r.getFilters();
    const fields = r.getFields();
    const sortParam = r.getSortParam();
    const limit = r.getLimit();

    const filterString = this.buildFilterString(filters);
    const fieldString = this.buildFieldString(fields);
    const sortString = this.buildSortString(sortParam);
    const limitString = this.buildLimitString(limit);

    const url = encodeURI(
                  this.cleanConsecutiveAmpersands(this.baseUrl + resource + '/?' + filterString + fieldString + sortString + limitString)
                );

    return this.http.get<any>(url)
    .pipe(
      tap(_ => this.log(`fetched ${resource}`)),
      catchError(this.handleError<any>('getResource', []))
    );
  }

  // string builder helpers

  buildFilterString(filters: Filter[]): string {
    const filterArray = [];
    let filterString = '';
    if (filters) {
      for (const filter of filters) {
        filterArray.push(`filter[${filter.resource}]=${filter.values}`);
      }
      filterString = filterArray.join('&');
    }
    return filterString;
  }

  buildFieldString(fields: Fields): string {
    let fieldString = '';
    if (fields) {
      fieldString = `&fields[${fields.resource}]=${fields.values}&`;
    }
    return fieldString;
  }

  buildSortString(sortParam: string): string {
    let sortString = '';
    if (sortParam) {
      sortString = `&sort=${sortParam}&`;
    }
    return sortString;
  }

  buildLimitString(limit: number): string {
    let limitString = '';
    if (limit > 0) {
      limitString = `&page[limit]=${limit}`;
    }
    return limitString;
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private log(message: string) {
    this.messageService.add(`ApiService: ${message}`);
  }

  private cleanConsecutiveAmpersands(dirtyString: string): string {
    return dirtyString.replace(this.regExp, '&');
  }

}
