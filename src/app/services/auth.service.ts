import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { from, Observable, switchMap } from 'rxjs';
import { Firestore, doc, getDoc, collection, query, where, getDocs, orderBy } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';  

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth, private router: Router, private firestore: AngularFirestore, private firestoreH: Firestore) { }

  login(email: string, password: string): Observable<any> {
    return from(this.afAuth.signInWithEmailAndPassword(email, password));
  }

  signUp(nome: string, cpf: string, email: string, password: string): Observable<any> {
    return from(this.afAuth.createUserWithEmailAndPassword(email, password)).pipe(
      switchMap((userCredential) => {
        //dados do nutricionista no Firestore
        return this.firestore.collection('nutricionistas').doc(userCredential.user?.uid).set({
          nome,
          cpf,
          email
        });
      })
    );
  }

  resetPassword(email: string): Observable<void> {
    return from(this.afAuth.sendPasswordResetEmail(email));
  }

  logout(): Observable<void> {
    return from(this.afAuth.signOut());
  }

  deleteUser(): Observable<void> {
    return new Observable<void>(observer => {
      this.afAuth.currentUser.then(user => {
        if (user) {
          const uid = user.uid;
          // dados Firestore
          this.firestore.collection('nutricionistas').doc(uid).delete().then(() => {
            // usuario
            user.delete().then(() => {
              observer.next();
              observer.complete();
            }).catch(error => observer.error(error));
          }).catch(error => observer.error(error));
        } else {
          observer.error('Usuário não autenticado.');
        }
      }).catch(error => observer.error(error));
    });
  }
  
  getCurrentUser (): Observable<any> {
    return new Observable(observer => {
      this.afAuth.authState.subscribe(async user => {
        if (user) {
          const userRef = doc(this.firestoreH, `nutricionistas/${user.uid}`);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            observer.next({ uid: user.uid, ...docSnap.data(), metadata: user.metadata });
          } else {
            observer.next(null);
          }
        } else {
          observer.next(null);
        }
      });
    });
  }
  //contar pacientes
  countPacientes(nutricionistaId: string): Observable<number> {
    return new Observable(observer => {
      this.firestore.collection('pacientes', ref => ref.where('nutricionistaId', '==', nutricionistaId)).snapshotChanges().subscribe(pacientes => {
        observer.next(pacientes.length);
      });
    });
  }
  //contar consultas
  countConsultas(nutricionistaId: string): Observable<number> {
    return new Observable(observer => {
      this.firestore.collection('consultas', ref => ref.where('nutricionistaId', '==', nutricionistaId)).snapshotChanges().subscribe(consultas => {
        observer.next(consultas.length);
      });
    });
  }


  //edit user
  updateUser (updatedData: any): Observable<void> {
    return new Observable(observer => {
      this.afAuth.currentUser .then(user => {
        if (user) {
          const uid = user.uid;
          this.firestore.collection('nutricionistas').doc(uid).update(updatedData).then(() => {
            observer.next();
            observer.complete();
          }).catch(error => observer.error(error));
        } else {
          observer.error('Usuário não autenticado.');
        }
      }).catch(error => observer.error(error));
    });
  }

  updatePassword(newPassword: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.afAuth.currentUser.then(user => {
        if (user) {
          user.updatePassword(newPassword).then(() => {
            console.log('Senha atualizada com sucesso');
            resolve();
          }).catch(error => {
            console.error('Erro ao atualizar a senha:', error);
            reject(error);
          });
        } else {
          reject('Usuário não autenticado.');
        }
      }).catch(error => {
        reject(error);
      });
    });
  }
  
  reauthenticate(password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.afAuth.currentUser.then(user => {
        if (user && user.email) {
          console.log('E-mail do usuário:', user.email); // Verifique o e-mail
          const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
          user.reauthenticateWithCredential(credential).then(() => {
            resolve();
          }).catch(error => {
            console.error('Erro na reautenticação:', error); // Verifique o erro
            reject(error);
          });
        } else {
          reject('Usuário não autenticado.');
        }
      }).catch(error => {
        reject(error);
      });
    });
  }

  getConsultasDoDia(nutricionistaId: string, data: string): Observable<any[]> {
    return new Observable(observer => {
      const consultasRef = collection(this.firestoreH, 'agendamento'); // Acessando a coleção 'agendamento'
      const q = query(
        consultasRef,
        where('data', '==', data), // Filtrando pela data
        where('userId', '==', nutricionistaId),
        orderBy('horario', 'asc')  // Filtrando pelo userId
      );
  
      getDocs(q).then(snapshot => {
        const consultas = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        observer.next(consultas);
        observer.complete();
      }).catch(error => {
        console.error('Erro ao carregar consultas do dia:', error);
        observer.error(error);
      });
    });
  }

   
}
