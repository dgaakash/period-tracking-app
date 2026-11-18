import { addDays, differenceInDays, format, parseISO, isWithinInterval, startOfDay } from 'date-fns';

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
}

export interface PredictionResult {
  nextPeriodStartDate: string;
  nextPeriodEndDate: string;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  daysUntilNextPeriod: number;
  confidenceScore: number; // 0 to 100
  confidenceLabel: 'High' | 'Moderate' | 'Initial Estimate';
  averageCycleLength: number;
  averagePeriodLength: number;
  isIrregular: boolean;
}

export interface FutureCyclePrediction {
  cycleNumber: number;
  startDate: string;
  endDate: string;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  confidenceScore: number;
}

export const MEDICAL_DISCLAIMER =
  'All fertility and ovulation predictions are biological estimates and must NEVER be used as contraception or medical diagnosis.';

/**
 * Calculates average cycle length and period length using weighted moving average.
 * Recent cycles receive higher weights.
 */
export function calculateCycleAverages(cycles: CycleRecord[]): {
  averageCycleLength: number;
  averagePeriodLength: number;
  isIrregular: boolean;
  standardDeviation: number;
} {
  // Sort cycles chronologically by start date
  const sorted = [...cycles].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const validCycleLengths: number[] = [];
  const validPeriodLengths: number[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];

    // Period length
    if (current.periodLength && current.periodLength >= 2 && current.periodLength <= 12) {
      validPeriodLengths.push(current.periodLength);
    } else if (current.endDate) {
      const pLen = differenceInDays(parseISO(current.endDate), parseISO(current.startDate)) + 1;
      if (pLen >= 2 && pLen <= 12) {
        validPeriodLengths.push(pLen);
      }
    }

    // Cycle length: from this cycle start to next cycle start
    if (i < sorted.length - 1) {
      const next = sorted[i + 1];
      const cLen = differenceInDays(parseISO(next.startDate), parseISO(current.startDate));
      if (cLen >= 18 && cLen <= 55) {
        validCycleLengths.push(cLen);
      }
    } else if (current.cycleLength && current.cycleLength >= 18 && current.cycleLength <= 55) {
      validCycleLengths.push(current.cycleLength);
    }
  }

  // Fallbacks if not enough data
  if (validCycleLengths.length === 0) {
    return {
      averageCycleLength: 28,
      averagePeriodLength: validPeriodLengths.length > 0 ? Math.round(validPeriodLengths[validPeriodLengths.length - 1]) : 5,
      isIrregular: false,
      standardDeviation: 0,
    };
  }

  // Weighted moving average for cycle lengths (most recent get higher weights)
  let totalWeight = 0;
  let weightedSum = 0;
  const n = validCycleLengths.length;

  for (let i = 0; i < n; i++) {
    // Linear ramp weights from 1 to 2
    const weight = 1 + (i / Math.max(1, n - 1));
    weightedSum += validCycleLengths[i] * weight;
    totalWeight += weight;
  }

  const avgCycle = Math.round(weightedSum / totalWeight);

  // Period length average
  const avgPeriod = validPeriodLengths.length > 0
    ? Math.round(validPeriodLengths.reduce((a, b) => a + b, 0) / validPeriodLengths.length)
    : 5;

  // Standard deviation calculation to detect irregularity
  const mean = validCycleLengths.reduce((a, b) => a + b, 0) / validCycleLengths.length;
  const variance = validCycleLengths.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validCycleLengths.length;
  const standardDeviation = Math.sqrt(variance);
  const isIrregular = standardDeviation > 7;

  return {
    averageCycleLength: avgCycle,
    averagePeriodLength: avgPeriod,
    isIrregular,
    standardDeviation: Math.round(standardDeviation * 10) / 10,
  };
}

/**
 * Calculates current cycle status, next period predictions, and confidence level.
 */
export function calculateCyclePrediction(
  cycles: CycleRecord[],
  targetDate: Date = new Date()
): PredictionResult {
  const { averageCycleLength, averagePeriodLength, isIrregular, standardDeviation } = calculateCycleAverages(cycles);

  const sorted = [...cycles].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  const lastCycle = sorted[0];

  // Default baseline if no cycle logged yet
  const lastStartDate = lastCycle ? parseISO(lastCycle.startDate) : startOfDay(targetDate);
  const nextPeriodStart = addDays(lastStartDate, averageCycleLength);
  const nextPeriodEnd = addDays(nextPeriodStart, averagePeriodLength - 1);

  // Ovulation typically occurs ~14 days before next period (Luteal phase ~14 days)
  const lutealLength = 14;
  const ovulationDate = addDays(nextPeriodStart, -lutealLength);

  // Fertile window spans 5 days prior to ovulation through ovulation day (6 days total)
  const fertileStart = addDays(ovulationDate, -5);
  const fertileEnd = ovulationDate;

  const daysUntilNextPeriod = differenceInDays(nextPeriodStart, startOfDay(targetDate));

  // Confidence scoring:
  // 0 cycles: 30% baseline
  // 1 cycle: 50%
  // 2 cycles: 70%
  // 3-5 cycles: 85% - irregularity penalty
  // 6+ cycles: 95% - irregularity penalty
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
    fertileWindowStart: format(fertileStart, 'yyyy-MM-dd'),
    fertileWindowEnd: format(fertileEnd, 'yyyy-MM-dd'),
    daysUntilNextPeriod,
    confidenceScore: confidence,
    confidenceLabel,
    averageCycleLength,
    averagePeriodLength,
    isIrregular,
  };
}

/**
 * Determines current menstrual phase for a given date.
 */
export function getCurrentPhase(
  cycles: CycleRecord[],
  targetDate: Date = new Date()
): PhaseInfo {
  const sorted = [...cycles].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  const { averageCycleLength, averagePeriodLength } = calculateCycleAverages(cycles);

  if (sorted.length === 0) {
    return {
      phase: 'follicular',
      phaseName: 'Follicular Phase',
      cycleDay: 1,
      description: 'Your body is preparing for a new cycle.',
      color: '#FFAE9E',
      tip: 'Stay hydrated and nourish yourself with gentle whole foods! 🌸',
    };
  }

  const lastStartDate = parseISO(sorted[0].startDate);
  const cycleDay = differenceInDays(startOfDay(targetDate), lastStartDate) + 1;

  const periodLength = sorted[0].periodLength || averagePeriodLength;
  const ovulationDay = Math.max(periodLength + 2, averageCycleLength - 14);
  const fertileStartDay = Math.max(periodLength + 1, ovulationDay - 5);

  if (cycleDay <= periodLength && cycleDay >= 1) {
    return {
      phase: 'menstrual',
      phaseName: 'Menstrual Phase',
      cycleDay,
      description: 'Your period is here. Estrogen and progesterone are at their lowest.',
      color: '#FF4FA3',
      tip: 'Rest up, stay cozy with your heating pad, and take it easy, Princess! 💗',
    };
  }

  if (cycleDay < fertileStartDay) {
    return {
      phase: 'follicular',
      phaseName: 'Follicular Phase',
      cycleDay,
      description: 'FSH and estrogen are rising, boosting your energy and focus.',
      color: '#FFAE9E',
      tip: 'A fresh start! Great time for creative tasks, movement, and socializing! ✨',
    };
  }

  if (cycleDay >= fertileStartDay && cycleDay <= ovulationDay + 1) {
    return {
      phase: 'ovulation',
      phaseName: 'Ovulation Phase',
      cycleDay,
      description: 'Estrogen and LH peak as a mature egg is released. Peak energy and confidence!',
      color: '#9B51E0',
      tip: 'You are radiant and magnetic today! Enjoy the natural vitality boost! 👑',
    };
  }

  return {
    phase: 'luteal',
    phaseName: 'Luteal Phase',
    cycleDay,
    description: 'Progesterone takes the lead. Calmer, reflective energy and nesting mood.',
    color: '#C8A2FF',
    tip: 'Pamper yourself, prioritize magnesium-rich snacks, and sleep deeply! 🧸',
  };
}

/**
 * Predicts up to 12 future cycles for calendar forward-projections.
 */
export function predictFutureCycles(
  cycles: CycleRecord[],
  monthsCount: number = 12
): FutureCyclePrediction[] {
  const { averageCycleLength, averagePeriodLength } = calculateCycleAverages(cycles);
  const sorted = [...cycles].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  let baseDate = sorted.length > 0 ? parseISO(sorted[0].startDate) : new Date();
  const predictions: FutureCyclePrediction[] = [];

  for (let i = 1; i <= monthsCount; i++) {
    const cycleStart = addDays(baseDate, averageCycleLength * i);
    const cycleEnd = addDays(cycleStart, averagePeriodLength - 1);
    const ovulation = addDays(cycleStart, averageCycleLength - 14);
    const fertileStart = addDays(ovulation, -5);
    const fertileEnd = ovulation;

    // Confidence decays slightly with each further month
    const baseConfidence = cycles.length >= 3 ? 85 : 60;
    const decayedConfidence = Math.max(30, Math.round(baseConfidence - i * 3));

    predictions.push({
      cycleNumber: i,
      startDate: format(cycleStart, 'yyyy-MM-dd'),
      endDate: format(cycleEnd, 'yyyy-MM-dd'),
      ovulationDate: format(ovulation, 'yyyy-MM-dd'),
      fertileWindowStart: format(fertileStart, 'yyyy-MM-dd'),
      fertileWindowEnd: format(fertileEnd, 'yyyy-MM-dd'),
      confidenceScore: decayedConfidence,
    });
  }

  return predictions;
}

/**
 * PMS and Cramps pattern predictor based on previous cycle logs.
 */
export function predictPMSAndCramps(
  cycles: CycleRecord[],
  targetDate: Date = new Date()
): {
  pmsRisk: 'Low' | 'Moderate' | 'High';
  crampsLikelihood: 'Mild' | 'Moderate' | 'Severe' | 'Low';
  advice: string;
} {
  const prediction = calculateCyclePrediction(cycles, targetDate);
  const daysUntil = prediction.daysUntilNextPeriod;

  if (daysUntil <= 4 && daysUntil >= 1) {
    return {
      pmsRisk: 'High',
      crampsLikelihood: 'Moderate',
      advice: 'You may feel emotional sensitivity or mild cramps over the next 2-4 days. Warm tea and extra hugs are recommended! 💕',
    };
  }

  if (daysUntil <= 0 && daysUntil >= -prediction.averagePeriodLength) {
    return {
      pmsRisk: 'Low',
      crampsLikelihood: 'Severe',
      advice: 'Day 1-2 of period: Cramping intensity is typically highest. Keep your heating pad ready and take it slow. 🧸',
    };
  }

  return {
    pmsRisk: 'Low',
    crampsLikelihood: 'Low',
    advice: 'Minimal PMS risk right now. Your hormones are balanced and calm! 🌸',
  };
}
