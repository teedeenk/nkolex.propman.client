import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FinancialDataService } from '../services/financial-data.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent {
  selectedFile: File | null = null;
  isDragging: boolean = false;
  isUploading: boolean = false;
  uploadError: string | null = null;
  uploadSuccess: boolean = false;

  constructor(
    private router: Router,
    private financialDataService: FinancialDataService,
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  private handleFile(file: File): void {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.uploadError = 'Please select a CSV file';
      this.selectedFile = null;
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.uploadError = 'File size must be less than 10MB';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
    this.uploadError = null;
    this.uploadSuccess = false;
  }

  removeFile(): void {
    this.selectedFile = null;
    this.uploadError = null;
    this.uploadSuccess = false;
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.uploadError = 'Please select a file first';
      return;
    }

    this.isUploading = true;
    this.uploadError = null;

    this.financialDataService.uploadCSV(this.selectedFile).subscribe({
      next: (response) => {
        console.log('Upload successful:', response);
        this.isUploading = false;
        this.uploadSuccess = true;

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        console.error('Upload failed:', error);
        this.isUploading = false;
        this.uploadError =
          error.message || 'Failed to upload file. Please try again.';
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
