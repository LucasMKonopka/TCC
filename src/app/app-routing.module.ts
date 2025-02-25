import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { SignupComponent } from './pages/signup/signup.component';
import { EditUserComponent } from './pages/edit-user/edit-user.component';

const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'Login', component: LoginComponent},
  {path: 'home', component: HomeComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'editUser', component: EditUserComponent},
  //{path: 'esqueceu-senha', component: EsqueceuSenha},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
