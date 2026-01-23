import CryptoJS from "crypto-js";
import { env } from "@/config/env";

const isBrowser = typeof window !== "undefined";

const getKey = () => {
  return CryptoJS.SHA256(env.encryptionKey).toString();
};

export const secureStorage = {
  set(key: string, value: unknown) {
    if (!isBrowser) return;
    const serialized = JSON.stringify(value);
    const cipher = CryptoJS.AES.encrypt(serialized, getKey()).toString();
    window.localStorage.setItem(key, cipher);
  },
  get<T>(key: string): T | null {
    if (!isBrowser) return null;
    const cipher = window.localStorage.getItem(key);
    if (!cipher) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(cipher, getKey());
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted) as T;
    } catch {
      return null;
    }
  },
  remove(key: string) {
    if (!isBrowser) return;
    window.localStorage.removeItem(key);
  },
};

