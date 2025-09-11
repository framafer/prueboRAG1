import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatRagComponent } from './components/chat-rag/chat-rag.component';

const routes: Routes = [
  { path: '', component: ChatRagComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
