export interface Medicine {
  id: string;
  name: string;
  emoji: string;
  scheduleTimes: string[]; // Array of times in "HH:MM" format
  days: string[]; // Array of day abbreviations: Mon, Tue, Wed, Thu, Fri, Sat, Sun
  repeatWeeks: number; // Repeat every N weeks
  createdAt: string;
}

export interface MedicineIntake {
  id: string;
  medicineId: string;
  scheduledTime: string;
  takenAt: string;
  date: string; // Date string for the day the medicine was taken
}

export interface RelevantMedicine {
  medicine: Medicine;
  scheduleTime: string;
}