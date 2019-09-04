import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Company, Site, Sensor, SampleService, Sample } from '../../service/sample.service';
import { CurrentSelectionService } from '../../service/current-selection.service';
import { NavController, AlertController, ModalController, PickerController } from '@ionic/angular';
import * as moment from 'moment';
import * as Chart from 'chart.js';

@Component({
  selector: 'app-variable',
  templateUrl: 'variable.page.html',
  styleUrls: ['variable.page.scss']
})
export class VariablePage implements AfterViewInit {
  @ViewChild('lineChart') lineChart: ElementRef;

  chart: Chart;
  project: Company;
  site: Site;
  sensor: Sensor;

  currentValues: Sample[] = [];
  dateFrom = moment().subtract(1, 'years').startOf('day').toDate();
  dateTo = moment().add(7, 'days').endOf('day').toDate();

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

  private mountSamples() {
    if (this.sensor) {
      const momentFrom = moment(this.dateFrom).startOf('day').unix();
      const momentTo = moment(this.dateTo).endOf('day').unix();
      this.currentValues = this.sampleService.samples.data
         .filter(v => v.sensorId === this.sensor.id && (v.lastUpdated >= momentFrom && v.lastUpdated <= momentTo))
         .sort((a, b) => (a.lastUpdated - b.lastUpdated));
    }
  }

  ngAfterViewInit(): void {
    this.updateChart();
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
      this.createChart(graphData);
    }
  }

  createChart(graphData) {
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      title: {
        display: true,
        fullWidth: true,
        fontSize: 18,
        fontColor: 'blue',
        text: this.sensor.description
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
                },
            },
            scaleLabel: {
              display: true,
              fontColor: 'blue',
              labelString: '',
              fontSize: 16,
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
        threshold: 10,
        onPanComplete: this.setXaxesLabel,
        rangeMin: {
          x: this.dateFrom,
          y: 0
        },
        rangeMax: {
          x: this.dateTo,
          y: 20
        },
      },
      zoom: {
        enabled: true,
        drag: false,
        mode: 'x',
        limits: {
          max: 30,
          min: 0.5
        },
        onZoomComplete: this.setXaxesLabel,
        rangeMin: {
          x: this.dateFrom,
          y: 0
        },
        rangeMax: {
          x: this.dateTo,
          y: 20
        },
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

  private setXaxesLabel(a: { chart: any; }) {
    const min = moment(a.chart.scales['x-axis-0'].min).format('YYYY-MM-DD');
    const max = moment(a.chart.scales['x-axis-0'].max).format('YYYY-MM-DD');
    const chartDate = (min === max) ? min : `${min} to ${max}`;
    a.chart.options.scales.xAxes[0].scaleLabel.labelString = chartDate;
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

