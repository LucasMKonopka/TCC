import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, updateDoc, doc, query, where, getDocs } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class CalendarioService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  async salvarConsulta(horario: string, paciente: string, data: string, pacienteId: string) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
  
    const consultasRef = collection(this.firestore, 'agendamento');
    return addDoc(consultasRef, {
      userId: user.uid,
      horario,
      paciente,
      data: data,
      pacienteId: pacienteId
    });
  }

  async carregarConsultas() {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    const consultasRef = collection(this.firestore, 'agendamento');
    const q = query(consultasRef, where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id, 
        data: data['data'],
        horario: data['horario'], 
        paciente: data['paciente'],
        pacienteId: data['pacienteId'] || ''
      };
    });
  }

  async atualizarConsulta(id: string, novoHorario: string, novoPaciente: string, novaData: string, pacienteId: string) {
    if (!id) {
      throw new Error('ID da consulta não pode ser vazio.');
    }
  
    const consultaRef = doc(this.firestore, 'agendamento', id);
    return updateDoc(consultaRef, {
      horario: novoHorario,
      paciente: novoPaciente,
      data: novaData,
      pacienteId: pacienteId
    });
  }

  async excluirConsulta(id: string) {
    const consultaRef = doc(this.firestore, 'agendamento', id);
    return deleteDoc(consultaRef);
  }
}
