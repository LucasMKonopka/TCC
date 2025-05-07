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

  getAtendimentoById(atendimentoId: string): Promise<any> {
    return this.firestore.collection('consultas').doc(atendimentoId).get().toPromise()
      .then(snapshot => {
        if (!snapshot || !snapshot.exists) {
          throw new Error('Atendimento não encontrado');
        }
        const data = snapshot.data();
        if (!data) {
          throw new Error('Dados do atendimento não encontrados');
        }
        return { id: snapshot.id, ...data };
      });
  }
  atualizarAtendimento(atendimentoId: string, dados: any): Promise<void> {
    return this.firestore.collection('consultas').doc(atendimentoId).update({
      ...dados,
      updatedAt: new Date()
    });
  }

  excluirAtendimento(atendimentoId: string): Promise<void> {
    return this.firestore.collection('consultas').doc(atendimentoId).delete();
  }

  criarPrimeiraConsulta(pacienteId: string, dados: any) {
    const payload = {
      ...dados,
      pacienteId, 
      createdAt: new Date()
    };
  
    return this.firestore.collection('consultas').add(payload);
  }

  async criarConsultaRegular(pacienteId: string, dados: any) {
    const consulta = {
      ...dados, 
      pacienteId,
      tipo: 'regular',
      data: new Date().toISOString(),
      createdAt: new Date()
    };
    
    return this.firestore.collection('consultas').add(consulta);
  }

  
}
