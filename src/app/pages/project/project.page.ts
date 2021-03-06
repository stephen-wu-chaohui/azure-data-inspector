import { Component } from '@angular/core';
import { Company, Site, SampleService, Entity } from 'src/app/service/sample.service';
import { CurrentSelectionService } from 'src/app/service/current-selection.service';
import { NavController, AlertController } from '@ionic/angular';
import { projection } from '@angular/core/src/render3';

@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss'],
})
export class ProjectPage {
  project: Company;
  sites: Site[];

  constructor(
    public selectionService: CurrentSelectionService,
    public sampleService: SampleService,
    public alertController: AlertController,
    public nav: NavController
  ) {
    this.project = selectionService.currentProject;
    this.sites = this.sampleService.sitesOf(this.project);
    this.selectionService.projectChanged.subscribe(project => {
      this.project = project;
      this.sites = this.sampleService.sitesOf(this.project);
      this.selectionService.currentSite = null;
    });

    this.selectionService.siteChanged.subscribe(site => {
      if (this.project && site && site.companyId === this.project.id) {
        this.sites = this.sampleService.sitesOf(this.project);
      }
    });

    this.sampleService.sites.mounted.subscribe(data => {
      this.sites = this.sampleService.sitesOf(this.project);
    });

    this.sampleService.sites.changed.subscribe(site => {
      if (this.project && site && site.companyId === this.project.id) {
        this.sites = this.sampleService.sitesOf(this.project);
      }
    });
  }

  openSite(site: Site) {
    this.selectionService.currentSite = site;
    this.nav.navigateForward('/site');
  }

  addSite() {
    const newSite: Site = {
      keywords: '',
      lastUpdated: Entity.unixNow(),
      deleted: false,
      companyId: this.project.id,
      name: 'New',
      description: 'Auto generated new site',
    };
    this.sampleService.sites.upsert(newSite);
    this.selectionService.currentSite = newSite;
    this.nav.navigateForward('/site');
  }

  async removeSite(site) {
    const alert = await this.alertController.create({
      header: 'Remove the site',
      message: `Are you sure to remove the site of <strong>${site.name}</strong>?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'OK',
          handler: () => {
            this.sampleService.sites.delete(site.id);
            this.nav.back();
          }
        }
      ]
    });
    await alert.present();
  }
}
