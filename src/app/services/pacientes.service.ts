// paciente.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth'; // Importe o AngularFireAuth
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PacientesService {
  private collectionName = 'pacientes';

  constructor(
    private dataBaseStore: AngularFirestore,
    private afAuth: AngularFireAuth // Injete o AngularFireAuth
  ) { }

  getAllPacientes(nutricionistaId: string): Observable<any[]> {
    return this.dataBaseStore.collection(
      'pacientes', 
      ref => ref.where('nutricionistaId', '==', nutricionistaId)
                .orderBy('nome')
    ).valueChanges({idField: 'firebaseId'}) as Observable<any[]>;
  }

  async addPaciente(paciente: any): Promise<string> {
    const user = await this.afAuth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const id = this.dataBaseStore.createId();
    await this.dataBaseStore.collection(this.collectionName).doc(id).set({
      ...paciente,
      id: id,
      nutricionistaId: user.uid,
      dataCadastro: new Date().toISOString() // Adicionei data de cadastro como bônus
    });
    return id;
  }

  update(pacienteId: string, paciente: any){
    return this.dataBaseStore.collection('pacientes').doc(pacienteId).update(paciente);
  }

  deletePaciente(PacienteId: string){
    return this.dataBaseStore.collection('pacientes').doc(PacienteId).delete();
  }
}