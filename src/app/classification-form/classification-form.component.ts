import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PredictionResponse } from '../prediction-response';

@Component({
  selector: 'app-classification-form',
  templateUrl: './classification-form.component.html',
  styleUrls: ['./classification-form.component.css']
})
export class ClassificationFormComponent {
  classificationForm: FormGroup;
  file?: File;

  imageClassification?: string;

  selectedFileName: string = '';
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.classificationForm = this.fb.group({
      image: [null]
    });
  }

  classifyDigit() {
    if (this.classificationForm.valid) {
      const formData: FormData = new FormData();
      formData.append('image', this.file as Blob);

      this.http.post<PredictionResponse>('https://localhost:8080/v1/classify-image-as-digit', formData)
      .subscribe({
        next: (response: PredictionResponse) => {
          this.imageClassification = response.message?.replaceAll('Digit value for image: \[', '').replaceAll('\]', '');
        },
        error: () => console.log('Error occurred')
      }); 
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.file = file;
      this.selectedFileName = file.name;
      this.classificationForm.patchValue({ image: file });
      this.classificationForm.get('image')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
