import { Component, signal, OnDestroy } from '@angular/core';
import { VehicleList } from './vehicle-list/vehicle-list';
import { VehicleUploadComponent } from './vehicle-upload/vehicle-upload';
import { VehicleExport } from './vehicle-export/vehicle-export';
import { NotificationService } from './services/notification.service';
import { ToastNotification } from './toast-notification/toast-notification';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { RepairRecordList } from "./repair-records/repair-records";
import { VinRepairLookup } from "./vin-repair-lookup/vin-repair-lookup";

@Component({
  selector: 'app-root',
  imports: [
    VehicleList, 
    VehicleUploadComponent, 
    VehicleExport, 
    ToastNotification, 
    NzTabsModule, 
    RepairRecordList,
    VinRepairLookup
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnDestroy {
  protected readonly title = signal('vehicle-ui');
  selectedTabIndex = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnDestroy(): void {
    this.notificationService.disconnect();
  }
}