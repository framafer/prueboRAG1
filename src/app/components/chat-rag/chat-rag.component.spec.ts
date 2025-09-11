import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatRagComponent } from './chat-rag.component';

describe('ChatRagComponent', () => {
  let component: ChatRagComponent;
  let fixture: ComponentFixture<ChatRagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatRagComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatRagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
