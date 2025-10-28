import { Component, signal, OnDestroy } from '@angular/core';
import { VehicleList } from './vehicle-list/vehicle-list';
import { VehicleUploadComponent } from './vehicle-upload/vehicle-upload';
import { VehicleExport } from "./vehicle-export/vehicle-export";
import { NotificationService } from './services/notification.service';
import { ToastNotification } from './toast-notification/toast-notification';

@Component({
  selector: 'app-root',
  imports: [VehicleList, VehicleUploadComponent, VehicleExport, ToastNotification],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnDestroy {
  protected readonly title = signal('vehicle-ui');

  constructor(private notificationService: NotificationService) {}

  ngOnDestroy(): void {
    this.notificationService.disconnect();
  }
}