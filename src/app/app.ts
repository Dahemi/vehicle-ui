import { Component, signal } from '@angular/core';
import { VehicleList } from './vehicle-list/vehicle-list';
import { VehicleUploadComponent } from './vehicle-upload/vehicle-upload';
import { VehicleExport } from "./vehicle-export/vehicle-export";

@Component({
  selector: 'app-root',
  imports: [VehicleList, VehicleUploadComponent, VehicleExport],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('vehicle-ui');
}