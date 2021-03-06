import { DirectionWrapper, DirectionWrapperBuilt } from './../direction';
import { Component, OnInit } from '@angular/core';

import { Route } from '../route';
import { Stop } from '../stop';
import { Direction } from '../direction';
import { ApiService } from '../api.service';
import { MessageService } from '../message.service';

import { Filter } from './../filter';
import { Fields } from './../fields';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
  selectedRoute?: string; // id
  selectedStop?: string; // id
  selectedDirection?: string; // id

  routes: Route[] = [];
  stops: Stop[] = [];
  directionsBuilt: DirectionWrapperBuilt = {
    built: false
  };
  directions: DirectionWrapper[] = [];

  constructor(private apiService: ApiService, private messageService: MessageService) {}

  ngOnInit() {
    this.getRoutes();
  }

  onSelectRoute(routeId: string): void {
    this.selectedStop = null;
    this.stops = [];
    this.selectedDirection = null;
    // this.directionsBuilt.built = false;
    this.directionsBuilt =  {
      built: false
    };
    // this.directions = [];

    this.selectedRoute = routeId;
    this.messageService.add(`ProjectComponent: Selected route id = ${routeId}`);
    this.getStops(this.selectedRoute);
  }

  onSelectStop(stopId: string): void {
    this.selectedDirection = null;
    // this.directions = [];
    this.selectedStop = stopId;
    this.messageService.add(`ProjectComponent: Selected stop id = ${stopId}`);
    this.getDirections(this.selectedRoute, this.selectedStop);
  }

  onSelectDirection(directionId: string): void {
    this.selectedDirection = directionId;
    this.messageService.add(`ProjectComponent: Selected direction id = ${directionId}`);
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
    // place function call here so async call can be made without blocking main thread, allowing concurrent execution of both
    // functions
    this.getDirectionLabels(routeId);
  }

  getDirectionLabels(routeId: string) {
    const route: Route[] = this.routes.filter(r => r.id === routeId); // should only contain a single route because of unique id
    for (const d of route[0].attributes.direction_names) {
      const dw: DirectionWrapper = {
        label: d
      };
      this.directions.push(dw);
    }
  }

  getDirections(routeId: string, stopId: string) {
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

    let sort = 'direction_id';

    this.apiService.getResource(endpoint, filters, fields, sort = sort)
      .subscribe(val => {
        let i = 0;
        for (const d of val.data) {
          const dir: Direction = {
            attributes: {
              directionId: d.attributes.direction_id
            }
          };
          this.directions[i++].directionObject = dir;
        }
        const drb: DirectionWrapperBuilt = {
          built: true,
          directionWrappers: this.directions
        };
        this.directionsBuilt = drb;
      });
  }
}
