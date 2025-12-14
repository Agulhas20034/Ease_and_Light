import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriaGrupoPage } from './cria-grupo.page';

describe('CriaGrupoPage', () => {
  let component: CriaGrupoPage;
  let fixture: ComponentFixture<CriaGrupoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CriaGrupoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
