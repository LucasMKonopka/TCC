import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PacientesService {
  private collectionName = 'pacientes';

  constructor(private dataBaseStore: AngularFirestore) { }

  getAllPacientes(){
    return this.dataBaseStore.collection('pacientes', paciente => paciente.orderBy('name')).valueChanges({idField: 'firebaseId'}) as Observable<any[]>;
  }

  async addPaciente(paciente: any): Promise<string> {
    const id = this.dataBaseStore.createId();
    await this.dataBaseStore.collection(this.collectionName).doc(id).set({
      ...paciente,
      id: id // Garante que o ID está no documento
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
