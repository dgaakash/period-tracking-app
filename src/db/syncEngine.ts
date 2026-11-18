import { getDatabase } from './sqlite';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export interface SyncQueueItem {
  id: string;
  table_name: string;
  record_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: string;
  status: 'pending' | 'syncing' | 'synced' | 'conflict';
  retry_count: number;
  error_message?: string;
  created_at: string;
}

export async function queueOperation(
  tableName: string,
  recordId: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE',
  payload: Record<string, any>
): Promise<void> {
  const db = await getDatabase();
  const queueId = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  await db.runAsync(
    `INSERT INTO sync_queue (id, table_name, record_id, operation, payload, status, retry_count)
     VALUES (?, ?, ?, ?, ?, 'pending', 0)`,
    [queueId, tableName, recordId, operation, JSON.stringify(payload)]
  );

  // If Supabase is configured, attempt non-blocking sync in background
  if (isSupabaseConfigured) {
    processSyncQueue().catch((err) => {
      console.warn('[SyncEngine] Background sync attempt failed:', err?.message || err);
    });
  }
}

export async function processSyncQueue(): Promise<{ processed: number; errors: number }> {
  if (!isSupabaseConfigured) {
    return { processed: 0, errors: 0 };
  }

  const db = await getDatabase();
  const pendingItems = await db.getAllAsync<SyncQueueItem>(
    `SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY created_at ASC LIMIT 50`
  );

  let processed = 0;
  let errors = 0;

  for (const item of pendingItems) {
    try {
      await db.runAsync(`UPDATE sync_queue SET status = 'syncing' WHERE id = ?`, [item.id]);
      const data = JSON.parse(item.payload);

      let success = false;
      if (item.operation === 'INSERT') {
        const { error } = await supabase.from(item.table_name).upsert(data);
        if (!error) success = true;
        else throw error;
      } else if (item.operation === 'UPDATE') {
        const { error } = await supabase.from(item.table_name).update(data).eq('id', item.record_id);
        if (!error) success = true;
        else throw error;
      } else if (item.operation === 'DELETE') {
        const { error } = await supabase.from(item.table_name).delete().eq('id', item.record_id);
        if (!error) success = true;
        else throw error;
      }

      if (success) {
        await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, [item.id]);
        processed++;
      }
    } catch (err: any) {
      errors++;
      await db.runAsync(
        `UPDATE sync_queue 
         SET status = 'pending', retry_count = retry_count + 1, error_message = ? 
         WHERE id = ?`,
        [err?.message || 'Sync failed', item.id]
      );
    }
  }

  return { processed, errors };
}

export async function getPendingSyncCount(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT count(*) as count FROM sync_queue WHERE status = 'pending'`
  );
  return row?.count || 0;
}
