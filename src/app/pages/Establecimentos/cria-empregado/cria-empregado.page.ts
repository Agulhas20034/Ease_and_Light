import { Component, OnInit } from '@angular/core';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-cria-empregado',
  templateUrl: './cria-empregado.page.html',
  styleUrls: ['./cria-empregado.page.scss'],
  standalone: false,
})
export class CriaEmpregadoPage implements OnInit {

  constructor(public t: TranslationService) { }

  ngOnInit() {
  }

}
