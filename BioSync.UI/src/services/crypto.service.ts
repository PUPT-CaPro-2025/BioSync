import {Injectable} from '@angular/core';
import CryptoJS from 'crypto-js';
import {environment} from "../../environment/app.setting";

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private key: string = environment.key; // Should be a strong key

  encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.key).toString();
  }

  decrypt(ciphertext: string): string {
    const bytes = CryptoJS.AES.decrypt(ciphertext, this.key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

}
