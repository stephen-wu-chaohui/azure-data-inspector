import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SampleService, Site, Company, Sensor } from '../../service/sample.service';
import { CurrentSelectionService } from '../../service/current-selection.service';
import * as moment from 'moment';

@Component({
  selector: 'app-site',
  templateUrl: 'site.page.html',
  styleUrls: ['site.page.scss']
})
export class SitePage {
  project: Company;
  site: Site;
  sensors: Sensor[];
  currentValues = {};

  constructor(
    public selectionService: CurrentSelectionService,
    public sampleService: SampleService,
    public nav: NavController
  ) {
    this.site = selectionService.currentSite;
    if (this.site) {
      this.sensors = this.sampleService.sensorsOf(this.site);
    }

    this.selectionService.siteChanged.subscribe(site => this.site = site);
    this.project = selectionService.currentProject;
    this.selectionService.projectChanged.subscribe(project => {
      this.project = project;
      this.selectionService.currentSite = null;
      this.nav.navigateRoot('/project');
    });

    this.selectionService.siteChanged.subscribe(site => {
      this.site = site;
      this.selectionService.currentSensor = null;
      if (this.site) {
        this.sensors = this.sampleService.sensorsOf(this.site);
      }
    });

    this.sampleService.sensors.mounted.subscribe(
      data => {
        if (this.site) {
          this.sensors = this.sampleService.sensorsOf(this.site);
        }
      }
    );
    this.sampleService.sensors.changed.subscribe(
      s => {
        if (this.site && s.siteId === this.site.id) {
          this.sensors = this.sampleService.sensorsOf(this.site);
        }
      }
    );

    this.sampleService.samples.changed.subscribe(
      sample => {
        if (this.site && this.sensors && this.sensors.find(s => s.id === sample.sensorId)) {
          this.currentValues[sample.sensorId] = sample.value;
        }
      }
    );
  }

  configSensor(sensor: Sensor) {
    this.selectionService.currentSensor = sensor;
    this.nav.navigateForward('/variable');
  }

  deleteSensor(sensor: Sensor) {
    this.selectionService.currentSensor = null;
    this.sampleService.sensors.delete(sensor.id);
  }

  addSensor() {
    if (!this.site) {
      return;
    }
    const newSensor: Sensor = {
      keywords: '',
      lastUpdated: moment().unix(),
      deleted: false,
      siteId: this.site.id,
      name: 'New Sensor',
      description: 'Auto generated new site',
    };
    this.sampleService.sensors.upsert(newSensor);
    this.selectionService.currentSensor = newSensor;
  }
}
