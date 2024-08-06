import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClassificationFormComponent } from './classification-form.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

describe('ClassificationFormComponent', () => {
  let component: ClassificationFormComponent;
  let fixture: ComponentFixture<ClassificationFormComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatCardModule
      ],
      declarations: [ClassificationFormComponent],
      providers: [FormBuilder]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassificationFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.classificationForm).toBeDefined();
    expect(component.classificationForm.get('image')).toBeDefined();
  });

  it('should update form and preview on file selection', () => {
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const event = {
      target: {
        files: [file]
      }
    } as unknown as Event;

    component.onFileSelected(event);

    expect(component.file).toBe(file);
    expect(component.selectedFileName).toBe('test.png');
    expect(component.classificationForm.get('image')?.value).toBe(file);

    const reader = new FileReader();
    reader.onload = () => {
      expect(component.imagePreview).toBe(reader.result);
    };
    reader.readAsDataURL(file);
  });

  it('should call classifyDigit and handle success response', () => {
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    component.file = file;
    component.classificationForm.patchValue({ image: file });

    const predictionResponse = { message: 'Digit value for image: [5]' };

    component.classifyDigit();

    const req = httpMock.expectOne('https://localhost:8080/v1/classify-image-as-digit');
    expect(req.request.method).toBe('POST');
    req.flush(predictionResponse);

    expect(component.imageClassification).toBe('5');
  });

  it('should call classifyDigit and handle error response', () => {
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    component.file = file;
    component.classificationForm.patchValue({ image: file });

    spyOn(console, 'log');

    component.classifyDigit();

    const req = httpMock.expectOne('https://localhost:8080/v1/classify-image-as-digit');
    expect(req.request.method).toBe('POST');
    req.error(new ErrorEvent('Network error'));

    expect(console.log).toHaveBeenCalledWith('Error occurred');
  });
});
