import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { CurrentSelectionService } from './service/current-selection.service';
import { SampleService, Company } from './service/sample.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public selectionService: CurrentSelectionService,
    public sampleService: SampleService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    this.sampleService.projects.mounted.subscribe(
      companies => {
        this.selectionService.currentProject = Object.values(companies).find(v => v.name === 'Demo Project') as unknown as Company;
    });
  }
}
