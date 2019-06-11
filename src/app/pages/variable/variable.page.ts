import { Component, AfterViewInit } from '@angular/core';
import { Company, Site, Sensor, SampleService, Sample, Entity } from '../../service/sample.service';
import { CurrentSelectionService } from '../../service/current-selection.service';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { SimulateModalPage } from './simulate-modal/simulate-modal.page';

@Component({
  selector: 'app-variable',
  templateUrl: 'variable.page.html',
  styleUrls: ['variable.page.scss']
})
export class VariablePage implements AfterViewInit {
  project: Company;
  site: Site;
  sensor: Sensor;
  currentValues: Sample[] = [];
  newValue = 4;

  labelChanged = false;

  lastUpdatedOf(s: Sample) { return moment.unix(s.lastUpdated).toDate(); }

  constructor(
    public selectionService: CurrentSelectionService,
    public sampleService: SampleService,
    public nav: NavController,
    public alertController: AlertController,
    public modalController: ModalController    
  ) {
    this.sensor = this.selectionService.currentSensor;

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
    this.sampleService.samples.mounted.subscribe(
      samples => this.mountSamples()
    );
  }

  async ngAfterViewInit() {
    this.mountSamples();
  }

  mountSamples() {
    if (this.sensor) {
      setTimeout(()=>{
        this.currentValues = this.sampleService.samples.data.filter(v => v.sensorId === this.sensor.id).sort((a,b) => (b.lastUpdated - a.lastUpdated));
      }, 500);
    }
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

  addSensorValue() {
    if (this.sensor) {
      const v: Sample = {
        keywords: '',
        lastUpdated: Entity.unixNow(),
        deleted: false,
        sensorId: this.sensor.id,
        value: this.newValue,
        tm: new Date(),
      };
      this.sampleService.samples.upsert(v);
    }
  }

  async configSensor() {
    const modal = await this.modalController.create({
      component: SimulateModalPage,
      componentProps: {
        "sensor": this.sensor,
      }
    });
 
    return await modal.present();
  }
}
