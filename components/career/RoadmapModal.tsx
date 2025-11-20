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
import { RoadmapItem } from '../../types/career';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { Badge } from '../ui/Badge';
import { saveRoadmap } from '../../lib/api/roadmap';
import { getCurrentUserIdAsync } from '../../lib/auth';

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roadmap: RoadmapItem[]) => Promise<void>;
  initialRoadmap: RoadmapItem[];
}

export function RoadmapModal({
  isOpen,
  onClose,
  onSave,
  initialRoadmap,
}: RoadmapModalProps) {
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<RoadmapItem>>({
    title: '',
    description: '',
    year: new Date().getFullYear(),
    quarter: 1,
    status: 'planned',
    skills: [],
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRoadmap(initialRoadmap || []);
      setEditingIndex(null);
      setFormData({
        title: '',
        description: '',
        year: new Date().getFullYear(),
        quarter: 1,
        status: 'planned',
        skills: [],
      });
      setSkillInput('');
    }
  }, [isOpen, initialRoadmap]);

  const handleAddItem = () => {
    setEditingIndex(null);
    setFormData({
      title: '',
      description: '',
      year: new Date().getFullYear(),
      quarter: 1,
      status: 'planned',
      skills: [],
    });
    setSkillInput('');
  };

  const handleEditItem = (index: number) => {
    setEditingIndex(index);
    setFormData(roadmap[index]);
    setSkillInput('');
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData({
        ...formData,
        skills: [...(formData.skills || []), skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillIndex: number) => {
    setFormData({
      ...formData,
      skills: formData.skills?.filter((_, i) => i !== skillIndex) || [],
    });
  };

  const handleSaveItem = () => {
    if (!formData.title || !formData.description) {
      Alert.alert('오류', '제목과 설명을 입력해주세요.');
      return;
    }

    const newItem: RoadmapItem = {
      id: editingIndex !== null ? roadmap[editingIndex].id : `roadmap-${Date.now()}`,
      userId: '', // Will be set when saving
      title: formData.title,
      description: formData.description,
      year: formData.year || new Date().getFullYear(),
      quarter: formData.quarter || 1,
      status: formData.status || 'planned',
      skills: formData.skills || [],
      createdAt:
        editingIndex !== null
          ? roadmap[editingIndex].createdAt
          : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingIndex !== null) {
      const updated = [...roadmap];
      updated[editingIndex] = newItem;
      setRoadmap(updated);
    } else {
      setRoadmap([...roadmap, newItem]);
    }

    setEditingIndex(null);
    setFormData({
      title: '',
      description: '',
      year: new Date().getFullYear(),
      quarter: 1,
      status: 'planned',
      skills: [],
    });
    setSkillInput('');
  };

  const handleDeleteItem = (index: number) => {
    Alert.alert('삭제 확인', '이 항목을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          setRoadmap(roadmap.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const userId = await getCurrentUserIdAsync();
      if (!userId) {
        Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      const roadmapWithUserId = roadmap.map((item) => ({
        ...item,
        userId,
      }));

      await saveRoadmap(userId, roadmapWithUserId);
      await onSave(roadmapWithUserId);
      onClose();
    } catch (error) {
      console.error('Failed to save roadmap:', error);
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
            <Text style={styles.modalTitle}>로드맵 관리</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {editingIndex === null ? (
              <>
                <View style={styles.buttonRow}>
                  <Button onPress={handleAddItem} style={styles.addButton}>
                    <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 4 }} />
                    항목 추가
                  </Button>
                </View>

                {roadmap.map((item, index) => (
                  <View key={item.id} style={styles.roadmapItem}>
                    <View style={styles.roadmapItemHeader}>
                      <Text style={styles.roadmapItemTitle}>{item.title}</Text>
                      <View style={styles.roadmapItemActions}>
                        <TouchableOpacity
                          onPress={() => handleEditItem(index)}
                          style={styles.actionButton}
                        >
                          <Ionicons name="pencil" size={18} color="#3B82F6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteItem(index)}
                          style={styles.actionButton}
                        >
                          <Ionicons name="trash" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.roadmapItemDescription}>{item.description}</Text>
                    <View style={styles.roadmapItemMeta}>
                      <Badge>{item.year}년 {item.quarter}분기</Badge>
                      <Badge
                        style={{
                          backgroundColor:
                            item.status === 'completed'
                              ? '#D1FAE5'
                              : item.status === 'in-progress'
                              ? '#DBEAFE'
                              : '#FEF3C7',
                        }}
                      >
                        {item.status === 'completed'
                          ? '완료'
                          : item.status === 'in-progress'
                          ? '진행중'
                          : '계획'}
                      </Badge>
                    </View>
                  </View>
                ))}

                {roadmap.length === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons name="map-outline" size={48} color="#9CA3AF" />
                    <Text style={styles.emptyStateText}>로드맵 항목이 없습니다</Text>
                    <Text style={styles.emptyStateSubtext}>
                      항목 추가 버튼을 눌러 로드맵을 만들어보세요
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.formContainer}>
                <View style={styles.formGroup}>
                  <Label>제목</Label>
                  <TextInput
                    style={styles.input}
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                    placeholder="예: React Native 프로젝트 완성"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Label>설명</Label>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    placeholder="상세 설명을 입력하세요"
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Label>연도</Label>
                    <TextInput
                      style={styles.input}
                      value={formData.year?.toString()}
                      onChangeText={(text) =>
                        setFormData({ ...formData, year: parseInt(text) || 0 })
                      }
                      keyboardType="numeric"
                      placeholder="2024"
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Label>분기</Label>
                    <View style={styles.quarterSelector}>
                      {[1, 2, 3, 4].map((q) => (
                        <TouchableOpacity
                          key={q}
                          onPress={() => setFormData({ ...formData, quarter: q })}
                          style={[
                            styles.quarterButton,
                            formData.quarter === q && styles.quarterButtonActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.quarterButtonText,
                              formData.quarter === q && styles.quarterButtonTextActive,
                            ]}
                          >
                            {q}Q
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Label>상태</Label>
                  <View style={styles.statusSelector}>
                    {(['planned', 'in-progress', 'completed'] as const).map((status) => (
                      <TouchableOpacity
                        key={status}
                        onPress={() => setFormData({ ...formData, status })}
                        style={[
                          styles.statusButton,
                          formData.status === status && styles.statusButtonActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusButtonText,
                            formData.status === status && styles.statusButtonTextActive,
                          ]}
                        >
                          {status === 'completed'
                            ? '완료'
                            : status === 'in-progress'
                            ? '진행중'
                            : '계획'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Label>기술 스택</Label>
                  <View style={styles.techInputContainer}>
                    <TextInput
                      style={styles.techInput}
                      value={skillInput}
                      onChangeText={setSkillInput}
                      placeholder="기술 스택 입력"
                      onSubmitEditing={handleAddSkill}
                    />
                    <TouchableOpacity onPress={handleAddSkill} style={styles.addButton}>
                      <Ionicons name="add" size={20} color="#3B82F6" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.techStackContainer}>
                    {formData.skills?.map((skill, index) => (
                      <View key={index} style={styles.techTag}>
                        <Text style={styles.techTagText}>{skill}</Text>
                        <TouchableOpacity onPress={() => handleRemoveSkill(index)}>
                          <Ionicons name="close-circle" size={18} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.formActions}>
                  <Button variant="outline" onPress={() => setEditingIndex(null)}>
                    취소
                  </Button>
                  <Button onPress={handleSaveItem}>저장</Button>
                </View>
              </View>
            )}
          </ScrollView>

          {editingIndex === null && (
            <View style={styles.modalFooter}>
              <Button variant="outline" onPress={onClose} style={styles.cancelButton}>
                취소
              </Button>
              <Button onPress={handleSave} loading={loading} style={styles.saveButton}>
                저장
              </Button>
            </View>
          )}
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
  buttonRow: {
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roadmapItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  roadmapItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roadmapItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  roadmapItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  roadmapItemDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  roadmapItemMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  formContainer: {
    // Form container styles
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
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
    height: 100,
    textAlignVertical: 'top',
  },
  quarterSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  quarterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  quarterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  quarterButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  quarterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  statusButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  statusButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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

