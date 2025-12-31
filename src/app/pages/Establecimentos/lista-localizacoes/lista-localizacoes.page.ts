import { Component, OnInit } from '@angular/core';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-lista-localizacoes',
  templateUrl: './lista-localizacoes.page.html',
  styleUrls: ['./lista-localizacoes.page.scss'],
  standalone: false,
})
export class ListaLocalizacoesPage implements OnInit {

  constructor(public t: TranslationService) { }

  ngOnInit() {
  }

}
