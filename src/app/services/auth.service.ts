import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { from, Observable, switchMap } from 'rxjs';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';

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
        // Armazene os dados do nutricionista no Firestore
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
  
  getCurrentUser (): Observable<any> {
    return new Observable(observer => {
      this.afAuth.authState.subscribe(async user => {
        if (user) {
          const userRef = doc(this.firestoreH, `nutricionistas/${user.uid}`);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            observer.next({ uid: user.uid, ...docSnap.data() });
          } else {
            observer.next(null);
          }
        } else {
          observer.next(null);
        }
      });
    });
  }
}
