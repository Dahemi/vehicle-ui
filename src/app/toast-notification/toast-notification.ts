import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { NotificationService } from '../services/notification.service';
import { Subscription } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-notification.html',
  styleUrl: './toast-notification.css',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastNotification implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private nextId = 0;
  private subscriptions = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Subscribe to export completion events
    this.subscriptions.add(
      this.notificationService.onExportCompleted().subscribe(data => {
        const message = data.recordCount > 0
          ? `Export completed! ${data.recordCount} vehicles exported to ${data.filename}`
          : `No vehicles found older than ${data.years} years`;
        
        this.showToast(message, 'success');
      })
    );

    // Subscribe to export failure events
    this.subscriptions.add(
      this.notificationService.onExportFailed().subscribe(data => {
        this.showToast(`Export failed: ${data.error}`, 'error');
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const toast: Toast = {
      id: this.nextId++,
      message,
      type,
    };

    this.toasts.push(toast);

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      this.removeToast(toast.id);
    }, 10000);
  }

  private removeToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✗';
      default: return 'ℹ';
    }
  }
}