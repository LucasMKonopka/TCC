import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-modal-novo-cardapio',
  templateUrl: './modal-novo-cardapio.component.html',
  styleUrl: './modal-novo-cardapio.component.scss'
})
export class ModalNovoCardapioComponent {
  cardapioForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private firestore: AngularFirestore,
    public dialogRef: MatDialogRef<ModalNovoCardapioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.cardapioForm = this.fb.group({
      nome: ['', Validators.required],
      // Adicione outros campos do cardápio aqui
    });
  }

  salvar(): void {
    if (this.cardapioForm.valid) {
      this.firestore.collection('cardapios').add(this.cardapioForm.value)
        .then(() => {
          console.log('Cardápio salvo no Firebase!');
          this.dialogRef.close();
        })
        .catch(error => console.error('Erro ao salvar:', error));
    }
  }
}
