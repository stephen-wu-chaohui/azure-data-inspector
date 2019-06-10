import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {	path: 'home',	loadChildren: './pages/home/home.module#HomePageModule' },
  { path: 'project', loadChildren: './pages/project/project.module#ProjectPageModule' },
  {	path: 'site',	loadChildren: './pages/site/site.module#SitePageModule' },
  {	path: 'variable',	loadChildren: './pages/variable/variable.module#VariablePageModule' },
  {	path: '',	redirectTo: '/home', pathMatch: 'full' },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
