import { Component, OnInit } from '@angular/core';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-gere-pedidos',
  templateUrl: './gere-pedidos.page.html',
  styleUrls: ['./gere-pedidos.page.scss'],
  standalone: false,
})
export class GerePedidosPage implements OnInit {

  constructor(public t: TranslationService) { }

  ngOnInit() {
  }

}
