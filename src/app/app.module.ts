import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { MenuComponent } from './components/menu/menu.component';
import { ButtonComponent } from './components/button/button.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment.development';
import {AngularFireModule} from '@angular/fire/compat';
import { FormsModule } from '@angular/forms';
//alerts
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { SignupComponent } from './pages/signup/signup.component';
import { ReactiveFormsModule } from '@angular/forms';
//angular material
import { MatIconModule } from '@angular/material/icon';
import {MatProgressSpinnerModule, MatSpinner} from '@angular/material/progress-spinner';
import { EditUserComponent } from './pages/edit-user/edit-user.component';
//calendario
import { CalendarioComponent } from './pages/calendario/calendario.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { NewpacienteComponent } from './pages/newpaciente/newpaciente.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ListpacientesComponent } from './pages/listpacientes/listpacientes.component';
import { MatTableModule } from '@angular/material/table';
import { ListatendimentosComponent } from './pages/listatendimentos/listatendimentos.component';
import { NewatendimentoComponent } from './pages/newatendimento/newatendimento.component';
import { AtendimentosregularesComponent } from './pages/atendimentosregulares/atendimentosregulares.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';




@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    ButtonComponent,
    MenuComponent,
    HomeComponent,
    SignupComponent,
    EditUserComponent,
    CalendarioComponent,
    NewpacienteComponent,
    ListpacientesComponent,
    ListatendimentosComponent,
    NewatendimentoComponent,
    AtendimentosregularesComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    ReactiveFormsModule,
    //alerts
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    //fim alerts
    MatIconModule,
    MatProgressSpinnerModule,
    //calendario
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatTableModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatAutocompleteModule
  ],
  providers: [
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp({"projectId":"tcc-lucas-a9f3e","appId":"1:1029651621986:web:d0fdcb9cf53b6118f7c93b","storageBucket":"tcc-lucas-a9f3e.firebasestorage.app","apiKey":"AIzaSyCNq5TH4HjvH2nTpBVzOce-8TNrW4YnZcU","authDomain":"tcc-lucas-a9f3e.firebaseapp.com","messagingSenderId":"1029651621986"})),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
