import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: false,
})
export class SplashPage {
  constructor(private router: Router, private menuCtrl: MenuController) {}

  async ngOnInit() {
    await this.menuCtrl.enable(false);
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2500);
  }

  async ngOnDestroy() {
    await this.menuCtrl.enable(true);
  }
}
