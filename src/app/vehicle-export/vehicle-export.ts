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
  exportMessage = '';
  jobStatus: string | null = null;

  constructor(private uploadService: VehicleUploadService) {}

  onExport(): void {
    if (this.selectedYears < 1) {
      this.exportMessage = 'Please enter a valid number of years (minimum 1)';
      return;
    }

    this.exporting = true;
    this.exportMessage = `Starting export for vehicles older than ${this.selectedYears} years...`;

    this.uploadService.exportVehicles(this.selectedYears).subscribe({
      next: (response) => {
        this.exportMessage = `${response.message} - Job ID: ${response.jobId}`;
        this.pollExportJobStatus(response.jobId);
      },
      error: (err) => {
        this.exporting = false;
        this.exportMessage = `Export failed: ${err.error?.message || err.message}`;
        console.error('Export error:', err);
      }
    });
  }

  private pollExportJobStatus(jobId: string): void {
    interval(2000) // Poll every 2 seconds
      .pipe(
        switchMap(() => this.uploadService.getExportJobStatus(jobId)),
        takeWhile((status) => status.status !== 'completed' && status.status !== 'failed', true)
      )
      .subscribe({
        next: (status) => {
          this.jobStatus = status.status;
          
          if (status.status === 'completed') {
            this.exporting = false;
            if (status.result) {
              this.exportMessage = `✓ Export completed! ${status.result.recordCount} vehicles exported to ${status.result.filename}`;
            } else {
              this.exportMessage = '✓ Export completed successfully!';
            }
          } else if (status.status === 'failed') {
            this.exporting = false;
            this.exportMessage = '✗ Export failed';
          } else {
            this.exportMessage = `Processing export... (${status.status})`;
          }
        },
        error: (err) => {
          this.exporting = false;
          this.exportMessage = 'Error checking export job status';
          console.error('Status check error:', err);
        }
      });
  }

}
