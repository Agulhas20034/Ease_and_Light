import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-owner-popover',
  templateUrl: './owner-popover.component.html',
  standalone: false,
})
export class OwnerPopoverComponent {
  @Input() users: any[] = [];
  public q = '';

  constructor(private popoverCtrl: PopoverController) {}

  get filtered() {
    const q = (this.q || '').toLowerCase().trim();
    if (!q) return this.users || [];
    return (this.users || []).filter(u => ((u.email || '') + '').toLowerCase().includes(q));
  }

  select(u: any) {
    this.popoverCtrl.dismiss({ selected: u });
  }

  close() {
    this.popoverCtrl.dismiss();
  }
}
