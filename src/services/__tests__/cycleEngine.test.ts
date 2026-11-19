import {
  calculateCycleAverages,
  calculateCyclePrediction,
  getCurrentPhase,
  predictFutureCycles,
  predictPMSAndCramps,
  CycleRecord,
} from '../cycleEngine';

describe('Cycle Engine Calculations', () => {
  const regularCycles: CycleRecord[] = [
    { id: '1', startDate: '2026-01-01', endDate: '2026-01-05', cycleLength: 28, periodLength: 5 },
    { id: '2', startDate: '2026-01-29', endDate: '2026-02-02', cycleLength: 28, periodLength: 5 },
    { id: '3', startDate: '2026-02-26', endDate: '2026-03-02', cycleLength: 28, periodLength: 5 },
  ];

  it('calculates average cycle length and period length accurately for regular cycles', () => {
    const averages = calculateCycleAverages(regularCycles);
    expect(averages.averageCycleLength).toBe(28);
    expect(averages.averagePeriodLength).toBe(5);
    expect(averages.medianCycleLength).toBe(28);
    expect(averages.isIrregular).toBe(false);
  });

  it('detects irregular cycles when standard deviation is high', () => {
    const irregularCycles: CycleRecord[] = [
      { id: '1', startDate: '2026-01-01', cycleLength: 21, periodLength: 4 },
      { id: '2', startDate: '2026-01-22', cycleLength: 42, periodLength: 6 },
      { id: '3', startDate: '2026-03-05', cycleLength: 25, periodLength: 5 },
    ];
    const averages = calculateCycleAverages(irregularCycles);
    expect(averages.isIrregular).toBe(true);
    expect(averages.standardDeviation).toBeGreaterThan(7);
  });

  it('filters extreme cycle anomalies without distorting baseline average', () => {
    const cyclesWithOutlier: CycleRecord[] = [
      { id: '1', startDate: '2026-01-01', cycleLength: 28, periodLength: 5 },
      { id: '2', startDate: '2026-01-29', cycleLength: 29, periodLength: 5 },
      { id: '3', startDate: '2026-02-27', cycleLength: 28, periodLength: 5 },
      { id: '4', startDate: '2026-03-27', cycleLength: 54, periodLength: 5 }, // Extreme stress outlier
      { id: '5', startDate: '2026-05-20', cycleLength: 28, periodLength: 5 },
    ];
    const averages = calculateCycleAverages(cyclesWithOutlier);
    // Baseline should remain around 28-29 rather than skewing to 35+
    expect(averages.averageCycleLength).toBeLessThanOrEqual(30);
    expect(averages.medianCycleLength).toBe(28);
  });

  it('predicts next period start and ovulation accurately', () => {
    const targetDate = new Date('2026-03-10');
    const prediction = calculateCyclePrediction(regularCycles, targetDate);

    // Last start was 2026-02-26 + 28 days = 2026-03-26
    expect(prediction.nextPeriodStartDate).toBe('2026-03-26');
    // Ovulation is next start minus 14 days = 2026-03-12
    expect(prediction.ovulationDate).toBe('2026-03-12');
    expect(prediction.peakFertilityDate).toBe('2026-03-12');
    // Fertile window is 5 days prior to ovulation: 2026-03-07 to 2026-03-12
    expect(prediction.fertileWindowStart).toBe('2026-03-07');
    expect(prediction.fertileWindowEnd).toBe('2026-03-12');
    expect(prediction.confidenceScore).toBeGreaterThanOrEqual(80);
    expect(prediction.confidenceLabel).toBe('High');
    expect(prediction.isOverdue).toBe(false);
    expect(prediction.daysOverdue).toBe(0);
  });

  it('accurately identifies and tracks overdue periods', () => {
    // Expected next period was 2026-03-26. Target date is 2026-03-29 (3 days overdue)
    const overdueTarget = new Date('2026-03-29');
    const prediction = calculateCyclePrediction(regularCycles, overdueTarget);

    expect(prediction.isOverdue).toBe(true);
    expect(prediction.daysOverdue).toBe(3);
    expect(prediction.daysUntilNextPeriod).toBe(-3);
  });

  it('identifies correct menstrual phase with clinical progress and hormone insights', () => {
    // On Day 2 of cycle (2026-02-27), should be Menstrual Phase
    const menstrualPhase = getCurrentPhase(regularCycles, new Date('2026-02-27'));
    expect(menstrualPhase.phase).toBe('menstrual');
    expect(menstrualPhase.conceptionProbability).toBe('Very Low');
    expect(menstrualPhase.phaseProgress).toBeGreaterThan(0);

    // On Day 8 of cycle (2026-03-05), should be Follicular Phase
    const follicularPhase = getCurrentPhase(regularCycles, new Date('2026-03-05'));
    expect(follicularPhase.phase).toBe('follicular');
    expect(follicularPhase.conceptionProbability).toBe('Medium');

    // On Day 14 of cycle (2026-03-11), should be Ovulation Phase
    const ovulationPhase = getCurrentPhase(regularCycles, new Date('2026-03-11'));
    expect(ovulationPhase.phase).toBe('ovulation');
    expect(ovulationPhase.conceptionProbability).toMatch(/High|Peak/);

    // On Day 22 of cycle (2026-03-19), should be Luteal Phase
    const lutealPhase = getCurrentPhase(regularCycles, new Date('2026-03-19'));
    expect(lutealPhase.phase).toBe('luteal');
    expect(lutealPhase.conceptionProbability).toBe('Very Low');
  });

  it('handles late luteal phase gracefully when cycle exceeds expected length', () => {
    // Day 30 of cycle (2026-03-28) - 2 days past expected 28 days
    const latePhase = getCurrentPhase(regularCycles, new Date('2026-03-28'));
    expect(latePhase.phase).toBe('luteal');
    expect(latePhase.phaseName).toContain('Awaiting Period');
  });

  it('generates 12 months of future cycle predictions with decay and range', () => {
    const futureCycles = predictFutureCycles(regularCycles, 12);
    expect(futureCycles).toHaveLength(12);
    expect(futureCycles[0].cycleNumber).toBe(1);
    expect(futureCycles[11].cycleNumber).toBe(12);
    // Predictions further out should have lower confidence
    expect(futureCycles[0].confidenceScore).toBeGreaterThan(futureCycles[11].confidenceScore);
    expect(futureCycles[0].predictedRange).toBeDefined();
    expect(futureCycles[0].predictedRange.earliest).toBeDefined();
    expect(futureCycles[0].predictedRange.latest).toBeDefined();
  });

  it('evaluates PMS and Cramps risk near period start', () => {
    // 2 days before next period (2026-03-24)
    const pmsStatus = predictPMSAndCramps(regularCycles, new Date('2026-03-24'));
    expect(pmsStatus.pmsRisk).toBe('High');
    expect(pmsStatus.pmsWindowActive).toBe(true);
  });
});
