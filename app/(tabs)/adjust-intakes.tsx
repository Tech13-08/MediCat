import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medicine, MedicineIntake } from '../../types/medicine';

export default function AdjustIntakesScreen() {
  const { medicineId } = useLocalSearchParams<{ medicineId: string }>();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [intakes, setIntakes] = useState<MedicineIntake[]>([]);
  const [todayIntakes, setTodayIntakes] = useState<MedicineIntake[]>([]);

  useEffect(() => {
    loadData();
  }, [medicineId]);

  const loadData = async () => {
    try {
      // Load medicine
      const storedMedicines = await AsyncStorage.getItem('medicines');
      if (storedMedicines) {
        const medicines: Medicine[] = JSON.parse(storedMedicines);
        const foundMedicine = medicines.find(med => med.id === medicineId);
        if (foundMedicine) {
          setMedicine(foundMedicine);
        }
      }

      // Load intakes
      const intakesKey = `intakes_${medicineId}`;
      const storedIntakes = await AsyncStorage.getItem(intakesKey);
      if (storedIntakes) {
        const allIntakes: MedicineIntake[] = JSON.parse(storedIntakes);
        setIntakes(allIntakes);
        
        const today = new Date().toDateString();
        const todaysIntakes = allIntakes.filter(intake => intake.date === today);
        setTodayIntakes(todaysIntakes);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const addIntake = async (scheduleTime: string) => {
    try {
      const today = new Date().toDateString();
      const newIntake: MedicineIntake = {
        id: Date.now().toString(),
        medicineId: medicineId!,
        scheduledTime: scheduleTime,
        takenAt: new Date().toISOString(),
        date: today,
      };

      const updatedIntakes = [...intakes, newIntake];
      const intakesKey = `intakes_${medicineId}`;
      await AsyncStorage.setItem(intakesKey, JSON.stringify(updatedIntakes));
      
      setIntakes(updatedIntakes);
      const todaysIntakes = updatedIntakes.filter(intake => intake.date === today);
      setTodayIntakes(todaysIntakes);
    } catch (error) {
      console.error('Error adding intake:', error);
      Alert.alert('Error', 'Failed to add intake');
    }
  };

  const removeIntake = async (intakeId: string) => {
    try {
      const updatedIntakes = intakes.filter(intake => intake.id !== intakeId);
      const intakesKey = `intakes_${medicineId}`;
      await AsyncStorage.setItem(intakesKey, JSON.stringify(updatedIntakes));
      
      setIntakes(updatedIntakes);
      const today = new Date().toDateString();
      const todaysIntakes = updatedIntakes.filter(intake => intake.date === today);
      setTodayIntakes(todaysIntakes);
    } catch (error) {
      console.error('Error removing intake:', error);
      Alert.alert('Error', 'Failed to remove intake');
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (!medicine) {
    return (
      <LinearGradient colors={['#10B981', '#059669']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#10B981', '#059669']} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push({ pathname: '/(tabs)/medicines', params: { medicineId } })}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Adjust Intakes</Text>
          <Text style={styles.subtitle}>
            {medicine.emoji} {medicine.name}
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Progress</Text>
            <Text style={styles.progressText}>
              {todayIntakes.length} of {medicine.scheduleTimes.length} doses taken
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Missed Dose</Text>
            <Text style={styles.sectionSubtitle}>
              Tap a scheduled time to mark it as taken
            </Text>
            {medicine.scheduleTimes.map((scheduleTime) => {
              const alreadyTaken = todayIntakes.some(
                intake => intake.scheduledTime === scheduleTime
              );
              
              return (
                <TouchableOpacity
                  key={scheduleTime}
                  style={[
                    styles.scheduleButton,
                    alreadyTaken && styles.takenScheduleButton,
                  ]}
                  onPress={() => !alreadyTaken && addIntake(scheduleTime)}
                  disabled={alreadyTaken}
                >
                  <Text style={[
                    styles.scheduleButtonText,
                    alreadyTaken && styles.takenScheduleButtonText,
                  ]}>
                    {formatTime(scheduleTime)} {alreadyTaken ? '✓' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {todayIntakes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Remove Accidental Doses</Text>
              <Text style={styles.sectionSubtitle}>
                Tap to remove if taken by mistake
              </Text>
              {todayIntakes.map((intake) => (
                <View key={intake.id} style={styles.intakeItem}>
                  <View style={styles.intakeInfo}>
                    <Text style={styles.intakeTime}>
                      {formatTime(intake.scheduledTime)}
                    </Text>
                    <Text style={styles.intakeTaken}>
                      Taken at {formatDateTime(intake.takenAt)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeIntake(intake.id)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#D1FAE5',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#D1FAE5',
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  scheduleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  takenScheduleButton: {
    backgroundColor: '#10B981',
  },
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  takenScheduleButtonText: {
    color: '#ffffff',
  },
  intakeItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  intakeInfo: {
    flex: 1,
  },
  intakeTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  intakeTaken: {
    fontSize: 12,
    color: '#6B7280',
  },
  removeButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});