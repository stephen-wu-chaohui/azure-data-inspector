import { Component, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { Company, Site, Sensor, SampleService, Sample, Entity } from '../../service/sample.service';
import { CurrentSelectionService } from '../../service/current-selection.service';
import { NavController, AlertController, ModalController, PickerController } from '@ionic/angular';
import * as moment from 'moment';
import * as Chart from 'chart.js';
import { RANGE_VALUE_ACCESSOR } from '@angular/forms/src/directives/range_value_accessor';

@Component({
  selector: 'app-variable',
  templateUrl: 'variable.page.html',
  styleUrls: ['variable.page.scss']
})
export class VariablePage implements AfterViewInit, OnDestroy {
  @ViewChild('lineChart') lineChart;
  
  project: Company;
  site: Site;
  sensor: Sensor;
  labelChanged = false;

  newValue = 4;
  runningThread = null;
  samplingThread = null;
  enableSampling = false;
  phase = 0;
  autoSendValues = false;
  simulatorMode: 'random' | 'sine' | 'segment' = 'sine';
  duration = 16; // seconds
  rangeMin = 4;
  rangeMax = 20;
  sampleInterval = 2;  // seconds

  lastUpdatedOf(s: Sample) { return moment.unix(s.lastUpdated).toDate(); }

  currentValues: Sample[] = [];

  private mountSamples() {
    if (this.sensor) {
        this.currentValues = this.sampleService.samples.data.filter(v => v.sensorId === this.sensor.id).sort((a,b) => (b.lastUpdated - a.lastUpdated)).slice(0, 10);
    }
  }

  constructor(
    public selectionService: CurrentSelectionService,
    public sampleService: SampleService,
    public nav: NavController,
    public alertController: AlertController,
    public pickerController: PickerController,
    public modalController: ModalController    
  ) {
    this.sensor = this.selectionService.currentSensor;
    this.mountSamples();

    this.selectionService.sensorChanged.subscribe(
      sensor => {
        this.sensor = sensor;
        this.mountSamples();
        this.updateChart();
      }
    );

    this.sampleService.samples.changed.subscribe(
      sample => {
        if (this.sensor && sample.sensorId === this.sensor.id) {
          this.currentValues.unshift(sample);
          this.updateChart();
        }
      }
    );
    this.sampleService.samples.mounted.subscribe(
      samples => {
        this.mountSamples();
        this.updateChart();
      });
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
        v = this.phase * (this.rangeMax - this.rangeMin) / this.duration + this.rangeMin;
        if (v > this.rangeMax) {
          v = this.rangeMin;
        }
        break;
      case 'sine':
        v = (Math.sin(this.phase / this.duration * 6.28) + 1) * (this.rangeMax - this.rangeMin) / 2 + this.rangeMin;
        break;
    }
    this.phase += 2;
    if (this.phase >= this.duration) {
      this.phase = 0;
    }
    this.newValue = v;
  }

  resetSampling() {
    if (this.samplingThread) {
      clearInterval(this.samplingThread);
      delete this.samplingThread;
    }
    if (this.enableSampling) {
      this.samplingThread = setInterval(() => this.addSensorValue(), this.sampleInterval * 1000);
    }
  }

  addSensorValue() {
    if (this.sensor) {
      this.stepVariable();

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

  ngAfterViewInit(): void {
    this.updateChart();
  }

  ngOnDestroy() {
    this.enableSampling = false;
    this.resetSampling();
  }

  openChart() {
    this.nav.navigateForward('/variable-chart');
  }

  private options = {
    animation: { duration: 0 },
    legend: { display: false },
    scales: {
       yAxes: [{
          ticks: {
             beginAtZero: true,
             stepSize: 5,
             max : 20
          }
       }],
       xAxes: [{
          ticks: {
             autoSkip: true
          }
       }]
    }
  }

  updateChart() {
    let samples = this.currentValues.slice(0, 10).reverse();
    while (samples.length < 10) samples.push({
      keywords: '',
      lastUpdated: Entity.unixNow(),
      deleted: false,
      sensorId: 0,
      value: 0,
      tm: new Date(),
    });
    let labels = samples.map(v => moment.unix(v.lastUpdated).format('mm:ss'));
    let data = samples.map(v => v.value);
    let backgroundColor = samples.map(v => `rgba(${v.sensorId % 256}, ${v.lastUpdated % 256}, ${Math.floor(v.value*12)})`);
    let hoverBackgroundColor = [...backgroundColor];
  
    let graphData = {
      labels,
      datasets: [{
         label: 'Variable samples',
         data,
         lineTension: 0.2,
         backgroundColor,
         hoverBackgroundColor,
         fill: false
      }]
    };

    new Chart(this.lineChart.nativeElement,
      {
         type: 'line',
         data: graphData,
         options: this.options,
      });
  }


  getColumnOptions(columnOptions: any[]) {
    let options = columnOptions.map((v, i) => ({
      text: v,
      value: i,
    }));
    return options;
  }

  async pickSampleInterval() {
    if (!this.enableSampling) {
      this.resetSampling();
      return;
    }
    const optionSeconds = [1,2,3,4,5,6,7,8,9,10,20,30,60,120,180,300,600,1800];
    const picker = await this.pickerController.create({
      columns: [{
          name: 'sampleInterval',
          options: optionSeconds.map(v => ({ text:v.toString(), value:v })),
          selectedIndex: optionSeconds.findIndex(v => v === this.sampleInterval),
        }],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.enableSampling = false;
          }
        },
        {
          text: 'Confirm',
          handler: (selected) => {
            this.sampleInterval = selected.sampleInterval.value;
            this.resetSampling();
          }
        }
      ]
    });

    await picker.present();
  }

  async pickDuration() {
    const optionSeconds = [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,24,30,40,50,60,80,90,100,200,400,600,1000];
    const picker = await this.pickerController.create({
      columns: [{
          name: 'duration',
          options: optionSeconds.map(v => ({ text:v.toString(), value:v })),
          selectedIndex: optionSeconds.findIndex(v => v === this.duration),
        }],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Confirm',
          handler: (selected) => {
            this.duration = selected.duration.value;
          }
        }
      ]
    });
    await picker.present();
  }

  async pickRange() {
    const range = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
    const picker = await this.pickerController.create({
      columns: [{
          name: 'min',
          options: range.map(v => ({ text:v.toString(), value:v })),
          selectedIndex: range.findIndex(v => v === this.rangeMin),
        }, {
          name: 'max',
          options: range.map(v => ({ text:v.toString(), value:v })),
          selectedIndex: range.findIndex(v => v === this.rangeMax),
        }],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Confirm',
          handler: (selected) => {
            this.rangeMin = selected.min.value;
            this.rangeMax = selected.max.value;
          }
        }
      ]
    });
    await picker.present();

  }
}

