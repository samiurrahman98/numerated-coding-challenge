import { Component, OnInit } from '@angular/core';

import { Route } from '../route';
import { Stop } from '../stop';
import { RoutePattern } from '../route-pattern';
import { PredictionWrapper, Prediction, PredictionState } from './../prediction';
import { RequestWrapper } from './../request';

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

  // change handlers

  onSelectRoute(routeId: string): void {
    this.clearStops();
    this.clearRoutePatterns();
    this.clearNextPredictedDeparture();

    this.selectedRoute = routeId;
    this.messageService.add(`ProjectComponent: Selected route id = ${routeId}`);
    this.getStops(this.selectedRoute);
  }

  onSelectStop(stopId: string): void {
    this.clearRoutePatterns();
    this.clearNextPredictedDeparture();

    this.selectedStop = stopId;
    this.messageService.add(`ProjectComponent: Selected stop id = ${stopId}`);
    this.getRoutePatterns(this.selectedRoute, this.selectedStop);
  }

  onSelectRoutePattern(routePatternId: string): void {
    this.clearNextPredictedDeparture();

    this.selectedRoutePattern = routePatternId;
    this.messageService.add(`ProjectComponent: Selected route pattern id = ${routePatternId}`);
    this.getNextPredictedDepartureTime(this.selectedRoute, this.selectedStop, this.selectedRoutePattern);
  }

  // methods to prepare requests to service

  getRoutes(): void {
    const rw = new RequestWrapper('routes');
    rw.addFilter('type', '0,1');
    rw.specifyFields('route', 'long_name,direction_names');
    rw.specifySortParam('long_name');

    this.apiService.getResource(rw)
      .subscribe(val => {
        this.routes = val.data;
      });
  }

  getStops(routeId: string): void {
    const rw = new RequestWrapper('stops');
    rw.addFilter('route', routeId);
    rw.specifyFields('stop', 'name,address');
    rw.specifySortParam('name');

    this.apiService.getResource(rw)
      .subscribe(val => {
        this.stops = val.data;
      });
  }

  getRoutePatterns(routeId: string, stopId: string) {
    const rw = new RequestWrapper('route_patterns');
    rw.addFilter('route', routeId);
    rw.addFilter('stop', stopId);
    rw.specifySortParam('direction_id');

    this.apiService.getResource(rw)
      .subscribe(val => {
        const route: Route = this.routes.find(r => r.id === routeId);
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

  getNextPredictedDepartureTime(routeId: string, stopId: string, routePatternId: string): void {
    const rw = new RequestWrapper('predictions');
    rw.addFilter('route', routeId);
    rw.addFilter('stop', stopId);
    rw.addFilter('route_pattern', routePatternId);
    rw.specifyFields('prediction', 'departure_time');
    rw.specifyLimit(1);

    this.apiService.getResource(rw)
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

  // methods to clear previously set options due to change in higher-level value

  clearStops(): void {
    this.selectedStop = null;
    this.stops = [];
  }

  clearRoutePatterns(): void {
    this.selectedRoutePattern = null;
    this.routePatterns = [];
  }

  clearNextPredictedDeparture(): void {
    this.nextPredictedDeparture = null;
  }
}
