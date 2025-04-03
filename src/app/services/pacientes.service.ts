import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth'; 
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PacientesService {
  private collectionName = 'pacientes';

  constructor(
    private dataBaseStore: AngularFirestore,
    private afAuth: AngularFireAuth 
  ) { }

  getAllPacientes(nutricionistaId: string): Observable<any[]> {
    return this.dataBaseStore.collection(
      'pacientes', 
      ref => ref.where('nutricionistaId', '==', nutricionistaId)
                .orderBy('nome')
    ).valueChanges({idField: 'firebaseId'}) as Observable<any[]>;
  }

  async verificarCpfExistente(cpf: string): Promise<boolean> {
    const cpfFormatado = cpf.replace(/\D/g, '');
    
    const snapshot = await this.dataBaseStore.collection(this.collectionName, 
      ref => ref.where('cpf', '==', cpfFormatado)
    ).get().toPromise();

    return !snapshot?.empty;
  }

  async addPaciente(paciente: any): Promise<string> {
    const user = await this.afAuth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
  
    const cpfExistente = await this.verificarCpfExistente(paciente.cpf);
    if (cpfExistente) {
      throw new Error('CPF já cadastrado no sistema');
    }
  
    try {
      const cpfFormatado = paciente.cpf.replace(/\D/g, '');
      const id = this.dataBaseStore.createId();
      
      await this.dataBaseStore.collection(this.collectionName).doc(id).set({
        ...paciente,
        cpf: cpfFormatado,
        id: id,
        nutricionistaId: user.uid,
        dataCadastro: new Date().toISOString() 
      });
      
      return id;
    } catch (erro: unknown) {
      if (erro instanceof Error) {
        throw new Error('Erro ao cadastrar paciente: ' + erro.message);
      } else {
        throw new Error('Erro desconhecido ao cadastrar paciente');
      }
    }
  }

  update(pacienteId: string, paciente: any){
    return this.dataBaseStore.collection('pacientes').doc(pacienteId).update(paciente);
  }

  deletePaciente(PacienteId: string){
    return this.dataBaseStore.collection('pacientes').doc(PacienteId).delete();
  }

  
}