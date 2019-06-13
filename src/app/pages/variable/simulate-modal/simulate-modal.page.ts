import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Sensor } from 'src/app/service/sample.service';

@Component({
  selector: 'app-simulate-modal',
  templateUrl: './simulate-modal.page.html',
  styleUrls: ['./simulate-modal.page.scss'],
})
export class SimulateModalPage implements OnInit {
  sensor: Sensor;
  autoSendValues = false;
  simulatorMode: 'random' | 'sine' | 'segment' = 'random';
  interval = 18; // second
  rangeMin = 4;
  rangeMax = 20;
  
  constructor(
    private modalController: ModalController,
    private navParams: NavParams) {
      this.sensor = navParams.data.sensor;
    }

  ngOnInit() {
  }
  
  async closeModal() {
    const onClosedData: string = "Wrapped Up!";
    await this.modalController.dismiss(onClosedData);
  }
}
