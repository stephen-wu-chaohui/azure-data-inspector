import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SimulateModalPage } from './simulate-modal.page';

const routes: Routes = [
  {
    path: '',
    component: SimulateModalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SimulateModalPage]
})
export class SimulateModalPageModule {}
