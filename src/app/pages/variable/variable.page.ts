import { Component, AfterViewInit, OnDestroy } from '@angular/core';
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
export class VariablePage implements AfterViewInit, OnDestroy {
  project: Company;
  site: Site;
  sensor: Sensor;
  labelChanged = false;
  currentValues: Sample[] = [];

  newValue = 4;
  settings = true;
  runningThread = null;
  enableRunning = false;
  samplingThread = null;
  enableSampling = false;
  phase = 0;
  autoSendValues = false;
  simulatorMode: 'random' | 'sine' | 'segment' = 'random';
  interval = 16; // seconds
  rangeMin = 4;
  rangeMax = 20;
  sampleInterval = 2;  // seconds

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

  stepVariable() {
    let v = this.newValue;
    switch(this.simulatorMode) {
      case 'random':
        v = Math.random()*(this.rangeMax-this.rangeMin) + this.rangeMin;
        break;
      case 'segment':
        v = this.phase * (this.rangeMax - this.rangeMin) / this.interval + this.rangeMin;
        if (v > this.rangeMax) {
          v = this.rangeMin;
        }
        break;
      case 'sine':
        v = (Math.sin(this.phase / this.interval * 6.28) + 1) * (this.rangeMax - this.rangeMin) / 2 + this.rangeMin;
        break;
    }
    this.phase += 0.5;
    if (this.phase >= this.interval) {
      this.phase = 0;
    }
    this.newValue = v;
  }

  toggleRunning() {
    if (this.runningThread) {
      clearInterval(this.runningThread);
      delete this.runningThread;
    }
    if (!this.enableRunning) {
      this.runningThread = setInterval(() => this.stepVariable(), 500);
    }
  }

  toggleSamples() {
    if (this.samplingThread) {
      clearInterval(this.samplingThread);
      delete this.samplingThread;
    }
    if (!this.enableSampling) {
      this.samplingThread = setInterval(() => this.addSensorValue(), this.sampleInterval * 1000);
    }
  }

  addSensorValue() {
    if (this.sensor && this.enableRunning) {
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

  toggleSettings() {
    this.settings = !this.settings;
  }

  ngOnDestroy() {
    this.enableRunning = true;
    this.enableSampling = true;
    this.toggleRunning();
    this.toggleSamples();
  }
}

