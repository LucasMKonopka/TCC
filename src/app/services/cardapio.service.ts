import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { Observable, map } from 'rxjs';

export interface Cardapio {
  id?: string;
  nome: string;
  conteudo: string | any;
  tipo: 'pdf' | 'estruturado';
  idPaciente: string;
  idNutricionista: string;
  criadoEm: Date;
  atualizadoEm?: Date;
  textoExtraido?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class CardapioService {

  constructor(private firestore: AngularFirestore, private storage: AngularFireStorage) {}

  async uploadEGuardarCardapio(
    idPaciente: string,
    idAtendimento: string,
    arquivo: File,
    idNutricionista: string
  ): Promise<void> {
    const id = this.firestore.createId();
    const path = `cardapios/${idPaciente}/${idAtendimento}/${id}.pdf`;
    const ref = this.storage.ref(path);
    const task = this.storage.upload(path, arquivo);

    return new Promise((resolve, reject) => {
      task.snapshotChanges().pipe(
        finalize(async () => {
          const downloadURL = await ref.getDownloadURL().toPromise();

          const cardapio: Cardapio = {
            id,
            nome: arquivo.name,
            conteudo: downloadURL,
            tipo: 'pdf', // Adicionado aqui
            idPaciente,
            idNutricionista,
            criadoEm: new Date(),
            atualizadoEm: new Date()
          };

          await this.firestore
            .doc(`pacientes/${idPaciente}/atendimentos/${idAtendimento}/cardapios/${id}`)
            .set(cardapio, { merge: true });

          resolve();
        })
      ).subscribe({
        error: reject
      });
    });
  }

  obterCardapio(idPaciente: string, idAtendimento: string): Observable<Cardapio | undefined> {
    return this.firestore
      .collection<Cardapio>(
        `pacientes/${idPaciente}/atendimentos/${idAtendimento}/cardapios`, 
        ref => ref.limit(1)
      )
      .valueChanges()
      .pipe(map(cardapios => cardapios[0]));
  }

  getCardapioById(idPaciente: string, idAtendimento: string, cardapioId: string): Promise<Cardapio> {
  const docRef = this.firestore.doc<Cardapio>(
    `pacientes/${idPaciente}/atendimentos/${idAtendimento}/cardapios/${cardapioId}`
  );

  return docRef
    .get()
    .toPromise()
    .then(doc => {
      if (doc && doc.exists) {
        return { id: doc.id, ...doc.data() } as Cardapio;
      } else {
        throw new Error('Cardápio não encontrado');
      }
    });
}
  


  salvarCardapio(idPaciente: string, idAtendimento: string, cardapio: Cardapio): Promise<void> {
    const id = cardapio.id || this.firestore.createId();
    return this.firestore
      .doc(`pacientes/${idPaciente}/atendimentos/${idAtendimento}/cardapios/${id}`)
      .set({ 
        ...cardapio, 
        tipo: 'estruturado', 
        id, 
        atualizadoEm: new Date() 
      }, { merge: true });
  }

  
}
