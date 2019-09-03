import { Component, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
export class VariablePage implements OnDestroy, AfterViewInit {
  constructor(
    public selectionService: CurrentSelectionService,
    public sampleService: SampleService,
    public nav: NavController,
    public alertController: AlertController,
    public pickerController: PickerController,
    public modalController: ModalController
  ) {
    this.sensor = this.selectionService.currentSensor;

    this.selectionService.sensorChanged.subscribe(
      sensor => {
        this.sensor = sensor;
        this.updateChart();
      }
    );

    this.sampleService.samples.changed.subscribe(
      sample => {
        if (this.sensor && sample.sensorId === this.sensor.id) {
          this.currentValues.unshift(sample);
          this.updateChart(false);
        }
      }
    );
    this.sampleService.samples.mounted.subscribe(
      () => {
        this.updateChart();
      });
  }

  @ViewChild('lineChart') lineChart: ElementRef;

  chart: Chart;
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
  sampleNumbers = 1440;

  currentValues: Sample[] = [];

  dateFrom = moment().startOf('day').toDate();
  dateTo = moment().endOf('day').toDate();

  lastUpdatedOf(s: Sample) { return moment.unix(s.lastUpdated).toDate(); }

  isReadonly() {
    return !this.selectionService.editMode;
  }

  chartXlabel(): string {
    if (!this.chart) {
      return '';
    }
    const dates = this.chart.data.labels.map(d => d as Date);
    if (!dates || !dates.length) {
      return '';
    }
    const firstDate = moment(dates[0]).date;
    const lastDate = moment(dates[dates.length - 1]).date;
    if (firstDate === lastDate) {
      return firstDate.toString();
    } else {
      return `${firstDate.toString()} - ${lastDate.toString()}`;
    }
  }

  private mountSamples() {
    if (this.sensor) {
      const momentFrom = moment(this.dateFrom).startOf('day').unix();
      const momentTo = moment(this.dateTo).endOf('day').unix();
      this.currentValues = this.sampleService.samples.data
         .filter(v => v.sensorId === this.sensor.id && (v.lastUpdated >= momentFrom && v.lastUpdated <= momentTo))
         .sort((a, b) => (a.lastUpdated - b.lastUpdated));
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
        v = Math.random() * (this.rangeMax - this.rangeMin) + this.rangeMin;
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

  updateChart(mountSamples = true) {
    if (mountSamples) {
      this.mountSamples();
    }
    const samples = this.currentValues;
    const labels = samples.map(v => moment.unix(v.lastUpdated).toDate());
    const data = samples.map(v => v.value);
    const backgroundColor = samples.map(v => `rgba(${v.sensorId % 256}, ${v.lastUpdated % 256}, ${Math.floor(v.value * 12)})`);
    const hoverBackgroundColor = [...backgroundColor];

    const graphData = {
      labels,
      datasets: [{
         label: '',
         data,
         lineTension: 0,
         backgroundColor,
         hoverBackgroundColor,
         fill: false
      }]
    };

    if (this.chart) {
      this.chart.config.data = graphData;
      this.chart.update();
    } else if (this.lineChart) {
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        title: {
          display: false,
          fullWidth: true,
          fontSize: 24,
          fontColor: 'blue',
          text: this.sensor.name
        },
        legend: { display: false},
        scales: {
           yAxes: [{
              ticks: {
                 beginAtZero: true,
                 stepSize: 1,
                 max : 20
              }
           }],
            xAxes: [{
              type: 'time',
              time: {
                  parser: 'YYYY-MM-DD HH:mm',
                  displayFormats: {
                    millisecond: 'HH:mm:ss',
                    second: 'HH:mm:ss',
                    minute: 'HH:mm',
                    hour: 'HH',
                    day: 'YYYY-MM-DD',
                    week: 'YYYY-MM-DD',
                  },
              },
              ticks: {
                maxRotation: 0
              }
            }]
        },
        pan: {
          enabled: true,
          mode: 'x',
          speed: 10,
          threshold: 10
        },
        zoom: {
          enabled: true,
          drag: false,
          mode: 'x',
          limits: {
            max: 30,
            min: 0.5
          }
        }
      };

      const ctx = (this.lineChart.nativeElement as HTMLCanvasElement).getContext('2d');
      this.chart = new Chart(ctx,
        {
           type: 'line',
           data: graphData,
           options,
        });
    }
  }

  async pickSampleInterval() {
    if (!this.enableSampling) {
      this.resetSampling();
      return;
    }
    const optionSeconds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 60, 120, 180, 300, 600, 1800];
    const picker = await this.pickerController.create({
      columns: [{
          name: 'sampleInterval',
          options: optionSeconds.map(v => ({ text: v.toString(), value: v })),
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
    const optionSeconds = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 24, 30, 40, 50, 60, 80, 90, 100, 200, 400, 600, 1000];
    const picker = await this.pickerController.create({
      columns: [{
          name: 'duration',
          options: optionSeconds.map(v => ({ text: v.toString(), value: v })),
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

  async pickValueRange() {
    const range = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const picker = await this.pickerController.create({
      columns: [{
          name: 'min',
          options: range.map(v => ({ text: v.toString(), value: v })),
          selectedIndex: range.findIndex(v => v === this.rangeMin),
        }, {
          name: 'max',
          options: range.map(v => ({ text: v.toString(), value: v })),
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

  setDateFrom(v) {
    this.dateFrom = v;
    this.updateChart();
  }

  setDateTo(v) {
    this.dateTo = v;
    this.updateChart();
  }
}

