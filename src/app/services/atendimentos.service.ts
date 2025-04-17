import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class AtendimentosService {

  constructor(private firestore: AngularFirestore) {}

  getConsultasPorPaciente(pacienteId: string): Promise<any[]> {
    console.log('Buscando consultas para o paciente:', pacienteId);
    return this.firestore.collection('consultas', 
      ref => ref.where('pacienteId', '==', pacienteId)
               .orderBy('data', 'desc')
    ).get().toPromise()
      .then(snapshot => {
        if (!snapshot) return [];
        console.log('Consultas encontradas:', snapshot.docs);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as object)
        }));
      });
  }

  excluirAtendimento(id: string): Promise<void> {
    return this.firestore.collection('atendimentos').doc(id).delete();
  }

  criarPrimeiraConsulta(pacienteId: string, dados: any) {
    const payload = {
      ...dados,
      pacienteId, // <-- aqui você garante que está incluindo o ID certo
      createdAt: new Date()
    };
  
    return this.firestore.collection('consultas').add(payload);
  }

  async criarConsultaRegular(pacienteId: string, dados: any) {
    const consulta = {
      pacienteId,
      tipo: 'regular',
      data: new Date().toISOString(),
      dados,
      createdAt: new Date()
    };
    
    return this.firestore.collection('consultas').add(consulta);
  }

  
}
