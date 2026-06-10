/* ══════════════════════════════════════════════
   screens/PersonalityResultScreen.tsx
   여행 성향 분석 결과 화면
   ══════════════════════════════════════════════ */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/travelTypes';
import { Colors } from '../theme/colors';
import { X, RefreshCw, Map } from 'lucide-react-native';
import { analyzePersonality, AnalysisResult, getTravelType, TravelTypeKey } from '../utils/personalityAnalyzer';
import { API_BASE } from '../store/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

type RouteParams = RouteProp<RootStackParamList, 'PersonalityResult'>;

export const PersonalityResultScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteParams>();
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    // 새로운 테스트 결과가 있는 경우
    if (route.params?.answers) {
      const analysisResult = analyzePersonality(route.params.answers);
      setResult(analysisResult);
      // 자동으로 결과 저장
      saveResultToBackend(analysisResult, route.params.answers);
    } 
    // 저장된 결과를 불러온 경우
    else if (route.params?.savedResult) {
      const savedData = route.params.savedResult;
      const typeData = getTravelType(savedData.travelType as TravelTypeKey);
      
      setResult({
        type: savedData.travelType as TravelTypeKey,
        typeData: typeData,
        scores: savedData.scores,
        axisScores: savedData.axisScores,
      });
    }
  }, [route.params]);

  const saveResultToBackend = async (analysisResult: AnalysisResult, answers: any) => {
    try {
      // 1. AsyncStorage에 로컬 저장 (DB 없이도 동작)
      const resultToSave = {
        travelType: analysisResult.type,
        scores: analysisResult.scores,
        axisScores: analysisResult.axisScores,
        savedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('personalityResult', JSON.stringify(resultToSave));
      console.log('Result saved to AsyncStorage');

      // 2. 백엔드에도 저장 시도 (선택사항)
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.log('No token found, skipping backend save');
        return;
      }

      const response = await fetch(`${API_BASE}/personality/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          travelType: analysisResult.type,
          scores: analysisResult.scores,
          axisScores: analysisResult.axisScores,
          answers: answers || {},
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Personality result saved to backend successfully');
      } else {
        console.error('Failed to save personality result to backend:', data.message);
      }
    } catch (error) {
      console.error('Save result error:', error);
      // 백엔드 저장 실패해도 로컬에는 저장되어 있음
    }
  };

  const handleRetakeTest = async () => {
    try {
      // AsyncStorage에서 저장된 결과 삭제
      await AsyncStorage.removeItem('personalityResult');
      console.log('Saved result cleared');
      // 테스트 화면으로 이동
      navigation.navigate('PersonalityTest');
    } catch (error) {
      console.error('Clear result error:', error);
      navigation.navigate('PersonalityTest');
    }
  };

  if (!result) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>결과를 분석하는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { typeData, axisScores } = result;

  // 축별 점수를 퍼센트로 변환 (-6 ~ +6 범위를 0 ~ 100으로)
  const normalizeScore = (score: number) => {
    return ((score + 6) / 12) * 100;
  };

  const axisLabels = {
    plan: { left: '즉흥형', right: '계획형' },
    adventure: { left: '안전추구', right: '모험추구' },
    active: { left: '휴식형', right: '활동형' },
    social: { left: '독립형', right: '사교형' },
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Main')} style={styles.closeBtn}>
          <X size={28} color="#1A1A1A" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>성향 분석 결과</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Type Card */}
        <View style={[styles.typeCard, { borderColor: typeData.color }]}>
          <Text style={styles.emoji}>{typeData.emoji}</Text>
          <Text style={styles.typeName}>{typeData.name}</Text>
          <Text style={styles.typeSub}>{typeData.sub}</Text>
          <Text style={styles.typeDesc}>{typeData.desc}</Text>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {typeData.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: typeData.color }]}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Characteristics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 주요 특징</Text>
          <View style={styles.characteristicsContainer}>
            {typeData.characteristics.map((char, index) => (
              <View key={index} style={styles.characteristicItem}>
                <View style={[styles.bullet, { backgroundColor: typeData.color }]} />
                <Text style={styles.characteristicText}>{char}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Axis Scores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 성향 분석</Text>
          <View style={styles.axesContainer}>
            {Object.entries(axisScores).map(([axis, score]) => {
              const labels = axisLabels[axis as keyof typeof axisLabels];
              const percentage = normalizeScore(score);
              
              return (
                <View key={axis} style={styles.axisItem}>
                  <View style={styles.axisLabels}>
                    <Text style={styles.axisLabelLeft}>{labels.left}</Text>
                    <Text style={styles.axisLabelRight}>{labels.right}</Text>
                  </View>
                  <View style={styles.axisBarContainer}>
                    <View style={styles.axisCenter} />
                    <View
                      style={[
                        styles.axisFill,
                        {
                          width: `${Math.abs(percentage - 50)}%`,
                          left: percentage < 50 ? `${percentage}%` : '50%',
                          backgroundColor: typeData.color + '40',
                        }
                      ]}
                    />
                    <View
                      style={[
                        styles.axisMarker,
                        {
                          left: `${percentage}%`,
                          backgroundColor: typeData.color,
                        }
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ 추천 여행 스타일</Text>
          
          <View style={styles.recCategory}>
            <Text style={styles.recCategoryTitle}>🏛 추천 관광지</Text>
            <View style={styles.recItems}>
              {typeData.rec.attraction.map((item, index) => (
                <View key={index} style={styles.recItem}>
                  <Text style={styles.recItemText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.recCategory}>
            <Text style={styles.recCategoryTitle}>🏨 추천 숙소</Text>
            <View style={styles.recItems}>
              {typeData.rec.accommodation.map((item, index) => (
                <View key={index} style={styles.recItem}>
                  <Text style={styles.recItemText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.recCategory}>
            <Text style={styles.recCategoryTitle}>🎯 추천 액티비티</Text>
            <View style={styles.recItems}>
              {typeData.rec.activity.map((item, index) => (
                <View key={index} style={styles.recItem}>
                  <Text style={styles.recItemText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.recCategory}>
            <Text style={styles.recCategoryTitle}>☕ 추천 카페</Text>
            <View style={styles.recItems}>
              {typeData.rec.cafe.map((item, index) => (
                <View key={index} style={styles.recItem}>
                  <Text style={styles.recItemText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionBtnSecondary}
            onPress={handleRetakeTest}
          >
            <RefreshCw size={20} color="#4A90E2" strokeWidth={2} />
            <Text style={styles.actionBtnTextSecondary}>다시 검사하기</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtnPrimary, { backgroundColor: typeData.color }]}
            onPress={() => navigation.navigate('CreatePackage')}
          >
            <Map size={20} color="#fff" strokeWidth={2} />
            <Text style={styles.actionBtnTextPrimary}>맞춤형 일정 작성하기</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  container: {
    flex: 1,
    backgroundColor: '#FBFBFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
  },
  typeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 30,
    borderRadius: 25,
    borderWidth: 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 15,
  },
  typeName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  typeSub: {
    fontSize: 15,
    color: '#999',
    marginBottom: 15,
    fontWeight: '600',
  },
  typeDesc: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  characteristicsContainer: {
    gap: 12,
  },
  characteristicItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 12,
  },
  characteristicText: {
    flex: 1,
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 22,
  },
  axesContainer: {
    gap: 20,
  },
  axisItem: {
    gap: 8,
  },
  axisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axisLabelLeft: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  axisLabelRight: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  axisBarContainer: {
    height: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    position: 'relative',
  },
  axisCenter: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#CCC',
  },
  axisFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 6,
  },
  axisMarker: {
    position: 'absolute',
    top: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
    borderWidth: 3,
    borderColor: '#fff',
  },
  recCategory: {
    marginBottom: 20,
  },
  recCategoryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  recItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recItem: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  recItemText: {
    fontSize: 13,
    color: '#4A5568',
    fontWeight: '600',
  },
  actionsContainer: {
    marginHorizontal: 20,
    marginTop: 15,
    gap: 12,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  actionBtnTextPrimary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionBtnTextSecondary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
});
