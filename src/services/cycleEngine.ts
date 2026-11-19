import {
  addDays,
  differenceInDays,
  format,
  parseISO,
  startOfDay,
  subDays,
} from 'date-fns';

export interface CycleRecord {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  cycleLength?: number; // In days
  periodLength?: number; // In days
}

export type MenstrualPhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface PhaseInfo {
  phase: MenstrualPhase;
  phaseName: string;
  cycleDay: number;
  description: string;
  color: string;
  tip: string;
  // Enhanced clinical phase metrics
  phaseProgress: number; // 0.0 to 1.0 progress through current phase
  cycleProgress: number; // 0.0 to 1.0 progress through full cycle
  daysRemainingInPhase: number;
  conceptionProbability: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Peak';
  hormoneSummary: string;
  energyForecast: string;
}

export interface PredictionResult {
  nextPeriodStartDate: string;
  nextPeriodEndDate: string;
  ovulationDate: string;
  peakFertilityDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  daysUntilNextPeriod: number;
  confidenceScore: number; // 0 to 100
  confidenceLabel: 'High' | 'Moderate' | 'Initial Estimate';
  averageCycleLength: number;
  averagePeriodLength: number;
  medianCycleLength: number;
  isIrregular: boolean;
  standardDeviation: number;
  // Overdue handling
  isOverdue: boolean;
  daysOverdue: number;
  predictedRange: {
    minDays: number;
    maxDays: number;
    earliestStartDate: string;
    latestStartDate: string;
  };
}

export interface FutureCyclePrediction {
  cycleNumber: number;
  startDate: string;
  endDate: string;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  confidenceScore: number;
  predictedRange: {
    earliest: string;
    latest: string;
  };
}

export const MEDICAL_DISCLAIMER =
  'All fertility and ovulation predictions are biological estimates and must NEVER be used as contraception or medical diagnosis.';

/**
 * Filter out extreme anomalies / outliers using a modified Hampel / IQR boundary.
 * Normal human cycles according to FIGO guidelines range between 21 and 45 days.
 */
function filterOutliers(lengths: number[]): number[] {
  if (lengths.length < 4) {
    return lengths.filter((l) => l >= 18 && l <= 55);
  }

  const sorted = [...lengths].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;

  // Mild outlier boundaries (1.75 * IQR to allow natural variance while filtering true freak anomalies)
  const lowerBound = Math.max(18, q1 - 1.75 * iqr);
  const upperBound = Math.min(55, q3 + 1.75 * iqr);

  const filtered = lengths.filter((l) => l >= lowerBound && l <= upperBound);
  return filtered.length > 0 ? filtered : lengths;
}

/**
 * Calculates average cycle length and period length using exponential recency weighting
 * and robust statistical estimators (Mean, Median, Standard Deviation, Variation).
 */
export function calculateCycleAverages(cycles: CycleRecord[]): {
  averageCycleLength: number;
  averagePeriodLength: number;
  medianCycleLength: number;
  shortestCycle: number;
  longestCycle: number;
  cycleVariation: number;
  isIrregular: boolean;
  standardDeviation: number;
} {
  // Chronological sort: oldest to newest
  const sorted = [...cycles].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const rawCycleLengths: number[] = [];
  const rawPeriodLengths: number[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];

    // Period bleeding length
    if (current.periodLength && current.periodLength >= 2 && current.periodLength <= 12) {
      rawPeriodLengths.push(current.periodLength);
    } else if (current.endDate) {
      const pLen = differenceInDays(parseISO(current.endDate), parseISO(current.startDate)) + 1;
      if (pLen >= 2 && pLen <= 12) {
        rawPeriodLengths.push(pLen);
      }
    }

    // Cycle length: from this cycle start to next cycle start
    if (i < sorted.length - 1) {
      const next = sorted[i + 1];
      const cLen = differenceInDays(parseISO(next.startDate), parseISO(current.startDate));
      if (cLen >= 18 && cLen <= 55) {
        rawCycleLengths.push(cLen);
      }
    } else if (current.cycleLength && current.cycleLength >= 18 && current.cycleLength <= 55) {
      rawCycleLengths.push(current.cycleLength);
    }
  }

  // Fallbacks if insufficient data
  if (rawCycleLengths.length === 0) {
    const fallbackPeriod =
      rawPeriodLengths.length > 0
        ? Math.round(rawPeriodLengths[rawPeriodLengths.length - 1])
        : 5;
    return {
      averageCycleLength: 28,
      averagePeriodLength: fallbackPeriod,
      medianCycleLength: 28,
      shortestCycle: 28,
      longestCycle: 28,
      cycleVariation: 0,
      isIrregular: false,
      standardDeviation: 0,
    };
  }

  // Filter outlier noise to keep prediction accurate
  const validCycleLengths = filterOutliers(rawCycleLengths);
  const n = validCycleLengths.length;

  // Calculate Median
  const sortedLengths = [...validCycleLengths].sort((a, b) => a - b);
  const medianCycleLength =
    n % 2 === 1
      ? sortedLengths[Math.floor(n / 2)]
      : Math.round((sortedLengths[n / 2 - 1] + sortedLengths[n / 2]) / 2);

  const shortestCycle = sortedLengths[0];
  const longestCycle = sortedLengths[sortedLengths.length - 1];
  const cycleVariation = longestCycle - shortestCycle;

  // Exponential Recency Weighted Average
  // Most recent cycles receive exponential priority to adapt to body rhythm shifts
  let totalWeight = 0;
  let weightedSum = 0;

  for (let i = 0; i < n; i++) {
    // Weight scales from 1.0 up to ~2.2 for newest data
    const weight = 1 + (i / Math.max(1, n - 1));
    weightedSum += validCycleLengths[i] * weight;
    totalWeight += weight;
  }

  const avgCycle = Math.round(weightedSum / totalWeight);

  // Period length weighted average
  const validPeriodLengths = rawPeriodLengths.filter((p) => p >= 2 && p <= 10);
  const avgPeriod =
    validPeriodLengths.length > 0
      ? Math.round(validPeriodLengths.reduce((a, b) => a + b, 0) / validPeriodLengths.length)
      : 5;

  // Standard deviation calculation
  const mean = validCycleLengths.reduce((a, b) => a + b, 0) / validCycleLengths.length;
  const variance =
    validCycleLengths.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    validCycleLengths.length;
  const standardDeviation = Math.sqrt(variance);

  // FIGO definition: standard deviation > 7 or variation > 9 indicates cycle irregularity
  const isIrregular = standardDeviation > 7 || (n >= 3 && cycleVariation > 9);

  return {
    averageCycleLength: avgCycle,
    averagePeriodLength: avgPeriod,
    medianCycleLength,
    shortestCycle,
    longestCycle,
    cycleVariation,
    isIrregular,
    standardDeviation: Math.round(standardDeviation * 10) / 10,
  };
}

/**
 * Calculates current cycle status, next period predictions, confidence level,
 * clinical fertile window, and overdue detection.
 */
export function calculateCyclePrediction(
  cycles: CycleRecord[],
  targetDate: Date = new Date()
): PredictionResult {
  const {
    averageCycleLength,
    averagePeriodLength,
    medianCycleLength,
    isIrregular,
    standardDeviation,
  } = calculateCycleAverages(cycles);

  // Sort descending: newest to oldest
  const sorted = [...cycles].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  const lastCycle = sorted[0];

  const lastStartDate = lastCycle ? parseISO(lastCycle.startDate) : startOfDay(targetDate);
  const nextPeriodStart = addDays(lastStartDate, averageCycleLength);
  const nextPeriodEnd = addDays(nextPeriodStart, averagePeriodLength - 1);

  // Biological luteal phase: clinical average is 14 days
  const lutealLength = 14;
  const ovulationDate = addDays(nextPeriodStart, -lutealLength);

  // Fertile window spans 5 days prior to ovulation through ovulation day (6 days biological window)
  const fertileStart = addDays(ovulationDate, -5);
  const fertileEnd = ovulationDate;
  const peakFertilityDate = format(ovulationDate, 'yyyy-MM-dd');

  const today = startOfDay(targetDate);
  const daysUntilNextPeriod = differenceInDays(nextPeriodStart, today);

  // Overdue status: when today has passed expected start and period is not logged yet
  const isOverdue = daysUntilNextPeriod < 0;
  const daysOverdue = isOverdue ? Math.abs(daysUntilNextPeriod) : 0;

  // Dynamic predicted window range (e.g. 28 ± stdDev)
  const rangeMargin = Math.max(1, Math.round(standardDeviation || 1.5));
  const earliestStart = subDays(nextPeriodStart, rangeMargin);
  const latestStart = addDays(nextPeriodStart, rangeMargin);

  // Confidence scoring:
  // 0 cycles: 30% baseline
  // 1 cycle: 55%
  // 2 cycles: 72%
  // 3-5 cycles: 85%
  // 6+ cycles: 95%
  let confidence = 30;
  if (cycles.length === 1) confidence = 55;
  else if (cycles.length === 2) confidence = 72;
  else if (cycles.length >= 3 && cycles.length < 6) confidence = 85;
  else if (cycles.length >= 6) confidence = 95;

  if (isIrregular) {
    confidence = Math.max(35, confidence - 20);
  }

  let confidenceLabel: 'High' | 'Moderate' | 'Initial Estimate' = 'Initial Estimate';
  if (confidence >= 80) confidenceLabel = 'High';
  else if (confidence >= 60) confidenceLabel = 'Moderate';

  return {
    nextPeriodStartDate: format(nextPeriodStart, 'yyyy-MM-dd'),
    nextPeriodEndDate: format(nextPeriodEnd, 'yyyy-MM-dd'),
    ovulationDate: format(ovulationDate, 'yyyy-MM-dd'),
    peakFertilityDate,
    fertileWindowStart: format(fertileStart, 'yyyy-MM-dd'),
    fertileWindowEnd: format(fertileEnd, 'yyyy-MM-dd'),
    daysUntilNextPeriod,
    confidenceScore: confidence,
    confidenceLabel,
    averageCycleLength,
    averagePeriodLength,
    medianCycleLength,
    isIrregular,
    standardDeviation,
    isOverdue,
    daysOverdue,
    predictedRange: {
      minDays: Math.max(20, averageCycleLength - rangeMargin),
      maxDays: Math.min(50, averageCycleLength + rangeMargin),
      earliestStartDate: format(earliestStart, 'yyyy-MM-dd'),
      latestStartDate: format(latestStart, 'yyyy-MM-dd'),
    },
  };
}

/**
 * Determines the current menstrual phase for a given date with rich hormonal and energy profiling.
 */
export function getCurrentPhase(
  cycles: CycleRecord[],
  targetDate: Date = new Date()
): PhaseInfo {
  const sorted = [...cycles].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  const { averageCycleLength, averagePeriodLength } = calculateCycleAverages(cycles);

  if (sorted.length === 0) {
    return {
      phase: 'follicular',
      phaseName: 'Follicular Phase',
      cycleDay: 1,
      description: 'Your body is preparing for a new cycle. Estrogen begins its rise.',
      color: '#FFAE9E',
      tip: 'Stay hydrated and nourish yourself with gentle whole foods! 🌸',
      phaseProgress: 0.1,
      cycleProgress: 0.05,
      daysRemainingInPhase: 12,
      conceptionProbability: 'Low',
      hormoneSummary: 'Estrogen: Rising • Progesterone: Low • LH: Baseline',
      energyForecast: 'Fresh, renewing energy. Great for planning and creative inspiration! ✨',
    };
  }

  const lastStartDate = parseISO(sorted[0].startDate);
  const cycleDay = differenceInDays(startOfDay(targetDate), lastStartDate) + 1;
  const cycleProgress = Math.min(1.0, Math.max(0.02, cycleDay / averageCycleLength));

  const periodLength = sorted[0].periodLength || averagePeriodLength;
  const ovulationDay = Math.max(periodLength + 2, averageCycleLength - 14);
  const fertileStartDay = Math.max(periodLength + 1, ovulationDay - 5);

  // 1. Menstrual Phase (Days 1 to periodLength)
  if (cycleDay <= periodLength && cycleDay >= 1) {
    const phaseProgress = Math.min(1.0, cycleDay / Math.max(1, periodLength));
    return {
      phase: 'menstrual',
      phaseName: 'Menstrual Phase',
      cycleDay,
      description: 'Your period is here. Estrogen and progesterone are at their baseline.',
      color: '#FF4FA3',
      tip: 'Rest up, stay cozy with your heating pad, and take it easy, Princess! 💗',
      phaseProgress,
      cycleProgress,
      daysRemainingInPhase: Math.max(0, periodLength - cycleDay),
      conceptionProbability: 'Very Low',
      hormoneSummary: 'Estrogen: Low • Progesterone: Low • Uterine shedding',
      energyForecast: 'Introspective, resting energy. Prioritize warm tea, blankets & slow moments. 🧸',
    };
  }

  // 2. Follicular Phase (Post-period until fertile window)
  if (cycleDay < fertileStartDay) {
    const follicularTotalDays = Math.max(1, fertileStartDay - periodLength - 1);
    const dayInPhase = cycleDay - periodLength;
    const phaseProgress = Math.min(1.0, Math.max(0, dayInPhase / follicularTotalDays));
    return {
      phase: 'follicular',
      phaseName: 'Follicular Phase',
      cycleDay,
      description: 'FSH and estrogen are rising, boosting your energy, focus, and skin radiance.',
      color: '#FFAE9E',
      tip: 'A fresh start! Great time for creative tasks, movement, and socializing! ✨',
      phaseProgress,
      cycleProgress,
      daysRemainingInPhase: Math.max(0, fertileStartDay - cycleDay),
      conceptionProbability: 'Medium',
      hormoneSummary: 'Estrogen: Surging • FSH: Active follicle development',
      energyForecast: 'High mental clarity, vibrant optimism, and natural creative drive! 🌸',
    };
  }

  // 3. Ovulation Phase (Fertile window & ovulation day)
  if (cycleDay >= fertileStartDay && cycleDay <= ovulationDay + 1) {
    const fertileDuration = Math.max(1, ovulationDay + 1 - fertileStartDay + 1);
    const dayInPhase = cycleDay - fertileStartDay + 1;
    const phaseProgress = Math.min(1.0, Math.max(0, dayInPhase / fertileDuration));
    const isPeakOvulation = cycleDay === ovulationDay;

    return {
      phase: 'ovulation',
      phaseName: 'Ovulation Phase',
      cycleDay,
      description: isPeakOvulation
        ? 'Peak ovulation! LH surges as a mature egg is released. Peak vitality & confidence!'
        : 'Fertile window: Estrogen peaks and cervical fluid becomes nutrient-rich and clear.',
      color: '#9B51E0',
      tip: 'You are radiant and magnetic today! Enjoy your natural vitality boost! 👑',
      phaseProgress,
      cycleProgress,
      daysRemainingInPhase: Math.max(0, ovulationDay + 1 - cycleDay),
      conceptionProbability: isPeakOvulation ? 'Peak' : 'High',
      hormoneSummary: 'LH: Peak Surge • Estrogen: Maximum • Ovum release',
      energyForecast: 'Peak communication, magnetic charisma, and highest physical endurance! 💖',
    };
  }

  // 4. Luteal Phase (Post-ovulation until next period)
  const lutealTotalDays = Math.max(1, averageCycleLength - ovulationDay - 1);
  const dayInLuteal = cycleDay - ovulationDay - 1;
  const phaseProgress = Math.min(1.0, Math.max(0, dayInLuteal / lutealTotalDays));
  const isAwaitingPeriod = cycleDay >= averageCycleLength;

  return {
    phase: 'luteal',
    phaseName: isAwaitingPeriod ? 'Late Luteal / Awaiting Period' : 'Luteal Phase',
    cycleDay,
    description: isAwaitingPeriod
      ? 'Your cycle is concluding. Progesterone is declining, signaling your period is very near.'
      : 'Progesterone takes the lead. Calmer, reflective energy and nesting mood.',
    color: '#C8A2FF',
    tip: isAwaitingPeriod
      ? 'Period is expected any moment! Keep your cozy supplies nearby and pamper yourself. 🧸'
      : 'Pamper yourself, prioritize magnesium-rich snacks, and sleep deeply! 🧸',
    phaseProgress,
    cycleProgress,
    daysRemainingInPhase: Math.max(0, averageCycleLength - cycleDay),
    conceptionProbability: 'Very Low',
    hormoneSummary: 'Progesterone: Dominant • Body temperature elevated (~0.3°C–0.5°C)',
    energyForecast: 'Cozy nesting mode, attention to detail, and a desire for peaceful relaxation. ☕',
  };
}

/**
 * Predicts up to 12 future cycles for calendar forward-projections with confidence decay
 * and projected date margins.
 */
export function predictFutureCycles(
  cycles: CycleRecord[],
  monthsCount: number = 12
): FutureCyclePrediction[] {
  const { averageCycleLength, averagePeriodLength, standardDeviation } = calculateCycleAverages(cycles);
  const sorted = [...cycles].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  let baseDate = sorted.length > 0 ? parseISO(sorted[0].startDate) : new Date();
  const predictions: FutureCyclePrediction[] = [];

  for (let i = 1; i <= monthsCount; i++) {
    const cycleStart = addDays(baseDate, averageCycleLength * i);
    const cycleEnd = addDays(cycleStart, averagePeriodLength - 1);
    const ovulation = addDays(cycleStart, averageCycleLength - 14);
    const fertileStart = addDays(ovulation, -5);
    const fertileEnd = ovulation;

    // Cumulative date variation expands into the future
    const margin = Math.round((standardDeviation || 1.5) * Math.sqrt(i));
    const earliest = format(subDays(cycleStart, margin), 'yyyy-MM-dd');
    const latest = format(addDays(cycleStart, margin), 'yyyy-MM-dd');

    // Confidence decays gradually with each future cycle
    const baseConfidence = cycles.length >= 3 ? 85 : 60;
    const decayedConfidence = Math.max(25, Math.round(baseConfidence - i * 3.5));

    predictions.push({
      cycleNumber: i,
      startDate: format(cycleStart, 'yyyy-MM-dd'),
      endDate: format(cycleEnd, 'yyyy-MM-dd'),
      ovulationDate: format(ovulation, 'yyyy-MM-dd'),
      fertileWindowStart: format(fertileStart, 'yyyy-MM-dd'),
      fertileWindowEnd: format(fertileEnd, 'yyyy-MM-dd'),
      confidenceScore: decayedConfidence,
      predictedRange: {
        earliest,
        latest,
      },
    });
  }

  return predictions;
}

/**
 * Enhanced PMS and Cramps pattern predictor based on hormonal phase timing.
 */
export function predictPMSAndCramps(
  cycles: CycleRecord[],
  targetDate: Date = new Date()
): {
  pmsRisk: 'Low' | 'Moderate' | 'High';
  crampsLikelihood: 'Mild' | 'Moderate' | 'Severe' | 'Low';
  advice: string;
  pmsWindowActive: boolean;
} {
  const prediction = calculateCyclePrediction(cycles, targetDate);
  const daysUntil = prediction.daysUntilNextPeriod;

  // Active PMS Window: 1 to 4 days prior to period
  if (daysUntil <= 4 && daysUntil >= 1) {
    return {
      pmsRisk: 'High',
      crampsLikelihood: 'Moderate',
      advice:
        'You may feel emotional sensitivity or mild pre-menstrual cramps over the next 1–4 days. Warm chamomile tea, magnesium, and gentle hugs are recommended! 💕',
      pmsWindowActive: true,
    };
  }

  // Active Menstruation Days: Peak cramping window
  if (daysUntil <= 0 && daysUntil >= -prediction.averagePeriodLength) {
    return {
      pmsRisk: 'Low',
      crampsLikelihood: 'Severe',
      advice:
        'Days 1–2 of period: Uterine prostaglandins are at peak activity. Keep your heating pad warm, drink raspberry leaf tea, and take it slow today. 🧸',
      pmsWindowActive: false,
    };
  }

  // Follicular or Ovulation: Calmer hormonal state
  return {
    pmsRisk: 'Low',
    crampsLikelihood: 'Low',
    advice: 'Minimal PMS risk right now. Your hormones are balanced and calm! 🌸',
    pmsWindowActive: false,
  };
}
