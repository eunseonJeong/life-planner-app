import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CareerGoal, CareerGoalFormData } from '../../types/career';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { saveCareerGoal } from '../../lib/api/career-goals';
import { getCurrentUserIdAsync } from '../../lib/auth';

interface CareerGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CareerGoalFormData) => Promise<void>;
  initialData?: CareerGoal;
  mode: 'create' | 'edit';
}

export function CareerGoalModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}: CareerGoalModalProps) {
  const [formData, setFormData] = useState<CareerGoalFormData>({
    year: new Date().getFullYear(),
    currentSalary: 0,
    targetSalary: 0,
    sideIncomeTarget: 0,
    techStack: [],
    portfolioCount: 0,
    networkingGoals: '',
    learningGoals: '',
  });
  const [techInput, setTechInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        year: initialData.year,
        currentSalary: initialData.currentSalary,
        targetSalary: initialData.targetSalary,
        sideIncomeTarget: initialData.sideIncomeTarget || 0,
        techStack: initialData.techStack,
        portfolioCount: initialData.portfolioCount,
        networkingGoals: initialData.networkingGoals,
        learningGoals: initialData.learningGoals,
      });
    } else {
      setFormData({
        year: new Date().getFullYear(),
        currentSalary: 0,
        targetSalary: 0,
        sideIncomeTarget: 0,
        techStack: [],
        portfolioCount: 0,
        networkingGoals: '',
        learningGoals: '',
      });
    }
    setTechInput('');
  }, [initialData, mode, isOpen]);

  const handleAddTech = () => {
    if (techInput.trim()) {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, techInput.trim()],
      });
      setTechInput('');
    }
  };

  const handleRemoveTech = (index: number) => {
    setFormData({
      ...formData,
      techStack: formData.techStack.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    if (!formData.targetSalary || !formData.currentSalary) {
      Alert.alert('오류', '연봉 정보를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const userId = await getCurrentUserIdAsync();
      if (!userId) {
        Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      const goalData: CareerGoal = {
        id: initialData?.id || `goal-${Date.now()}`,
        userId,
        ...formData,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveCareerGoal(userId, goalData);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save career goal:', error);
      Alert.alert('오류', '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {mode === 'create' ? '커리어 목표 등록' : '커리어 목표 수정'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Label>연도</Label>
              <TextInput
                style={styles.input}
                value={formData.year.toString()}
                onChangeText={(text) =>
                  setFormData({ ...formData, year: parseInt(text) || 0 })
                }
                keyboardType="numeric"
                placeholder="2024"
              />
            </View>

            <View style={styles.formGroup}>
              <Label>현재 연봉 (원)</Label>
              <TextInput
                style={styles.input}
                value={formData.currentSalary.toString()}
                onChangeText={(text) =>
                  setFormData({ ...formData, currentSalary: parseInt(text) || 0 })
                }
                keyboardType="numeric"
                placeholder="50000000"
              />
            </View>

            <View style={styles.formGroup}>
              <Label>목표 연봉 (원)</Label>
              <TextInput
                style={styles.input}
                value={formData.targetSalary.toString()}
                onChangeText={(text) =>
                  setFormData({ ...formData, targetSalary: parseInt(text) || 0 })
                }
                keyboardType="numeric"
                placeholder="80000000"
              />
            </View>

            <View style={styles.formGroup}>
              <Label>부업 수입 목표 (원)</Label>
              <TextInput
                style={styles.input}
                value={formData.sideIncomeTarget?.toString() || '0'}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    sideIncomeTarget: parseInt(text) || 0,
                  })
                }
                keyboardType="numeric"
                placeholder="10000000"
              />
            </View>

            <View style={styles.formGroup}>
              <Label>포트폴리오 개수</Label>
              <TextInput
                style={styles.input}
                value={formData.portfolioCount.toString()}
                onChangeText={(text) =>
                  setFormData({ ...formData, portfolioCount: parseInt(text) || 0 })
                }
                keyboardType="numeric"
                placeholder="3"
              />
            </View>

            <View style={styles.formGroup}>
              <Label>기술 스택</Label>
              <View style={styles.techInputContainer}>
                <TextInput
                  style={styles.techInput}
                  value={techInput}
                  onChangeText={setTechInput}
                  placeholder="기술 스택 입력"
                  onSubmitEditing={handleAddTech}
                />
                <TouchableOpacity onPress={handleAddTech} style={styles.addButton}>
                  <Ionicons name="add" size={20} color="#3B82F6" />
                </TouchableOpacity>
              </View>
              <View style={styles.techStackContainer}>
                {formData.techStack.map((tech, index) => (
                  <View key={index} style={styles.techTag}>
                    <Text style={styles.techTagText}>{tech}</Text>
                    <TouchableOpacity onPress={() => handleRemoveTech(index)}>
                      <Ionicons name="close-circle" size={18} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Label>네트워킹 목표 (쉼표로 구분)</Label>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.networkingGoals}
                onChangeText={(text) =>
                  setFormData({ ...formData, networkingGoals: text })
                }
                placeholder="커뮤니티 참여, 컨퍼런스 참석"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Label>학습 목표 (쉼표로 구분)</Label>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.learningGoals}
                onChangeText={(text) =>
                  setFormData({ ...formData, learningGoals: text })
                }
                placeholder="React Native 마스터, TypeScript 학습"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button variant="outline" onPress={onClose} style={styles.cancelButton}>
              취소
            </Button>
            <Button onPress={handleSave} loading={loading} style={styles.saveButton}>
              저장
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  formGroup: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  techInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  techInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    padding: 8,
  },
  techStackContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  techTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  techTagText: {
    fontSize: 14,
    color: '#374151',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

