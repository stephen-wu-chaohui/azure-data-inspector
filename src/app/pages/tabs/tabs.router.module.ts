import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tabProject',
        children: [
          {
            path: '',
            loadChildren: '../tabProject/tabProject.module#TabProjectPageModule'
          }
        ]
      },
      {
        path: 'tabSite',
        children: [
          {
            path: '',
            loadChildren: '../tabSite/tabSite.module#TabSitePageModule'
          }
        ]
      },
      {
        path: 'tabView',
        children: [
          {
            path: '',
            loadChildren: '../tabView/tabView.module#TabViewPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/tabProject',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tabProject',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
