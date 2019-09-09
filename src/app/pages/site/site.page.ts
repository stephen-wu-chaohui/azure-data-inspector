import { Component } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { SampleService, Site, Company, Sensor, Entity } from '../../service/sample.service';
import { CurrentSelectionService } from '../../service/current-selection.service';

@Component({
  selector: 'app-site',
  templateUrl: 'site.page.html',
  styleUrls: ['site.page.scss']
})
export class SitePage {
  labelChanged = false;
  project: Company;
  site: Site;
  sensors: Sensor[];
  currentValues = {};

  constructor(
    public selectionService: CurrentSelectionService,
    public sampleService: SampleService,
    public nav: NavController,
    public alertController: AlertController
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
    if (this.selectionService.editMode) {
      this.nav.navigateForward('/sensor');
    } else {
      this.nav.navigateForward('/variable');
    }
  }

  onAnalytics() {
    this.nav.navigateForward('/site-graph');
  }

  setLabelChanged() {
    this.labelChanged = true;
  }

  updateSite() {
    if (this.site) {
      this.sampleService.sites.upsert(this.site);
      this.labelChanged = false;
    }
  }

  async removeSensor(sensor) {
    if (this.site && sensor) {
      const alert = await this.alertController.create({
        header: 'Remove the sensor',
        message: `Are you sure to remove the sensor of <strong>${sensor.name}</strong>?`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
          }, {
            text: 'OK',
            handler: () => {
              this.sampleService.sensors.delete(sensor.id);
              this.nav.back();
            }
          }
        ]
      });
      await alert.present();
    }
  }

  addSensor() {
    if (!this.site) {
      return;
    }
    const newSensor: Sensor = {
      keywords: '',
      lastUpdated: Entity.unixNow(),
      deleted: false,
      siteId: this.site.id,
      name: 'New Sensor',
      description: 'Auto generated new site',
    };
    this.sampleService.sensors.upsert(newSensor);
    this.selectionService.currentSensor = newSensor;
  }
}
