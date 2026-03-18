/**
 * Offline Cache Service
 * Caches everything: login credentials, auth tokens, screening results, chat conversations
 * Allows app to work completely offline
 */

const CACHE_KEYS = {
  AUTH_TOKEN: 'mamaCare_auth_token',
  USER_DATA: 'mamaCare_user_data',
  SCREENINGS: 'mamaCare_screenings',
  CHAT_HISTORY: 'mamaCare_chat_history',
  LAST_SYNC: 'mamaCare_last_sync',
  OFFLINE_ENABLED: 'mamaCare_offline_enabled',
};

/**
 * Cache auth token after successful login
 */
export const cacheAuthToken = async (token, userData) => {
  try {
    const timestamp = new Date().toISOString();
    await Promise.all([
      localStorage.setItem(CACHE_KEYS.AUTH_TOKEN, token),
      localStorage.setItem(CACHE_KEYS.USER_DATA, JSON.stringify({ ...userData, cachedAt: timestamp })),
      localStorage.setItem(CACHE_KEYS.LAST_SYNC, timestamp),
    ]);
    console.log('✅ Auth token cached for offline use');
    return true;
  } catch (error) {
    console.error('❌ Failed to cache auth token:', error);
    return false;
  }
};

/**
 * Get cached auth token (for offline access)
 */
export const getCachedAuthToken = () => {
  try {
    const token = localStorage.getItem(CACHE_KEYS.AUTH_TOKEN);
    return token || null;
  } catch (error) {
    console.error('❌ Failed to get cached token:', error);
    return null;
  }
};

/**
 * Get cached user data
 */
export const getCachedUserData = () => {
  try {
    const data = localStorage.getItem(CACHE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('❌ Failed to get cached user data:', error);
    return null;
  }
};

/**
 * Cache screening result (from server or offline analysis)
 */
export const cacheScreeningResult = async (result) => {
  try {
    const screenings = getCachedScreenings() || [];
    const newScreening = {
      id: `offline_${Date.now()}`,
      ...result,
      cachedAt: new Date().toISOString(),
      synced: false, // Mark as not yet synced to server
    };
    screenings.push(newScreening);
    
    await localStorage.setItem(CACHE_KEYS.SCREENINGS, JSON.stringify(screenings));
    console.log('✅ Screening result cached:', newScreening);
    return newScreening;
  } catch (error) {
    console.error('❌ Failed to cache screening:', error);
    return null;
  }
};

/**
 * Get all cached screening results
 */
export const getCachedScreenings = () => {
  try {
    const data = localStorage.getItem(CACHE_KEYS.SCREENINGS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ Failed to get cached screenings:', error);
    return [];
  }
};

/**
 * Delete a cached screening by ID
 */
export const deleteScreeningFromCache = async (screeningId) => {
  try {
    const screenings = getCachedScreenings();
    const filtered = screenings.filter(s => s.id !== screeningId);
    await localStorage.setItem(CACHE_KEYS.SCREENINGS, JSON.stringify(filtered));
    console.log('✅ Screening deleted from cache:', screeningId);
    return true;
  } catch (error) {
    console.error('❌ Failed to delete screening:', error);
    return false;
  }
};

/**
 * Clear all cached screenings
 */
export const clearAllScreenings = async () => {
  try {
    await localStorage.setItem(CACHE_KEYS.SCREENINGS, JSON.stringify([]));
    console.log('✅ All screenings cleared');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear screenings:', error);
    return false;
  }
};

/**
 * Get unsynced screenings (to sync when back online)
 */
export const getUnsyncedScreenings = () => {
  try {
    const screenings = getCachedScreenings();
    return screenings.filter(s => !s.synced);
  } catch (error) {
    console.error('❌ Failed to get unsynced screenings:', error);
    return [];
  }
};

/**
 * Mark screening as synced to server
 */
export const markScreeningAsSynced = async (screeningId) => {
  try {
    const screenings = getCachedScreenings();
    const updated = screenings.map(s =>
      s.id === screeningId ? { ...s, synced: true, syncedAt: new Date().toISOString() } : s
    );
    await localStorage.setItem(CACHE_KEYS.SCREENINGS, JSON.stringify(updated));
    console.log('✅ Screening marked as synced:', screeningId);
    return true;
  } catch (error) {
    console.error('❌ Failed to mark screening as synced:', error);
    return false;
  }
};

/**
 * Cache chat message
 */
export const cacheChatMessage = async (message, sender = 'user') => {
  try {
    const history = getCachedChatHistory() || [];
    const newMessage = {
      id: `msg_${Date.now()}`,
      text: message,
      sender: sender, // 'user' or 'assistant'
      timestamp: new Date().toISOString(),
    };
    history.push(newMessage);
    
    await localStorage.setItem(CACHE_KEYS.CHAT_HISTORY, JSON.stringify(history));
    console.log('✅ Chat message cached');
    return newMessage;
  } catch (error) {
    console.error('❌ Failed to cache chat message:', error);
    return null;
  }
};

/**
 * Get cached chat history
 */
export const getCachedChatHistory = () => {
  try {
    const data = localStorage.getItem(CACHE_KEYS.CHAT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ Failed to get cached chat:', error);
    return [];
  }
};

/**
 * Clear chat history
 */
export const clearChatHistory = async () => {
  try {
    await localStorage.setItem(CACHE_KEYS.CHAT_HISTORY, JSON.stringify([]));
    console.log('✅ Chat history cleared');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear chat:', error);
    return false;
  }
};

/**
 * Clear all cached data
 */
export const clearAllCache = async () => {
  try {
    await Promise.all([
      localStorage.removeItem(CACHE_KEYS.AUTH_TOKEN),
      localStorage.removeItem(CACHE_KEYS.USER_DATA),
      localStorage.removeItem(CACHE_KEYS.SCREENINGS),
      localStorage.removeItem(CACHE_KEYS.CHAT_HISTORY),
      localStorage.removeItem(CACHE_KEYS.LAST_SYNC),
    ]);
    console.log('✅ All cache cleared');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear cache:', error);
    return false;
  }
};

/**
 * Get cache info (for debugging)
 */
export const getCacheInfo = () => {
  try {
    const token = getCachedAuthToken();
    const user = getCachedUserData();
    const screenings = getCachedScreenings();
    const chatHistory = getCachedChatHistory();
    const lastSync = localStorage.getItem(CACHE_KEYS.LAST_SYNC);

    return {
      hasToken: !!token,
      hasUserData: !!user,
      screeningCount: screenings.length,
      unsyncedCount: getUnsyncedScreenings().length,
      chatMessageCount: chatHistory.length,
      lastSync: lastSync,
      offlineEnabled: true,
    };
  } catch (error) {
    console.error('❌ Failed to get cache info:', error);
    return null;
  }
};

/**
 * Check if device is online
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Get offline status
 */
export const getOfflineStatus = () => {
  const online = isOnline();
  const hasCachedAuth = !!getCachedAuthToken();
  const cacheInfo = getCacheInfo();

  return {
    isOnline: online,
    canWorkOffline: hasCachedAuth,
    cacheInfo: cacheInfo,
  };
};