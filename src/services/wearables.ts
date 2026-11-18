import { Platform } from 'react-native';
import { getDatabase } from '../db/sqlite';

export type WearableProviderId =
  | 'health_connect'
  | 'apple_health'
  | 'oura'
  | 'fitbit'
  | 'whoop'
  | 'withings'
  | 'ultrahuman'
  | 'polar'
  | 'huawei_health'
  | 'luna';

export interface WearableProviderMeta {
  id: WearableProviderId;
  name: string;
  category: 'System' | 'Smart Ring' | 'Fitness Tracker';
  supportedMetrics: ('sleep' | 'heart_rate' | 'temperature' | 'bbt' | 'steps' | 'activity')[];
  platform: 'android' | 'ios' | 'cross_platform';
  description: string;
}

export const WEARABLE_PROVIDERS: WearableProviderMeta[] = [
  {
    id: 'health_connect',
    name: 'Android Health Connect',
    category: 'System',
    supportedMetrics: ['sleep', 'heart_rate', 'temperature', 'bbt', 'steps', 'activity'],
    platform: 'android',
    description: 'Google Health Connect on Android allows centralized, encrypted biometric sync with apps like Samsung Health and Pixel Watch.',
  },
  {
    id: 'apple_health',
    name: 'Apple Health (HealthKit)',
    category: 'System',
    supportedMetrics: ['sleep', 'heart_rate', 'temperature', 'bbt', 'steps', 'activity'],
    platform: 'ios',
    description: 'Apple HealthKit integration for iOS devices (requires iOS environment and Apple Health permissions).',
  },
  {
    id: 'oura',
    name: 'Oura Ring (Gen 3 / Ring 4)',
    category: 'Smart Ring',
    supportedMetrics: ['sleep', 'temperature', 'bbt', 'heart_rate'],
    platform: 'cross_platform',
    description: 'Syncs overnight temperature deviation, readiness scores, and precise sleep phase tracking via official Oura Cloud API.',
  },
  {
    id: 'fitbit',
    name: 'Fitbit by Google',
    category: 'Fitness Tracker',
    supportedMetrics: ['sleep', 'heart_rate', 'steps', 'activity'],
    platform: 'cross_platform',
    description: 'Connects to Fitbit Web API for daily active minutes, resting heart rate, and sleep duration.',
  },
  {
    id: 'whoop',
    name: 'WHOOP 4.0',
    category: 'Fitness Tracker',
    supportedMetrics: ['sleep', 'heart_rate', 'temperature', 'activity'],
    platform: 'cross_platform',
    description: 'Connects to WHOOP Developer API for strain, sleep performance, and skin temperature variations.',
  },
  {
    id: 'withings',
    name: 'Withings Health Mate',
    category: 'Fitness Tracker',
    supportedMetrics: ['sleep', 'heart_rate', 'temperature'],
    platform: 'cross_platform',
    description: 'Syncs with Withings ScanWatch and smart thermo devices via Withings Public Health API.',
  },
  {
    id: 'ultrahuman',
    name: 'Ultrahuman Ring AIR',
    category: 'Smart Ring',
    supportedMetrics: ['sleep', 'temperature', 'bbt', 'activity'],
    platform: 'cross_platform',
    description: 'Syncs circadian alignment, skin temperature shifts for ovulation confirmation, and movement scores.',
  },
  {
    id: 'polar',
    name: 'Polar Flow',
    category: 'Fitness Tracker',
    supportedMetrics: ['sleep', 'heart_rate', 'activity'],
    platform: 'cross_platform',
    description: 'Connects to Polar Open AccessLink API for nighttime recharge and resting heart rate.',
  },
  {
    id: 'huawei_health',
    name: 'Huawei Health Kit',
    category: 'Fitness Tracker',
    supportedMetrics: ['sleep', 'heart_rate', 'steps', 'activity'],
    platform: 'cross_platform',
    description: 'Integrates via Huawei Health Kit for smart bands and watches.',
  },
  {
    id: 'luna',
    name: 'Luna Smart Ring',
    category: 'Smart Ring',
    supportedMetrics: ['sleep', 'heart_rate', 'temperature'],
    platform: 'cross_platform',
    description: 'Syncs sleep stages and peripheral temperature from Luna Ring Bluetooth companion bridge.',
  },
];

export async function getConnectedWearables(): Promise<Record<string, boolean>> {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ provider: string; is_connected: number }>(
      'SELECT provider, is_connected FROM wearable_connections'
    );
    const connectedMap: Record<string, boolean> = {};
    for (const r of rows) {
      connectedMap[r.provider] = r.is_connected === 1;
    }
    return connectedMap;
  } catch {
    return {};
  }
}

export async function toggleWearableConnection(
  provider: WearableProviderId,
  connect: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getDatabase();
    const defaultUserId = 'local-princess-user';

    if (connect) {
      // Check platform eligibility
      if (provider === 'apple_health' && Platform.OS !== 'ios') {
        return {
          success: false,
          message: 'Apple Health is only available on iOS devices.',
        };
      }

      await db.runAsync(
        `INSERT INTO wearable_connections (id, user_id, provider, is_connected, last_sync)
         VALUES (?, ?, ?, 1, datetime('now'))
         ON CONFLICT(user_id, provider) DO UPDATE SET is_connected = 1, last_sync = datetime('now')`,
        [`wear_${provider}`, defaultUserId, provider]
      );
      return { success: true, message: `Successfully connected to ${provider}` };
    } else {
      await db.runAsync(
        `UPDATE wearable_connections SET is_connected = 0 WHERE user_id = ? AND provider = ?`,
        [defaultUserId, provider]
      );
      return { success: true, message: `Disconnected from ${provider}` };
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed' };
  }
}
