import { Component } from '@angular/core';
import { TranslationService } from './services/translations/translation.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(public tService: TranslationService) {}

  // read current user from localStorage (set on login)
  get currentUser() {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch {
      return null;
    }
  }

  t(key: string) {
    return this.tService.translate(key);
  }
}
