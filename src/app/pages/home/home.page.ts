import { Component } from '@angular/core';
import { Company, SampleService, Site } from '../../service/sample.service';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { CurrentSelectionService } from '../../service/current-selection.service';
import { AdminModalPage } from './admin-modal/admin-modal.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  project: Company;

  constructor(
    public selectionService: CurrentSelectionService,
    public sampleService: SampleService,
    public alertController: AlertController,
    public modalController: ModalController,   
    public nav: NavController) {
      this.project = selectionService.currentProject;
      this.selectionService.projectChanged.subscribe(project => {
        this.project = project;
      });
  }

  async setEditorMode(editMode) {
    if (editMode) {
      const modal = await this.modalController.create({
        component: AdminModalPage,
        componentProps: {
        }
      });
      modal.onDidDismiss().then(param => {
        const passed = param.data;
        this.selectionService.editMode = passed;
        if (passed) {
          this.nav.navigateRoot('/project');
        }
      });      
      return await modal.present();
    } else {
      this.selectionService.editMode = false;
      this.nav.navigateRoot('/project');
    }
  }
}
