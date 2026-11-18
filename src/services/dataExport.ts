import { getDatabase } from '../db/sqlite';

export async function exportDataAsCSV(): Promise<string> {
  const db = await getDatabase();
  const cycles = await db.getAllAsync<any>(
    'SELECT start_date, end_date, cycle_length, period_length, is_irregular, notes FROM menstrual_cycles ORDER BY start_date DESC'
  );

  let csv = 'Start Date,End Date,Cycle Length (Days),Period Length (Days),Is Irregular,Notes\n';
  for (const c of cycles) {
    csv += `"${c.start_date}","${c.end_date || ''}",${c.cycle_length || ''},${c.period_length || ''},${c.is_irregular ? 'Yes' : 'No'},"${(c.notes || '').replace(/"/g, '""')}"\n`;
  }

  const logs = await db.getAllAsync<any>(
    'SELECT date, water_intake_ml, sleep_hours, sleep_quality, energy_level, stress_level, bbt_celsius, notes FROM daily_logs ORDER BY date DESC'
  );

  csv += '\nDaily Logs:\n';
  csv += 'Date,Water (ml),Sleep Hours,Sleep Quality (1-5),Energy (1-10),Stress (1-10),BBT (°C),Notes\n';
  for (const l of logs) {
    csv += `"${l.date}",${l.water_intake_ml || 0},${l.sleep_hours || ''},${l.sleep_quality || ''},${l.energy_level || ''},${l.stress_level || ''},${l.bbt_celsius || ''},"${(l.notes || '').replace(/"/g, '""')}"\n`;
  }

  return csv;
}

export async function exportDataAsJSON(): Promise<string> {
  const db = await getDatabase();
  const cycles = await db.getAllAsync('SELECT * FROM menstrual_cycles');
  const periodDays = await db.getAllAsync('SELECT * FROM period_days');
  const dailyLogs = await db.getAllAsync('SELECT * FROM daily_logs');
  const symptoms = await db.getAllAsync('SELECT * FROM symptoms');
  const moods = await db.getAllAsync('SELECT * FROM mood_entries');
  const journal = await db.getAllAsync('SELECT * FROM journal_entries');
  const memories = await db.getAllAsync('SELECT * FROM memories');

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    app: 'Barbie Period Tracker',
    data: {
      cycles,
      periodDays,
      dailyLogs,
      symptoms,
      moods,
      journal,
      memories,
    },
  };

  return JSON.stringify(exportPayload, null, 2);
}

export async function deleteAllUserData(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    DELETE FROM menstrual_cycles;
    DELETE FROM period_days;
    DELETE FROM daily_logs;
    DELETE FROM symptoms;
    DELETE FROM custom_symptoms;
    DELETE FROM mood_entries;
    DELETE FROM journal_entries;
    DELETE FROM cycle_predictions;
    DELETE FROM medication_logs;
    DELETE FROM reminders;
    DELETE FROM love_messages;
    DELETE FROM care_checklists WHERE is_custom = 1;
    DELETE FROM memories;
    DELETE FROM sync_queue;
  `);
}
