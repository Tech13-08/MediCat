import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medicine, MedicineIntake } from '../../types/medicine';
import { WelcomeScreen } from '../../components/WelcomeScreen';
import { MedicineCard } from '../../components/MedicineCard';
import { getCurrentRelevantMedicines } from '../../utils/medicineUtils';

export default function HomeScreen() {
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [relevantMedicinesState, setRelevantMedicinesState] = useState<Array<{medicine: Medicine, scheduleTime: string}>>([]);

  useEffect(() => {
    checkFirstTimeUser();
    loadMedicines();
    
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateRelevantMedicines = async () => {
      if (isFirstTime === false && medicines.length > 0) {
        const relevant = await getCurrentRelevantMedicines(medicines, currentTime);
        setRelevantMedicinesState(relevant);
      } else {
        setRelevantMedicinesState([]);
      }
    };
    
    updateRelevantMedicines();
  }, [medicines, currentTime, isFirstTime]);

  useEffect(() => {
    if (medicines.length > 0) {
      loadMedicines(); // Reload to get fresh intake data
    }
  }, [currentTime]);

  const checkFirstTimeUser = async () => {
    try {
      const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
      
      if (!hasSeenWelcome) {
        setIsFirstTime(true);
      } else {
        setIsFirstTime(false);
      }
    } catch (error) {
      console.error('Error checking first time user:', error);
      setIsFirstTime(true);
    }
  };

  const loadMedicines = async () => {
    try {
      const storedMedicines = await AsyncStorage.getItem('medicines');
      if (storedMedicines) {
        const parsedMedicines: Medicine[] = JSON.parse(storedMedicines);
        setMedicines(parsedMedicines);
      } else {
        setMedicines([]);
      }
    } catch (error) {
      console.error('Error loading medicines:', error);
      setMedicines([]);
    }
  };

  const handleWelcomeComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenWelcome', 'true');
      setIsFirstTime(false);
    } catch (error) {
      console.error('Error setting welcome flag:', error);
    }
  };

  const takeMedicine = async (medicineId: string, scheduleTime: string) => {
    try {
      const intakesKey = `intakes_${medicineId}`;
      const existingIntakes = await AsyncStorage.getItem(intakesKey);
      const intakes: MedicineIntake[] = existingIntakes ? JSON.parse(existingIntakes) : [];
      
      const today = new Date().toDateString();
      const newIntake: MedicineIntake = {
        id: Date.now().toString(),
        medicineId,
        scheduledTime: scheduleTime,
        takenAt: new Date().toISOString(),
        date: today,
      };
      
      intakes.push(newIntake);
      await AsyncStorage.setItem(intakesKey, JSON.stringify(intakes));
      
      // Reload medicines to update the display
      await loadMedicines();
      
      Alert.alert('Medicine Taken', 'Great job staying on track! 🐱');
    } catch (error) {
      console.error('Error recording medicine intake:', error);
      Alert.alert('Error', 'Failed to record medicine intake');
    }
  };

  if (isFirstTime === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (isFirstTime) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }


  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <LinearGradient colors={['#10B981', '#059669']} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <Text style={styles.brandText}>MediCat</Text>
            <Text style={styles.catEmoji}>🐱</Text>
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {relevantMedicinesState.length === 0 ? (
            <View style={styles.noMedicinesContainer}>
              <Text style={styles.noMedicinesEmoji}>😸</Text>
              <Text style={styles.noMedicinesTitle}>All caught up!</Text>
              <Text style={styles.noMedicinesSubtitle}>
                No medicines due right now.
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/(tabs)/add')}
              >
                <Text style={styles.addButtonText}>Add Medicine</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Medicines Due</Text>
              {relevantMedicinesState.map((item) => (
                <MedicineCard
                  key={`${item.medicine.id}-${item.scheduleTime}`}
                  medicine={item.medicine}
                  scheduleTime={item.scheduleTime}
                  onTake={() => takeMedicine(item.medicine.id, item.scheduleTime)}
                />
              ))}
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push('/(tabs)/medicines')}
        >
          <Text style={styles.viewAllButtonText}>View All Medicines</Text>
        </TouchableOpacity>
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
    backgroundColor: '#10B981',
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
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 8,
  },
  catEmoji: {
    fontSize: 28,
  },
  timeContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#D1FAE5',
    fontWeight: '500',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  noMedicinesContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noMedicinesEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  noMedicinesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  noMedicinesSubtitle: {
    fontSize: 16,
    color: '#D1FAE5',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  addButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewAllButton: {
    marginHorizontal: 24,
    marginTop: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});