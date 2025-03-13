import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, query, where, getDocs } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class CalendarioService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  async salvarConsulta(horario: string, paciente: string) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    const consultasRef = collection(this.firestore, 'agendamento');
    return addDoc(consultasRef, {
      userId: user.uid,
      horario,
      paciente,
      data: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
    });
  }

  async carregarConsultas() {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    const consultasRef = collection(this.firestore, 'agendamento');
    const q = query(consultasRef, where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();  // Dados do documento Firestore
      return {
        id: doc.id, 
        data: data['data'],    // Usando notação de chave
        horario: data['horario'], 
        paciente: data['paciente']
      };
    });
  }

  async excluirConsulta(id: string) {
    const consultaRef = doc(this.firestore, 'agendamento', id);
    return deleteDoc(consultaRef);
  }
}
