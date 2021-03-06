import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageService } from './message.service';

import { Route } from './route';
import { Filter } from './filter';
import { Fields } from './fields';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://api-v3.mbta.com/';

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) { }

  getResource(resource: string, filters?: Filter[], fields?: Fields, sort?: string): Observable<any> {
    let filterString = '';
    if (filters) {
      for (const filter of filters) {
        filterString +=  `filter[${filter.resource}]=${filter.values.replace(/\s/g, '')}&`;
      }
    }

    let fieldString = '';
    if (fields) {
      fieldString = `fields[${fields.resource}]=${fields.values.replace(/\s/g, '')}&`;
    }

    let sortString = '';
    if (sort) {
      sortString = `sort=${sort.replace(/\s/g, '')}`;
    }

    const url = encodeURI(this.baseUrl + resource + '/?' + filterString + fieldString + sortString);

    return this.http.get<any>(url)
    .pipe(
      tap(_ => this.log(`fetched ${resource}`)),
      catchError(this.handleError<any>('getResource', []))
    );
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

}