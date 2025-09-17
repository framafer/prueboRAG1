import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubidaDeDocumentosComponent } from './subida-de-documentos.component';

describe('SubidaDeDocumentosComponent', () => {
  let component: SubidaDeDocumentosComponent;
  let fixture: ComponentFixture<SubidaDeDocumentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubidaDeDocumentosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubidaDeDocumentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
