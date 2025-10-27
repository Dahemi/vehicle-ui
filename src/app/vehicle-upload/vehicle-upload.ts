import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleUploadService } from '../services/vehicle-upload.service';
import { interval, switchMap, takeWhile } from 'rxjs';

@Component({
  selector: 'app-vehicle-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-upload.html',
  styleUrls: ['./vehicle-upload.css']
})

export class VehicleUploadComponent {
  selectedFile: File | null = null;
  uploading = false;
  uploadMessage = '';
  jobStatus: string | null = null;

  constructor(private uploadService: VehicleUploadService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onUpload(): void {
    if (!this.selectedFile) {
      this.uploadMessage = 'Please select a file first';
      return;
    }

    this.uploading = true;
    this.uploadMessage = 'Uploading file...';

    this.uploadService.uploadFile(this.selectedFile).subscribe({
      next: (response) => {
        this.uploadMessage = `${response.message} - Job ID: ${response.jobId}`;
        this.pollJobStatus(response.jobId);
      },
      error: (err) => {
        this.uploading = false;
        this.uploadMessage = `Upload failed: ${err.error?.message || err.message}`;
        console.error('Upload error:', err);
      }
    });
  }

  private pollJobStatus(jobId: string): void {
    interval(2000) // Poll every 2 seconds
      .pipe(
        switchMap(() => this.uploadService.getJobStatus(jobId)),
        takeWhile((status) => status.status !== 'completed' && status.status !== 'failed', true)
      )
      .subscribe({
        next: (status) => {
          this.jobStatus = status.status;
          
          if (status.status === 'completed') {
            this.uploading = false;
            this.uploadMessage = '✓ Import completed successfully!';
            this.selectedFile = null;
          } else if (status.status === 'failed') {
            this.uploading = false;
            this.uploadMessage = '✗ Import failed';
          } else {
            this.uploadMessage = `Processing... (${status.status})`;
          }
        },
        error: (err) => {
          this.uploading = false;
          this.uploadMessage = 'Error checking job status';
          console.error('Status check error:', err);
        }
      });
  }
}