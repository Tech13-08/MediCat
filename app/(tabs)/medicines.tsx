import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medicine } from '../../types/medicine';
import { MedicineListItem } from '../../components/MedicineListItem';

export default function MedicinesScreen() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadMedicines();
    }, [])
  );

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
    }
  };

  const editMedicine = (medicine: Medicine) => {
    router.push({
      pathname: '/(tabs)/edit',
      params: { medicineId: medicine.id },
    });
  };

  const adjustIntakes = (medicine: Medicine) => {
    router.push({
      pathname: '/(tabs)/adjust-intakes',
      params: { medicineId: medicine.id },
    });
  };

  const requestDeleteMedicine = (medicineId: string) => {
    setPendingDeleteId(medicineId);
    setShowDeleteModal(true);
  };

  const confirmDeleteMedicine = async () => {
    if (!pendingDeleteId) return;
    setLoading(true);
    setStatus('');
    try {
      const updatedMedicines = medicines.filter(
        (med) => med.id !== pendingDeleteId
      );
      await AsyncStorage.setItem('medicines', JSON.stringify(updatedMedicines));
      await AsyncStorage.removeItem(`intakes_${pendingDeleteId}`);
      setStatus('Medicine deleted successfully');
      setLoading(false);
      setShowDeleteModal(false);
      setPendingDeleteId(null);
      await loadMedicines();
    } catch (error) {
      console.error('Error deleting medicine:', error);
      setStatus('Failed to delete medicine');
      setLoading(false);
      setShowDeleteModal(false);
      setPendingDeleteId(null);
    }
  };

  return (
    <LinearGradient colors={['#10B981', '#059669']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Medicines</Text>
          <Text style={styles.subtitle}>
            Track and manage your pet's medications
          </Text>
        </View>

        {status ? (
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text
              style={{
                color: status.includes('successfully') ? '#22c55e' : '#ef4444',
                fontSize: 16,
              }}
            >
              {status}
            </Text>
          </View>
        ) : null}

        <View style={styles.form}>
          {medicines.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No medicines added yet.</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/(tabs)/add')}
              >
                <Text style={styles.addButtonText}>Add Medicine</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {medicines.map((medicine) => (
                <MedicineListItem
                  key={medicine.id}
                  medicine={medicine}
                  onDelete={() => requestDeleteMedicine(medicine.id)}
                  onEdit={() => editMedicine(medicine)}
                  onAdjustIntakes={() => adjustIntakes(medicine)}
                />
              ))}
              <TouchableOpacity
                style={styles.addFloatingButton}
                onPress={() => router.push('/(tabs)/add')}
                disabled={loading}
              >
                <Text style={styles.addFloatingButtonText}>+ Add Medicine</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        {/* Custom Delete Modal */}
        {showDeleteModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Medicine</Text>
              <Text style={styles.modalText}>
                Are you sure you want to delete this medicine? This action
                cannot be undone.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowDeleteModal(false);
                    setPendingDeleteId(null);
                  }}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={confirmDeleteMedicine}
                  disabled={loading}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#D1FAE5',
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 12,
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
  addFloatingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  addFloatingButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#10B981',
  },
  modalText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  modalButton: {
    flex: 1,
    minWidth: 120,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#D1FAE5',
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#F87171',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
