import { Component } from '@angular/core';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss'
})
export class EditUserComponent {

  nomeEdit: string = '';
  emailEdit: string = '';
  cpfEdit: string = '';
  senhaEdit: string = '';
  senhaRepet: string = '';
  foto: string | null = null;
  userLocation: string = 'Localização não disponível';

  onFileSelected(event: any){}

  salvarEdit(){}
}
