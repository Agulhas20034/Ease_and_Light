import { Component, OnInit } from '@angular/core';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-cria-localizacao',
  templateUrl: './cria-localizacao.page.html',
  styleUrls: ['./cria-localizacao.page.scss'],
  standalone: false,
})
export class CriaLocalizacaoPage implements OnInit {

  constructor(public t: TranslationService) { }

  ngOnInit() {
  }

}
