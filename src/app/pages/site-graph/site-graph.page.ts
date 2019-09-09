import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Company, Site, Sensor, SampleService, Sample } from '../../service/sample.service';
import { CurrentSelectionService } from '../../service/current-selection.service';
import { NavController, AlertController, ModalController, PickerController } from '@ionic/angular';
import * as moment from 'moment';
import * as Chart from 'chart.js';
import * as _ from 'lodash';
import { Dictionary } from 'lodash';

@Component({
  selector: 'app-site-graph',
  templateUrl: './site-graph.page.html',
  styleUrls: ['./site-graph.page.scss'],
})
export class SiteGraphPage implements AfterViewInit {
  @ViewChild('lineChart') lineChart: ElementRef;

  chart: Chart;
  project: Company;
  site: Site;

  currentValues: Dictionary<Sample[]>;
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
    this.site = this.selectionService.currentSite;

    this.selectionService.siteChanged.subscribe(
      site => {
        this.site = site;
        this.updateChart();
      }
    );

    // this.sampleService.samples.changed.subscribe(
    //   sample => {
    //     if (this.sensor && sample.sensorId === this.sensor.id) {
    //       this.currentValues.unshift(sample);
    //       this.updateChart(false);
    //     }
    //   }
    // );

    this.sampleService.samples.mounted.subscribe(
      () => {
        this.updateChart();
      });
  }

  private mountSamples() {
    const momentFrom = moment(this.dateFrom).startOf('day').unix();
    const momentTo = moment(this.dateTo).endOf('day').unix();

    const group = _.chain(this.sampleService.samples.data)
      .filter(v => v.lastUpdated >= momentFrom && v.lastUpdated <= momentTo)
      .groupBy('sensorId')
      .value();
    console.log('group', group);

    const sensors = this.sampleService.sensorsOf(this.site);
    const sensorIds = sensors.filter(s => s.id).map(s => s.id.toString());

    const filtered = _.pickBy(group, (id, key) => sensorIds.includes(key));
    this.currentValues = filtered;
  }

  ngAfterViewInit(): void {
    this.updateChart();
  }

  updateChart(mountSamples = true) {
    if (mountSamples) {
      this.mountSamples();
    }

    const sensors = this.sampleService.sensorsOf(this.site);
    const sensorIds = sensors.filter(s => s.id).map(s => s.id.toString());

    const samples = this.currentValues[sensorIds[1]];
    const labels = samples.map(v => moment.unix(v.lastUpdated).toDate());
    const names = sensors.reduce((map, sensor) => {
            map[sensor.id] = sensor.name;
            return map;
        }, {});
    
    const colors = [
      'rgba(255,0,0)',
      'rgba(0,255,0)',
      'rgba(0,0,255)',
      'rgba(255,255,0)',
      'rgba(255,255,0)',
      'rgba(255,0,255)',
      'rgba(128,128,128)',
      'rgba(128,0,0)',
      'rgba(128,0,0)',
      'rgba(128,0,0)',
      'rgba(128,0,0)',
      'rgba(0,128,128)',
      'rgba(0,0,128)',
    ];


    const backgroundColor = k => samples.map(v => colors[k%10]);

    const datasets = _.map(this.currentValues, (sample, k) => ({
         label: '',
         data: sample.map(v => v.value),
         lineTension: 0,
         backgroundColor: backgroundColor(k),
         hoverBackgroundColor: backgroundColor(k),
         fill: false
      }));

    const graphData = {
      labels,
      datasets,
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
        text: this.site.name,
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
         options
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

