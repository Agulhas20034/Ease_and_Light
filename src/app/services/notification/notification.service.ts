import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private permissionGranted = false;

  constructor() {
    this.checkPermission();
  }

  private async checkPermission() {
    if ('Notification' in window) {
      this.permissionGranted = Notification.permission === 'granted';
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    }

    return false;
  }

  async showNotification(title: string, options?: NotificationOptions) {
    if (!this.permissionGranted) {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/assets/icon/favicon.png',
      badge: '/assets/icon/favicon.png',
      ...options
    };

    const notification = new Notification(title, defaultOptions);

    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }

  async notifyGroupInvite(groupName: string, inviterName: string) {
    await this.showNotification(
      'New Group Invitation',
      {
        body: `${inviterName} invited you to join "${groupName}"`,
        tag: 'group-invite',
        requireInteraction: true
      }
    );
  }

  async notifyNewMessage(groupName: string, senderName: string, message: string) {
    await this.showNotification(
      `New message in ${groupName}`,
      {
        body: `${senderName}: ${message}`,
        tag: `group-message-${groupName}`,
        silent: false
      }
    );
  }
}