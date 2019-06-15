import { Component, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { Company, Site, Sensor, SampleService, Sample, Entity } from '../../service/sample.service';
import { CurrentSelectionService } from '../../service/current-selection.service';
import { NavController, AlertController, ModalController, PickerController } from '@ionic/angular';
import * as moment from 'moment';
import * as Chart from 'chart.js';

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
  settings = true;
  runningThread = null;
  samplingThread = null;
  enableSampling = false;
  phase = 0;
  autoSendValues = false;
  simulatorMode: 'random' | 'sine' | 'segment' = 'sine';
  interval = 16; // seconds
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
        v = this.phase * (this.rangeMax - this.rangeMin) / this.interval + this.rangeMin;
        if (v > this.rangeMax) {
          v = this.rangeMin;
        }
        break;
      case 'sine':
        v = (Math.sin(this.phase / this.interval * 6.28) + 1) * (this.rangeMax - this.rangeMin) / 2 + this.rangeMin;
        break;
    }
    this.phase += 2;
    if (this.phase >= this.interval) {
      this.phase = 0;
    }
    this.newValue = v;
  }

  toggleSamples() {
    this.settings = !this.settings;
    if (this.samplingThread) {
      clearInterval(this.samplingThread);
      delete this.samplingThread;
    }
    if (!this.enableSampling) {
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
    this.enableSampling = true;
    this.toggleSamples();
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
      sensorId: this.sensor.id,
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
}

