import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PacientesService {

  constructor(private dataBaseStore: AngularFirestore) { }

  getAllPacientes(){
    return this.dataBaseStore.collection('pacientes', paciente => paciente.orderBy('name')).valueChanges({idField: 'firebaseId'}) as Observable<any[]>;
  }

  addPaciente(paciente: any){
    return this.dataBaseStore.collection('pacientes').add(paciente);
  }

  update(pacienteId: string, paciente: any){
    return this.dataBaseStore.collection('pacientes').doc(pacienteId).update(paciente);
  }

  deletePaciente(PacienteId: string){
    return this.dataBaseStore.collection('pacientes').doc(PacienteId).delete();
  }
}
