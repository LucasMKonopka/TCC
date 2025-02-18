import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(private rota: Router){}

  email: string;
  senha: string;

  login(){
    sessionStorage.setItem('user', this.email);
    sessionStorage.setItem('user', this.senha);
    this.rota.navigate(['home']);
  }
}
