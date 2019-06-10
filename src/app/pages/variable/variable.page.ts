import { Component } from '@angular/core';
import { Company, Site, Sensor, SampleService, Sample } from '../../service/sample.service';
import { CurrentSelectionService } from '../../service/current-selection.service';
import { NavController, AlertController } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-variable',
  templateUrl: 'variable.page.html',
  styleUrls: ['variable.page.scss']
})
export class VariablePage {
  project: Company;
  site: Site;
  sensor: Sensor;
  currentValues: Sample[] = [];
  newValue = 4;

  labelChanged = false;

  constructor(
    public selectionService: CurrentSelectionService,
    public sampleService: SampleService,
    public nav: NavController,
    public alertController: AlertController
  ) {
    this.sensor = selectionService.currentSensor;
    this.selectionService.sensorChanged.subscribe(
      sensor => {
        this.sensor = sensor;
        this.currentValues = [];
      }
    );
    this.sampleService.samples.changed.subscribe(
      sample => {
        if (this.sensor && sample.sensorId === this.sensor.id) {
          this.currentValues.unshift(sample);
        }
      }
    );
  }

  setLabelChanged() {
    this.labelChanged = true;
  }

  updateSensor() {
    if (this.sensor) {
      this.sampleService.sensors.upsert(this.sensor);
      this.labelChanged = false;
    }
  }

  async removeSensor() {
    if (this.sensor) {
      const alert = await this.alertController.create({
        header: 'Remove the sensor',
        message: `Are you sure to remove the sensor of <strong>${this.sensor.name}</strong>?`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
          }, {
            text: 'OK',
            handler: () => {
              this.sampleService.sensors.delete(this.sensor.id);
              this.nav.back();
            }
          }
        ]
      });
      await alert.present();
    }
  }

  addSensorValue() {
    if (this.sensor) {
      const v: Sample = {
        keywords: '',
        lastUpdated: moment().unix(),
        deleted: false,
        sensorId: this.sensor.id,
        value: this.newValue,
        tm: new Date(),
      };
      this.sampleService.samples.upsert(v);
    }
  }
}
