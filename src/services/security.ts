import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export async function isBiometricAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
}

export async function authenticateWithBiometrics(promptMessage: string = 'Unlock Barbie Period Sanctuary'): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  try {
    const available = await isBiometricAvailable();
    if (!available) return true; // Fallback if no biometric hardware enrolled

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
