import { Component, OnInit } from '@angular/core';
import { TranslationService } from './services/translations/translation.service';
import { NotificationService } from './services/notification/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(
    public tService: TranslationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.notificationService.requestPermission();
  }

  get currentUser() {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch {
      return null;
    }
  }

  isProfileType(profileName: string): boolean {
    const user = this.currentUser;
    if (!user) return false;
    const stored = (user.profileType || user.id_tipo || '').toString();
    return stored === profileName.toString();
  }

  t(key: string) {
    return this.tService.translate(key);
  }
}
