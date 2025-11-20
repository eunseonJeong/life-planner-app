import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Label } from '../components/ui/Label';
import { CareerGoalModal } from '../components/career/CareerGoalModal';
import { RoadmapModal } from '../components/career/RoadmapModal';
import { CareerGoal, RoadmapItem, CareerGoalFormData } from '../types/career';
import { getCareerGoals } from '../lib/api/career-goals';
import { getRoadmap } from '../lib/api/roadmap';
import { getCurrentUserIdAsync } from '../lib/auth';

export default function CareerPage() {
  const [careerGoal, setCareerGoal] = useState<CareerGoal | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const userId = await getCurrentUserIdAsync();

      if (!userId) {
        // 사용자 ID가 없으면 임시로 'default' 사용
        const tempUserId = 'default';
        const careerResponse = await getCareerGoals(tempUserId);
        if (careerResponse.data && careerResponse.data.length > 0) {
          const latestGoal = careerResponse.data.reduce((latest, current) =>
            current.year > latest.year ? current : latest
          );
          setCareerGoal(latestGoal);
        }

        const roadmapResponse = await getRoadmap(tempUserId);
        if (roadmapResponse.data) {
          setRoadmap(roadmapResponse.data);
        }
      } else {
        const careerResponse = await getCareerGoals(userId);
        if (careerResponse.data && careerResponse.data.length > 0) {
          const latestGoal = careerResponse.data.reduce((latest, current) =>
            current.year > latest.year ? current : latest
          );
          setCareerGoal(latestGoal);
        }

        const roadmapResponse = await getRoadmap(userId);
        if (roadmapResponse.data) {
          setRoadmap(roadmapResponse.data);
        }
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      setCareerGoal(null);
      setRoadmap([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { backgroundColor: '#D1FAE5', color: '#065F46' };
      case 'in-progress':
        return { backgroundColor: '#DBEAFE', color: '#1E40AF' };
      case 'planned':
        return { backgroundColor: '#FEF3C7', color: '#92400E' };
      default:
        return { backgroundColor: '#F3F4F6', color: '#374151' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Ionicons name="checkmark-circle" size={20} color="#10B981" />;
      case 'in-progress':
        return <Ionicons name="target" size={20} color="#3B82F6" />;
      case 'planned':
        return <Ionicons name="calendar-outline" size={20} color="#F59E0B" />;
      default:
        return <Ionicons name="calendar-outline" size={20} color="#6B7280" />;
    }
  };

  const salaryProgress = careerGoal
    ? (careerGoal.currentSalary / careerGoal.targetSalary) * 100
    : 0;

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenRoadmapModal = () => {
    setIsRoadmapModalOpen(true);
  };

  const handleCloseRoadmapModal = () => {
    setIsRoadmapModalOpen(false);
  };

  const handleSaveCareerGoal = async (data: CareerGoalFormData) => {
    await loadData();
  };

  const handleSaveRoadmap = async (newRoadmap: RoadmapItem[]) => {
    await loadData();
  };

  return (
    <ScrollView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>커리어 계획</Text>
          <Text style={styles.subtitle}>목표와 성장 로드맵을 관리하세요</Text>
        </View>
        <View style={styles.headerButtons}>
          {!careerGoal && (
            <Button onPress={handleOpenCreateModal} size="sm">
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '500' }}>목표 등록</Text>
              </View>
            </Button>
          )}
          {careerGoal && (
            <Button onPress={handleOpenEditModal} size="sm" variant="outline">
              목표 수정
            </Button>
          )}
        </View>
      </View>

      {/* 로딩 상태 */}
      {isLoading && (
        <Card>
          <CardContent style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>커리어 정보를 불러오는 중...</Text>
          </CardContent>
        </Card>
      )}

      {/* 빈 상태 */}
      {!isLoading && !careerGoal && roadmap.length === 0 && (
        <Card>
          <CardContent style={styles.emptyContainer}>
            <Ionicons name="trending-up-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>커리어 정보가 없습니다</Text>
            <Text style={styles.emptySubtitle}>
              커리어 목표를 설정하고 성장 로드맵을 만들어보세요!
            </Text>
            <View style={styles.emptyButtons}>
              <Button onPress={handleOpenCreateModal}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '500' }}>목표 등록</Text>
                </View>
              </Button>
              <Button variant="outline" onPress={handleOpenRoadmapModal}>
                로드맵 관리
              </Button>
            </View>
          </CardContent>
        </Card>
      )}

      {/* 데이터가 있을 때 */}
      {!isLoading && (careerGoal || roadmap.length > 0) && (
        <>
          {/* 연봉 목표 */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Ionicons name="cash-outline" size={20} color="#374151" style={{ marginRight: 8 }} />
                <Text style={styles.cardTitleText}>연봉 목표</Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {careerGoal && (
                <View style={styles.salaryContainer}>
                  <View style={styles.salaryGrid}>
                    <View style={styles.salaryItem}>
                      <Label>현재 연봉</Label>
                      <Text style={styles.salaryValue}>
                        {careerGoal.currentSalary.toLocaleString()}원
                      </Text>
                    </View>
                    <View style={styles.salaryItem}>
                      <Label>목표 연봉</Label>
                      <Text style={[styles.salaryValue, styles.targetSalary]}>
                        {careerGoal.targetSalary.toLocaleString()}원
                      </Text>
                    </View>
                    <View style={styles.salaryItem}>
                      <Label>부업 수입 목표</Label>
                      <Text style={[styles.salaryValue, styles.sideIncome]}>
                        {careerGoal?.sideIncomeTarget?.toLocaleString() || 0}원
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>진행률</Text>
                      <Text style={styles.progressValue}>{Math.round(salaryProgress)}%</Text>
                    </View>
                    <Progress value={salaryProgress} height={12} />
                  </View>
                </View>
              )}
            </CardContent>
          </Card>

          {/* 기술 스택 & 포트폴리오 */}
          <View style={styles.gridRow}>
            <Card style={styles.halfCard}>
              <CardHeader>
                <CardTitle>
                  <Ionicons name="code-outline" size={20} color="#374151" style={{ marginRight: 8 }} />
                  <Text style={styles.cardTitleText}>기술 스택</Text>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {careerGoal && (
                  <View style={styles.techStackContainer}>
                    {careerGoal.techStack.map((tech, index) => (
                      <View key={index} style={styles.techItem}>
                        <Text style={styles.techText}>{tech}</Text>
                        <Badge variant="outline" style={styles.techBadge}>
                          학습중
                        </Badge>
                      </View>
                    ))}
                  </View>
                )}
              </CardContent>
            </Card>

            <Card style={styles.halfCard}>
              <CardHeader>
                <CardTitle>
                  <Ionicons name="trophy-outline" size={20} color="#374151" style={{ marginRight: 8 }} />
                  <Text style={styles.cardTitleText}>포트폴리오</Text>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {careerGoal && (
                  <View style={styles.portfolioContainer}>
                    <View style={styles.portfolioCenter}>
                      <Text style={styles.portfolioCount}>{careerGoal.portfolioCount}</Text>
                      <Text style={styles.portfolioLabel}>완성된 프로젝트</Text>
                    </View>
                    <View style={styles.portfolioProgress}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>목표</Text>
                        <Text style={styles.progressValue}>5개</Text>
                      </View>
                      <Progress value={(careerGoal.portfolioCount / 5) * 100} height={8} />
                    </View>
                  </View>
                )}
              </CardContent>
            </Card>
          </View>

          {/* 네트워킹 & 학습 목표 */}
          <View style={styles.gridRow}>
            <Card style={styles.halfCard}>
              <CardHeader>
                <CardTitle>
                  <Ionicons name="people-outline" size={20} color="#374151" style={{ marginRight: 8 }} />
                  <Text style={styles.cardTitleText}>네트워킹 목표</Text>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {careerGoal && (
                  <View style={styles.goalsContainer}>
                    {careerGoal.networkingGoals.split(', ').map((goal, index) => (
                      <View key={index} style={styles.goalItem}>
                        <View style={styles.goalDot} />
                        <Text style={styles.goalText}>{goal}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </CardContent>
            </Card>

            <Card style={styles.halfCard}>
              <CardHeader>
                <CardTitle>
                  <Ionicons name="target-outline" size={20} color="#374151" style={{ marginRight: 8 }} />
                  <Text style={styles.cardTitleText}>학습 목표</Text>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {careerGoal && (
                  <View style={styles.goalsContainer}>
                    {careerGoal.learningGoals.split(', ').map((goal, index) => (
                      <View key={index} style={styles.goalItem}>
                        <View style={[styles.goalDot, { backgroundColor: '#10B981' }]} />
                        <Text style={styles.goalText}>{goal}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </CardContent>
            </Card>
          </View>

          {/* 성장 로드맵 */}
          <Card>
            <CardHeader>
              <View style={styles.roadmapHeader}>
                <CardTitle>
                  <Ionicons name="trending-up-outline" size={20} color="#374151" style={{ marginRight: 8 }} />
                  <Text style={styles.cardTitleText}>성장 로드맵</Text>
                </CardTitle>
                <Button onPress={handleOpenRoadmapModal} variant="outline" size="sm">
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="pencil" size={14} color="#3B82F6" style={{ marginRight: 4 }} />
                    <Text style={{ color: '#3B82F6', fontSize: 14, fontWeight: '500' }}>로드맵 관리</Text>
                  </View>
                </Button>
              </View>
            </CardHeader>
            <CardContent>
              <View style={styles.roadmapContainer}>
                {roadmap.map((item, index) => (
                  <View key={item.id} style={styles.roadmapItem}>
                    {index < roadmap.length - 1 && <View style={styles.roadmapLine} />}
                    <View style={styles.roadmapContent}>
                      <View style={[styles.roadmapIcon, getStatusColor(item.status)]}>
                        {getStatusIcon(item.status)}
                      </View>
                      <View style={styles.roadmapDetails}>
                        <View style={styles.roadmapItemHeader}>
                          <Text style={styles.roadmapItemTitle}>{item.title}</Text>
                          <Badge
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor: getStatusColor(item.status).backgroundColor,
                              },
                            ]}
                            textStyle={{ color: getStatusColor(item.status).color }}
                          >
                            {item.status === 'completed'
                              ? '완료'
                              : item.status === 'in-progress'
                              ? '진행중'
                              : '계획'}
                          </Badge>
                        </View>
                        <Text style={styles.roadmapItemDescription}>{item.description}</Text>
                        <View style={styles.roadmapItemMeta}>
                          <Text style={styles.roadmapItemMetaText}>
                            {item.year}년 {item.quarter}분기
                          </Text>
                          <View style={styles.skillsContainer}>
                            {Array.isArray(item?.skills) &&
                              item.skills.map((skill, skillIndex) => (
                                <Badge key={skillIndex} variant="outline" style={styles.skillBadge}>
                                  {skill}
                                </Badge>
                              ))}
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        </>
      )}

      {/* 모달 */}
      <CareerGoalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCareerGoal}
        initialData={modalMode === 'edit' && careerGoal ? careerGoal : undefined}
        mode={modalMode}
      />

      <RoadmapModal
        isOpen={isRoadmapModalOpen}
        onClose={handleCloseRoadmapModal}
        onSave={handleSaveRoadmap}
        initialRoadmap={roadmap}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cardTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  salaryContainer: {
    gap: 16,
  },
  salaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  salaryItem: {
    flex: 1,
    minWidth: '30%',
  },
  salaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  targetSalary: {
    color: '#3B82F6',
  },
  sideIncome: {
    color: '#10B981',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  halfCard: {
    flex: 1,
  },
  techStackContainer: {
    gap: 12,
  },
  techItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  techText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  techBadge: {
    marginLeft: 8,
  },
  portfolioContainer: {
    gap: 16,
  },
  portfolioCenter: {
    alignItems: 'center',
  },
  portfolioCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  portfolioLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  portfolioProgress: {
    marginTop: 8,
  },
  goalsContainer: {
    gap: 12,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  goalText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  roadmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  roadmapContainer: {
    gap: 16,
  },
  roadmapItem: {
    position: 'relative',
  },
  roadmapLine: {
    position: 'absolute',
    left: 24,
    top: 48,
    width: 2,
    height: 48,
    backgroundColor: '#E5E7EB',
  },
  roadmapContent: {
    flexDirection: 'row',
    gap: 16,
  },
  roadmapIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE',
  },
  roadmapDetails: {
    flex: 1,
  },
  roadmapItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roadmapItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    marginLeft: 8,
  },
  roadmapItemDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  roadmapItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  roadmapItemMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillBadge: {
    fontSize: 10,
  },
});

