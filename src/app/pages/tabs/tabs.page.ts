import { Component } from '@angular/core';
import { CurrentSelectionService } from '../../service/current-selection.service';
import { SampleService, Company } from '../../service/sample.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  constructor(
    public selectionService: CurrentSelectionService,
    public sampleService: SampleService,
  ) {
    this.sampleService.projects.mounted.subscribe(
      companies => {
        this.selectionService.currentProject = Object.values(companies).find(v => v.name === 'Demo Project') as unknown as Company;
    });
  }
}
