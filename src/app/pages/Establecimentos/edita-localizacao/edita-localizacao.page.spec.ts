import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditaLocalizacaoPage } from './edita-localizacao.page';

describe('EditaLocalizacaoPage', () => {
  let component: EditaLocalizacaoPage;
  let fixture: ComponentFixture<EditaLocalizacaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditaLocalizacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
