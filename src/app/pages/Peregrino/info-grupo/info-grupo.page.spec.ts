import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoGrupoPage } from './info-grupo.page';

describe('InfoGrupoPage', () => {
  let component: InfoGrupoPage;
  let fixture: ComponentFixture<InfoGrupoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoGrupoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
