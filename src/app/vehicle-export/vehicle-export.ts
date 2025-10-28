import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { interval, switchMap, takeWhile } from 'rxjs';
import { VehicleUploadService } from '../services/vehicle-upload.service';

@Component({
  selector: 'app-vehicle-export',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './vehicle-export.html',
  styleUrl: './vehicle-export.css',
})
export class VehicleExport {
  selectedYears: number = 5;
  exporting = false;

  constructor(private uploadService: VehicleUploadService) {}

  onExport(): void {
    if (this.selectedYears < 1) {
      return;
    }

    this.exporting = true;

    this.uploadService.exportVehicles(this.selectedYears).subscribe({
      next: (response) => {
        console.log(`Export started - Job ID: ${response.jobId}`);
      },
      error: (err) => {
        this.exporting = false;
        console.error('Export error:', err);
      },
      complete:() =>{
        this.exporting = false;
      }
    });
  }

}
