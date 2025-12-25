import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriaLocalizacaoPage } from './cria-localizacao.page';

describe('CriaLocalizacaoPage', () => {
  let component: CriaLocalizacaoPage;
  let fixture: ComponentFixture<CriaLocalizacaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CriaLocalizacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
