import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// shape of the response when a file is sucessfully uploaded
export interface UploadResponse {
  message: string;
  jobId: string;
  status: string;
}

// response structure when checking job progress
export interface JobStatusResponse {
  jobId: string;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  progress: number;
  result?: any;
}

export interface ExportResponse{
  message: string;
  jobId: string;
  status: string;
  years: number;
}

export interface ExportJobStatusResponse {
  jobId: string;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  progress: number;
  result?: {
    status: string;
    filePath: string;
    filename: string;
    recordCount: number;
    years: number;
  }
}

@Injectable({
  providedIn: 'root'
})


export class VehicleUploadService {
  private apiUrl = 'http://localhost:3000/vehicles';

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  getJobStatus(jobId: string): Observable<JobStatusResponse> {
    return this.http.post<JobStatusResponse>(`${this.apiUrl}/job-status/${jobId}`, {});
  }

  exportVehicles(years: number): Observable<ExportResponse>{
    return this.http.post<ExportResponse>(`${this.apiUrl}/export`, {years});
  }

}