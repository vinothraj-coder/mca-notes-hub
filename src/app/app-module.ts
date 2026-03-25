import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { SemestersComponent } from './components/semesters/semesters.component';
import { SubjectsComponent } from './components/subjects/subjects.component';
import { DocumentsComponent } from './components/documents/documents.component';
import { LoginComponent } from './components/login/login.component';
import { AdminComponent } from './components/admin/admin.component';

@NgModule({
  declarations: [
    App,
    NavbarComponent,
    HomeComponent,
    SemestersComponent,
    SubjectsComponent,
    DocumentsComponent,
    LoginComponent,
    AdminComponent,
  ],
  imports: [BrowserModule, FormsModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App]
})
export class AppModule {}
