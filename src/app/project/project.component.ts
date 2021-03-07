import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Route } from '../route';
import { Stop } from '../stop';
import { RoutePattern } from '../route-pattern';
import { PredictionWrapper, Prediction, PredictionState } from './../prediction';

import { Filter } from './../filter';
import { Fields } from './../fields';

import { ApiService } from '../api.service';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
  selectedRoute: string; // id
  selectedStop: string; // id
  selectedRoutePattern: string; // id

  routes: Route[] = [];
  stops: Stop[] = [];
  routePatterns: RoutePattern[] = [];
  nextPredictedDeparture: PredictionWrapper;
  predictionState = PredictionState;
  nextPredictedDepartureTimeNotFound = 'We could not find an upcoming departure time for the provided specifications within the current calendar day.';

  constructor(private apiService: ApiService, private messageService: MessageService) { }

  ngOnInit() {
    this.getRoutes();
  }

  onSelectRoute(routeId: string): void {
    this.selectedStop = null;
    this.stops = [];

    this.selectedRoutePattern = null;
    this.routePatterns = [];

    this.nextPredictedDeparture = null;

    this.selectedRoute = routeId;
    this.messageService.add(`ProjectComponent: Selected route id = ${routeId}`);
    this.getStops(this.selectedRoute);
  }

  onSelectStop(stopId: string): void {
    this.selectedRoutePattern = null;
    this.routePatterns = [];

    this.nextPredictedDeparture = null;

    this.selectedStop = stopId;
    this.messageService.add(`ProjectComponent: Selected stop id = ${stopId}`);
    this.getRoutePatterns(this.selectedRoute, this.selectedStop);
  }

  onSelectRoutePattern(routePatternId: string): void {
    this.nextPredictedDeparture = null;

    this.selectedRoutePattern = routePatternId;
    this.messageService.add(`ProjectComponent: Selected direction id = ${routePatternId}`);
    this.getNextPredictedDepartureTime(this.selectedRoute, this.selectedStop, this.selectedRoutePattern);
  }

  getRoutes(): void {
    const endpoint = 'routes';

    const filters: Filter[] = [];
    const filter: Filter = {
      resource: 'type',
      values: '0,1'
    };
    filters.push(filter);

    const fields: Fields = {
      resource: 'route',
      values: 'long_name,direction_names'
    };

    const sort = 'long_name';

    this.apiService.getResource(endpoint, filters, fields, sort)
      .subscribe(val => {
        this.routes = val.data;
      });
  }

  getStops(routeId: string): void {
    const endpoint = 'stops';

    const filters: Filter[] = [];
    const filter: Filter = {
      resource: 'route',
      values: routeId
    };
    filters.push(filter);

    const fields: Fields = {
      resource: 'stop',
      values: 'name,address'
    };

    const sort = 'name';

    this.apiService.getResource(endpoint, filters, fields, sort)
      .subscribe(val => {
        this.stops = val.data;
      });
  }

  getRoutePatterns(routeId: string, stopId: string) {
    const route: Route = this.routes.find(r => r.id === routeId);

    const endpoint = 'route_patterns';

    const filters: Filter[] = [];
    const routeFilter: Filter = {
      resource: 'route',
      values: routeId
    };
    filters.push(routeFilter);

    const stopFilter: Filter = {
      resource: 'stop',
      values: stopId
    };
    filters.push(stopFilter);

    let fields: Fields;

    const sort = 'direction_id';

    this.apiService.getResource(endpoint, filters, fields, sort)
      .subscribe(val => {
        for (const routePattern of val.data) {
          const routePatternId = routePattern.id;
          const routePatternName = routePattern.attributes.name;
          const directionId = routePattern.attributes.direction_id;
          const directionName = route.attributes.direction_names[directionId];

          const direction: RoutePattern = {
            label: `${directionName}: ${routePatternName}`,
            id: `${routePatternId}`
          };
          this.routePatterns.push(direction);
        }
      });
  }

  getNextPredictedDepartureTime(routeId: string, stopId: string, directionId: string): void {
    const endpoint = 'predictions';

    const filters: Filter[] = [];
    const routeFilter: Filter = {
      resource: 'route',
      values: routeId
    };
    filters.push(routeFilter);

    const stopFilter: Filter = {
      resource: 'stop',
      values: stopId
    };
    filters.push(stopFilter);

    const directionFilter: Filter = {
      resource: 'direction_id',
      values: directionId
    };
    filters.push(directionFilter);

    const fields: Fields = {
      resource: 'prediction',
      values: 'departure_time'
    };

    const sort = '';

    const limit = 1;

    this.apiService.getResource(endpoint, filters, fields, sort, limit)
      .subscribe(val => {
        if (val.data) {
          this.nextPredictedDeparture =  {
            state: this.predictionState.NotLoaded,
            prediction: val.data[0]
          };
        }
        this.nextPredictedDeparture.state = PredictionState.Loaded;
      });
  }
}
