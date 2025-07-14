import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medicine, MedicineIntake, RelevantMedicine } from '../types/medicine';

export async function getCurrentRelevantMedicines(
  medicines: Medicine[],
  currentTime: Date
): Promise<RelevantMedicine[]> {
  const relevantMedicines: RelevantMedicine[] = [];
  
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentDayName = currentTime.toLocaleDateString('en-US', { weekday: 'short' });
  const today = currentTime.toDateString();

  for (const medicine of medicines) {
    // Check if medicine should be taken today based on days of week
    if (!medicine.days.includes(currentDayName)) {
      continue;
    }

    // Load intake history for this medicine
    const intakesKey = `intakes_${medicine.id}`;
    const existingIntakes = await AsyncStorage.getItem(intakesKey);
    const intakes: MedicineIntake[] = existingIntakes ? JSON.parse(existingIntakes) : [];
    const todayIntakes = intakes.filter(intake => intake.date === today);

    // Check each scheduled time for this medicine
    for (const scheduleTime of medicine.scheduleTimes) {
      const [scheduleHour, scheduleMinute] = scheduleTime.split(':').map(Number);
      
      // Check if this specific time has already been taken today
      const alreadyTaken = todayIntakes.some(
        intake => intake.scheduledTime === scheduleTime
      );
      
      if (alreadyTaken) {
        continue;
      }

      // Show medicine if:
      // 1. Current time is within 1 hour before the scheduled time
      // 2. Current time is within 2 hours after the scheduled time
      const scheduledMinutes = scheduleHour * 60 + scheduleMinute;
      const currentMinutes = currentHour * 60 + currentMinute;
      
      const minutesDifference = scheduledMinutes - currentMinutes;
      
      // Show if within 1 hour before or 2 hours after scheduled time
      if (minutesDifference <= 60 && minutesDifference >= -120) {
        relevantMedicines.push({
          medicine,
          scheduleTime,
        });
      }
    }
  }

  // Sort by scheduled time (earliest first)
  relevantMedicines.sort((a, b) => {
    const [aHour, aMinute] = a.scheduleTime.split(':').map(Number);
    const [bHour, bMinute] = b.scheduleTime.split(':').map(Number);
    const aMinutes = aHour * 60 + aMinute;
    const bMinutes = bHour * 60 + bMinute;
    return aMinutes - bMinutes;
  });

  return relevantMedicines;
}

export function getMedicineProgress(
  medicine: Medicine,
  intakes: MedicineIntake[],
  date: Date
): { taken: number; total: number } {
  const dateString = date.toDateString();
  const todayIntakes = intakes.filter(intake => intake.date === dateString);
  
  return {
    taken: todayIntakes.length,
    total: medicine.scheduleTimes.length,
  };
}