import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PushingService } from './pushing.service';
import { SigDataService, SigData } from './sig-data.service';
import { AppDataService } from './app-data.service';
import * as moment from 'moment';

export class Entity implements SigData {
  id?: number;
  keywords: '';
  lastUpdated: number;
  deleted: false;

  constructor() {
    this.lastUpdated = moment().unix();
  }
}

export class Company extends Entity {
  name: string;
  description: string;
}

export class Site extends Entity {
  companyId: number;
  name: string;
  description: string;
}

export class Sensor extends Entity {
  siteId: number;
  name: string;
  description: string;
}

export class Sample extends Entity {
  sensorId: number;
  tm: Date;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class Projects extends SigDataService<Company> {
  constructor(httpClient: HttpClient, appConfig: AppDataService, ngZone: NgZone, pushingService: PushingService) {
    super(httpClient, appConfig, ngZone, pushingService, 'Companies', true);
  }
}

@Injectable({
  providedIn: 'root'
})
export class Sites extends SigDataService<Site> {
  constructor(httpClient: HttpClient, appConfig: AppDataService, ngZone: NgZone, pushingService: PushingService) {
    super(httpClient, appConfig, ngZone, pushingService, 'Sites', true);
  }
}

@Injectable({
  providedIn: 'root'
})
export class Sensors extends SigDataService<Sensor> {
  constructor(httpClient: HttpClient, appConfig: AppDataService, ngZone: NgZone, pushingService: PushingService) {
    super(httpClient, appConfig, ngZone, pushingService, 'Sensors', true);
  }
}

@Injectable({
  providedIn: 'root'
})
export class Samples extends SigDataService<Sample> {
  constructor(httpClient: HttpClient, appConfig: AppDataService, ngZone: NgZone, pushingService: PushingService) {
    super(httpClient, appConfig, ngZone, pushingService, 'Samples', true);
  }
}


@Injectable({
  providedIn: 'root'
})
export class SampleService {
  constructor(
    public projects: Projects,
    public sites: Sites,
    public sensors: Sensors,
    public samples: Samples) {
      projects.start();
      sites.start();
      sensors.start();
      samples.start();
  }

  sitesOf(project: Company): Site[] {
    return project ? this.sites.data.filter(s => s.companyId === project.id) : [];
  }

  sensorsOf(site: Site) {
    return site ? this.sensors.data.filter(s => s.siteId === site.id) : [];
  }

  samplesOf(sensor: Sensor) {
    return sensor ? this.samples.data.filter(s => s.sensorId === sensor.id) : [];
  }
}

