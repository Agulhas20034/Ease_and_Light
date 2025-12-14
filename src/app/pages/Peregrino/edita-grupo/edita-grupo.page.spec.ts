import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditaGrupoPage } from './edita-grupo.page';

describe('EditaGrupoPage', () => {
  let component: EditaGrupoPage;
  let fixture: ComponentFixture<EditaGrupoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditaGrupoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
