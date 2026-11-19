import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BOYFRIEND_PIN_KEY = 'barbie_boyfriend_secure_pin';

export async function isBiometricAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch {
    return false;
  }
}

export async function authenticateWithBiometrics(
  promptMessage: string = 'Unlock Barbie Period Sanctuary'
): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  try {
    const available = await isBiometricAvailable();
    if (!available) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use Passcode',
      disableDeviceFallback: false,
      cancelLabel: 'Cancel',
    });

    return result.success;
  } catch (err) {
    console.warn('Biometric authentication failed:', err);
    return false;
  }
}

/**
 * Biometric prompt specifically for Boyfriend Dashboard.
 */
export async function authenticateBoyfriendBiometrics(): Promise<boolean> {
  return authenticateWithBiometrics('Boyfriend Verification: Fingerprint / Face ID 💕');
}

/**
 * SecureStore helpers for Boyfriend Secret PIN
 */
export async function getBoyfriendPin(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(BOYFRIEND_PIN_KEY) : null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(BOYFRIEND_PIN_KEY);
}

export async function setBoyfriendPin(pin: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(BOYFRIEND_PIN_KEY, pin);
      }
    } catch {}
    return;
  }
  await SecureStore.setItemAsync(BOYFRIEND_PIN_KEY, pin);
}

export async function isBoyfriendPinSet(): Promise<boolean> {
  const pin = await getBoyfriendPin();
  return Boolean(pin && pin.length === 4);
}

export async function verifyBoyfriendPin(enteredPin: string): Promise<boolean> {
  const savedPin = await getBoyfriendPin();
  if (!savedPin) return false;
  return enteredPin === savedPin;
}
