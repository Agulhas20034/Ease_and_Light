import { Component, OnInit } from '@angular/core';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-lista-empregados',
  templateUrl: './lista-empregados.page.html',
  styleUrls: ['./lista-empregados.page.scss'],
  standalone: false,
})
export class ListaEmpregadosPage implements OnInit {

  constructor(public t: TranslationService) { }

  ngOnInit() {
  }

}
