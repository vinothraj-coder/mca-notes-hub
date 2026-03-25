import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SemestersComponent } from './components/semesters/semesters.component';
import { SubjectsComponent } from './components/subjects/subjects.component';
import { DocumentsComponent } from './components/documents/documents.component';
import { LoginComponent } from './components/login/login.component';
import { AdminComponent } from './components/admin/admin.component';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'semesters', component: SemestersComponent },
  { path: 'semesters/:semId', component: SubjectsComponent },
  { path: 'semesters/:semId/subjects/:subId', component: DocumentsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
