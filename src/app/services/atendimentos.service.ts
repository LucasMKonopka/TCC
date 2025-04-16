import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class AtendimentosService {

  constructor(private firestore: AngularFirestore) {}

  getAtendimentosPorPaciente(pacienteId: string): Promise<any[]> {
    return this.firestore.collection('atendimentos', 
      ref => ref.where('pacienteId', '==', pacienteId)
               .orderBy('data', 'desc')
    ).get().toPromise()
      .then(snapshot => {
        if (!snapshot) return [];
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as object)
        }));
      });
  }

  excluirAtendimento(id: string): Promise<void> {
    return this.firestore.collection('atendimentos').doc(id).delete();
  }

  async criarPrimeiraConsulta(pacienteId: string, dados: any) {
    const consulta = {
      pacienteId,
      tipo: 'primeira',
      data: new Date().toISOString(),
      dados,
      createdAt: new Date()
    };
    
    return this.firestore.collection('consultas').add(consulta);
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
