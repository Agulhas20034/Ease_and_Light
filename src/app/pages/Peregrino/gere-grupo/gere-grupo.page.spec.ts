import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GereGrupoPage } from './gere-grupo.page';

describe('GereGrupoPage', () => {
  let component: GereGrupoPage;
  let fixture: ComponentFixture<GereGrupoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GereGrupoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
