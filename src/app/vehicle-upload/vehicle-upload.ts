import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleUploadService } from '../services/vehicle-upload.service';
import { NotificationService } from '../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vehicle-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-upload.html',
  styleUrls: ['./vehicle-upload.css']
})
export class VehicleUploadComponent implements OnInit, OnDestroy {
  selectedFile: File | null = null;
  uploading = false;
  uploadMessage = '';
  currentJobId: string | null = null;
  
  private subscriptions = new Subscription();
  jobStatus: any;

  constructor(
    private uploadService: VehicleUploadService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.notificationService.onImportCompleted().subscribe(data => {
        if (data.jobId === this.currentJobId) {
          this.uploading = false;
          this.uploadMessage = `✓ Import completed! ${data.recordCount} vehicles imported.`;
          this.selectedFile = null;
          this.currentJobId = null;
        }
      })
    );

    
    this.subscriptions.add(
      this.notificationService.onImportFailed().subscribe(data => {
        if (data.jobId === this.currentJobId) {
          this.uploading = false;
          this.uploadMessage = `✗ Import failed: ${data.error}`;
          this.currentJobId = null;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

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
        this.currentJobId = response.jobId; 
        this.uploadMessage = `File uploaded. Processing...`;
      },
      error: (err) => {
        this.uploading = false;
        this.uploadMessage = `Upload failed: ${err.error?.message || err.message}`;
        console.error('Upload error:', err);
      }
    });
  }
}