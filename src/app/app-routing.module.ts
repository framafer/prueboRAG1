import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatRagComponent } from './components/chat-rag/chat-rag.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/notes', pathMatch: 'full' },
  { path: 'notes', loadComponent: () => import('./components/notes-list/notes-list.component').then(m => m.NotesListComponent), canActivate: [AuthGuard] },
  { path: 'chat', component: ChatRagComponent, canActivate: [AuthGuard] },
  { path: 'login', loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
