import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, StatusBar,
  ActivityIndicator, RefreshControl, TouchableOpacity, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import RiskBadge from '../components/RiskBadge';
import { COLORS, FONTS, SIZES, SHADOWS } from '../theme';
import { getHistory, deleteScreening, clearHistory } from '../services/api'; 
import { getCachedScreenings, deleteScreeningFromCache, clearAllScreenings } from '../services/offlineCache'; 

const HistoryScreen = ({ navigation }) => {
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);

  const fetchHistory = async () => {
    try {
      const data = await getHistory();
      const serverList = data.screenings || data.data || (Array.isArray(data) ? data : []);
      setScreenings(serverList);
      setOffline(false);
    } catch (err) {
      console.log('Server unavailable, showing cached:', err.message);
      const cached = getCachedScreenings();
      setScreenings(cached);
      setOffline(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchHistory();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  // Delete single screening
  const handleDelete = (item, index) => {
    Alert.alert(
      'Delete Screening',
      'Are you sure you want to delete this screening?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Try to delete from server
              if (item.id && typeof item.id === 'number') {
                try {
                  await deleteScreening(item.id);
                  console.log('✅ Deleted from server');
                } catch (serverErr) {
                  console.log('⚠️ Could not delete from server:', serverErr.message);
                }
              }
              
              // Also delete from cache
              if (item.id) {
                await deleteScreeningFromCache(item.id);
              }
              
              // Remove from local state
              setScreenings((prev) => prev.filter((_, i) => i !== index));
              Alert.alert('Success', 'Screening deleted');
            } catch (err) {
              console.error('Delete error:', err.message);
              Alert.alert('Error', 'Failed to delete screening');
            }
          },
        },
      ]
    );
  };

  // Clear all history
  const handleClearAll = () => {
    if (screenings.length === 0) return;

    Alert.alert(
      'Clear All History',
      `Delete all ${screenings.length} screening(s)? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Try to clear from server
              try {
                await clearHistory();
                console.log('✅ Cleared from server');
              } catch (serverErr) {
                console.log('⚠️ Could not clear from server:', serverErr.message);
              }
              
              // Clear from cache
              await clearAllScreenings();
              
              // Clear local state
              setScreenings([]);
              Alert.alert('Success', 'All screening history cleared');
            } catch (err) {
              console.error('Clear error:', err.message);
              Alert.alert('Error', 'Failed to clear history');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const renderItem = ({ item, index }) => {
    const result = typeof item.result === 'string' ? JSON.parse(item.result) : item.result;
    const isImage = item.type === 'image';
    const isOfflineResult = result?.model_type === 'on_device_tfjs';
    const riskLevel = result?.risk_level || 'low';
    const riskScore = result?.risk_score || 0;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardNumber}>#{screenings.length - index}</Text>
          <View style={styles.cardHeaderRight}>
            <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
            <TouchableOpacity
              onPress={() => handleDelete(item, index)}
              style={styles.deleteBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isImage ? (
          <View style={styles.imageResult}>
            <Text style={styles.imageLabel}>
              {result?.label === 'malignant' ? '🔴' : result?.label === 'benign' ? '🟢' : '🔵'}{' '}
              {result?.label?.toUpperCase() || 'UNKNOWN'}
            </Text>
            <Text style={styles.imageConf}>
              {result?.confidence ? `${(result.confidence * 100).toFixed(1)}% confidence` : ''}
            </Text>
          </View>
        ) : (
          <RiskBadge level={riskLevel} score={riskScore} size="small" />
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.cardType}>
            {isImage ? '🔬 Image Analysis' : '📋 Questionnaire'}
          </Text>
          {isOfflineResult && (
            <View style={styles.offlineTag}>
              <Text style={styles.offlineTagText}>📱 Offline</Text>
            </View>
          )}
        </View>

        {!isImage && result?.recommendations && result.recommendations.length > 0 && (
          <View style={styles.recsBox}>
            {result.recommendations.slice(0, 2).map((rec, i) => (
              <Text key={i} style={styles.recText}>• {rec}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.pink} />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Screening History</Text>
            <Text style={styles.headerSub}>
              {screenings.length} screening{screenings.length !== 1 ? 's' : ''} recorded
            </Text>
          </View>
          {screenings.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        {offline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>📱 Showing cached results (offline)</Text>
          </View>
        )}
      </View>

      {screenings.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🌸</Text>
          <Text style={styles.emptyTitle}>No screenings yet</Text>
          <Text style={styles.emptyText}>
            Complete a risk assessment or use image analysis to see results here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={screenings}
          renderItem={renderItem}
          keyExtractor={(item, i) => item.id?.toString() || i.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.pink}
              colors={[COLORS.pink]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40,
  },
  header: {
    paddingTop: 60, paddingBottom: 16, paddingHorizontal: 24,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.gray100,
  },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { fontSize: SIZES.title, ...FONTS.bold, color: COLORS.dark },
  headerSub: { fontSize: SIZES.small, color: COLORS.gray500, ...FONTS.regular, marginTop: 4 },
  clearBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  clearBtnText: { fontSize: SIZES.small, color: '#DC2626', ...FONTS.semibold },
  offlineBanner: {
    backgroundColor: '#F3F0FF', borderRadius: 8, padding: 8, marginTop: 10, alignItems: 'center',
  },
  offlineBannerText: { fontSize: SIZES.tiny, color: '#6B46C1', ...FONTS.medium },
  list: { padding: 20, gap: 14 },
  card: {
    backgroundColor: COLORS.white, borderRadius: 18, padding: 18, gap: 12, ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  cardHeaderRight: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  cardNumber: { fontSize: SIZES.body, ...FONTS.bold, color: COLORS.pink },
  cardDate: { fontSize: SIZES.small, color: COLORS.gray500, ...FONTS.regular },
  deleteBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center', alignItems: 'center',
  },
  deleteBtnText: { fontSize: 12, color: '#DC2626', ...FONTS.bold },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  cardType: { fontSize: SIZES.small, color: COLORS.gray600, ...FONTS.medium },
  offlineTag: {
    backgroundColor: '#F3F0FF', borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8,
  },
  offlineTagText: { fontSize: SIZES.tiny, color: '#6B46C1', ...FONTS.medium },
  imageResult: { backgroundColor: COLORS.pinkSoft, borderRadius: 12, padding: 12 },
  imageLabel: { fontSize: SIZES.subtitle, ...FONTS.bold, color: COLORS.dark },
  imageConf: { fontSize: SIZES.small, color: COLORS.gray600, ...FONTS.regular, marginTop: 2 },
  recsBox: { backgroundColor: COLORS.pinkSoft, borderRadius: 12, padding: 12, gap: 4 },
  recText: { fontSize: SIZES.small, color: COLORS.gray700, ...FONTS.regular, lineHeight: 18 },
  loadingText: { marginTop: 12, color: COLORS.gray500, ...FONTS.medium },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: SIZES.title, ...FONTS.bold, color: COLORS.dark },
  emptyText: {
    fontSize: SIZES.body, color: COLORS.gray500, ...FONTS.regular,
    textAlign: 'center', marginTop: 8, lineHeight: 22,
  },
});

export default HistoryScreen;