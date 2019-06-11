import { Component } from '@angular/core';
import { Company, SampleService, Site } from '../../service/sample.service';
import { NavController } from '@ionic/angular';
import { CurrentSelectionService } from '../../service/current-selection.service';

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
    public nav: NavController) {
      this.project = selectionService.currentProject;
      this.selectionService.projectChanged.subscribe(project => {
        this.project = project;
      });
  }

  setEditorMode(editMode) {
    this.selectionService.editMode = editMode;
  }
}
