import { Routes } from '@angular/router';
import { ChatAiComponent } from './components/chat-ai/chat-ai.component';
import { NotesListComponent } from './components/notes-list/notes-list.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: '', component: NotesListComponent, canActivate: [authGuard] },
    { path: 'chat', component: ChatAiComponent, canActivate: [authGuard] }
];
