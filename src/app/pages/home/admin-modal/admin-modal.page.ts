import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-admin-modal',
  templateUrl: './admin-modal.page.html',
  styleUrls: ['./admin-modal.page.scss'],
})
export class AdminModalPage implements OnInit {
  password = '';
  passwordChecked = false;

  passwordPassed() {
    return this.password === 'admin';
  }

  onOK() {
    this.passwordChecked = true;
    if (this.passwordPassed()) {
      this.closeModal(true);
    }
  }

  onCancel() {
    this.closeModal(false);
  }

  constructor(
    private modalController: ModalController,
    private navParams: NavParams) {
    }

  ngOnInit() {
  }

  async closeModal(passed: boolean) {
    await this.modalController.dismiss(passed);
  }

}
