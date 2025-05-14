import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

interface CardapioData {
  nome: string;
  conteudo: string;
}

@Component({
  selector: 'app-modal-novo-cardapio',
  templateUrl: './modal-novo-cardapio.component.html',
  styleUrls: ['./modal-novo-cardapio.component.scss']
})
export class ModalNovoCardapioComponent {
  conteudoCardapio = new FormControl('', [
    Validators.required,
    Validators.minLength(10),
    Validators.maxLength(2000)
  ]);

  nomeCardapio = new FormControl('', [
    Validators.required,
    Validators.maxLength(50)
  ]);

  get nomeErrorMessage(): string {
    if (this.nomeCardapio.hasError('required')) {
      return 'O nome do cardápio é obrigatório';
    }
    return this.nomeCardapio.hasError('maxlength') ? 
      'Máximo de 50 caracteres' : '';
  }

  get conteudoErrorMessage(): string {
    if (this.conteudoCardapio.hasError('required')) {
      return 'O conteúdo do cardápio é obrigatório';
    }
    if (this.conteudoCardapio.hasError('minlength')) {
      return 'Mínimo de 10 caracteres';
    }
    return this.conteudoCardapio.hasError('maxlength') ? 
      'Máximo de 2000 caracteres' : '';
  }

  constructor(
    public dialogRef: MatDialogRef<ModalNovoCardapioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
) {
    if (data?.cardapio) {
      this.nomeCardapio.setValue(data.cardapio.nome);
      this.conteudoCardapio.setValue(data.cardapio.conteudo);
    }
  }

  salvar(): void {
    this.nomeCardapio.markAsTouched();
    this.conteudoCardapio.markAsTouched();

    if (this.nomeCardapio.invalid || this.conteudoCardapio.invalid) {
      return;
    }

    this.dialogRef.close({
      nome: this.nomeCardapio.value!.trim(),
      conteudo: this.conteudoCardapio.value!.trim()
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}