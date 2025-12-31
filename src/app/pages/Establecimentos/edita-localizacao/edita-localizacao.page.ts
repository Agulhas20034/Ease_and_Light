import { Component, OnInit } from '@angular/core';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-edita-localizacao',
  templateUrl: './edita-localizacao.page.html',
  styleUrls: ['./edita-localizacao.page.scss'],
  standalone: false,
})
export class EditaLocalizacaoPage implements OnInit {

  constructor(public t: TranslationService) { }

  ngOnInit() {
  }

}
