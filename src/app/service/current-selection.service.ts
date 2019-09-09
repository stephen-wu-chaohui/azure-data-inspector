import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Company, Site, Sensor, Sample, SampleService } from './sample.service';

@Injectable({
  providedIn: 'root'
})
export class CurrentSelectionService {

  editMode = false;

  // Project
  private selectedProject: Company;
  projectChanged = new Subject<Company>();
  get currentProject(): Company { return this.selectedProject; }
  set currentProject(newValue: Company) {
    this.selectedProject = newValue;
    if (newValue) {
      this.projectChanged.next(newValue);
    }
    this.currentSite = null;
    this.currentSensor = null;
  }

  // Site
  private selectedSite: Site;
  siteChanged = new Subject<Site>();
  get currentSite(): Site { return this.selectedSite; }
  set currentSite(newValue: Site) {
    this.selectedSite = newValue;
    if (newValue) {
      this.siteChanged.next(newValue);
    }
    this.currentSensor = null;
  }

  // Sensor
  private selectedSensor: Sensor;
  sensorChanged = new Subject<Sensor>();
  get currentSensor(): Sensor { return this.selectedSensor; }
  set currentSensor(newValue: Sensor) {
    this.selectedSensor = newValue;
    if (newValue) {
      this.sensorChanged.next(newValue);
    }
  }

  constructor() {
  }

}
