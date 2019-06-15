import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-admin-modal',
  templateUrl: './admin-modal.page.html',
  styleUrls: ['./admin-modal.page.scss'],
})
export class AdminModalPage {
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

  constructor(private modalController: ModalController) {}

  
  async closeModal(passed: boolean) {
    await this.modalController.dismiss(passed);
  }

}
