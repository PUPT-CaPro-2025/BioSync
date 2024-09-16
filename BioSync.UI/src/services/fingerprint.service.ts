import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

declare const Fingerprint: any;

@Injectable({
  providedIn: 'root'
})
export class FingerprintService {
  private sdk: any;
  private imageSrcSubject = new BehaviorSubject<string | null>(null);

  loadSDK() {
    const script = document.createElement('script');
    script.src = './assets/scripts/websdk.client.bundle.min.js';
    script.onload = () => {
      console.log('SDK script loaded successfully.');
      this.initSDK();
      this.startCapture();
    };
    script.onerror = () => console.log('Failed to load SDK script');
    document.body.appendChild(script);
  }

  base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  getImageSrc(): Observable<string | null> {
    return this.imageSrcSubject.asObservable();
  }

  //region PRIVATE METHODS
  private initSDK() {
    if (typeof Fingerprint !== 'undefined') {
      try {
        console.log('Initializing SDK...');
        this.sdk = new Fingerprint.WebApi();
        console.log('SDK Initialized:', this.sdk);

        this.sdk.onQualityReported = (e: any) => this.qualityReported(e);
        this.sdk.onSamplesAcquired = (s: any) => this.sampleAcquired(s);
        this.sdk.onDeviceConnected = () => this.showMessage('Scan your finger');
        this.sdk.onDeviceDisconnected = () =>
          this.showMessage('Device disconnected');
        this.sdk.onCommunicationFailed = () =>
          this.showMessage('Communication failed');
      } catch (error) {
        this.showMessage('Failed to initialize SDK');
        console.error('Error initializing SDK:', error);
      }
    } else {
      console.error('Fingerprint SDK is not available.');
      this.showMessage('Fingerprint SDK is not available.');
    }
  }

  private sampleAcquired(s: any) {
    if (s.sampleFormat === 5) {
      try {
        const samples = JSON.parse(s.samples);
        if (samples.length > 0) {
          const base64Image = Fingerprint.b64UrlTo64(samples[0]);
          this.imageSrcSubject.next(base64Image);
        }
      } catch (error) {
        console.error('Error processing samples:', error);
      }
    } else {
      console.error('Unexpected sample format:', s.sampleFormat);
    }
  }

  private startCapture() {
    this.sdk
      .startAcquisition(Fingerprint.SampleFormat.PngImage)
      .then(() => {
        this.showMessage('Capture started');
        console.log('Capture started successfully');
      })
      .catch((error: any) => {
        this.showMessage(`Error starting capture: ${error.message}`);
        console.error('Error starting capture:', error);
      });
  }

  private showMessage(message: string) {
    console.log(message);
  }

  private qualityReported(e: any) {
    console.log(e);
  }
  //endregion
}
