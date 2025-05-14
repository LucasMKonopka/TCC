import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';

export interface Cardapio {
  id?: string;
  nome: string;
  conteudo: string;
  idPaciente: string;
  idNutricionista: string;
  criadoEm: Date;
  atualizadoEm?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CardapioService {

  constructor(private firestore: AngularFirestore) {}

  salvarCardapio(idPaciente: string, idAtendimento: string, cardapio: Cardapio): Promise<void> {
    const id = cardapio.id || this.firestore.createId();
    return this.firestore
      .doc(`pacientes/${idPaciente}/atendimentos/${idAtendimento}/cardapios/${id}`)
      .set({ ...cardapio, id, atualizadoEm: new Date() }, { merge: true });
  }

  obterCardapio(idPaciente: string, idAtendimento: string): Observable<Cardapio | undefined> {
    return this.firestore
      .collection<Cardapio>(`pacientes/${idPaciente}/atendimentos/${idAtendimento}/cardapios`, ref => ref.limit(1))
      .valueChanges()
      .pipe(map(cardapios => cardapios[0]));
  }
}
