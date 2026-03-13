import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'mamacare_screening_history';
const CHAT_CACHE_KEY = 'mamacare_chat_cache';

// Screening History Cache
export const cacheScreening = async (result, type = 'questionnaire') => {
  try {
    const existing = await getCachedHistory();
    const entry = {
      id: Date.now().toString(),
      type,
      result,
      created_at: new Date().toISOString(),
      synced: false,
    };
    const updated = [entry, ...existing];
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return entry;
  } catch (err) {
    console.log('Cache save error:', err.message);
  }
};

export const getCachedHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.log('Cache read error:', err.message);
    return [];
  }
};

export const mergeHistory = async (serverData) => {
  try {
    const cached = await getCachedHistory();
    const serverIds = new Set(serverData.map((s) => s.id?.toString()));
    const localOnly = cached.filter((c) => !serverIds.has(c.id?.toString()));
    return [...serverData, ...localOnly];
  } catch (err) {
    return serverData;
  }
};

// Chat Response Cache
export const getCachedChatResponse = async (message) => {
  try {
    const data = await AsyncStorage.getItem(CHAT_CACHE_KEY);
    const cache = data ? JSON.parse(data) : {};
    const key = message.toLowerCase().trim();
    return cache[key] || null;
  } catch (err) {
    return null;
  }
};

export const cacheChatResponse = async (message, response) => {
  try {
    const data = await AsyncStorage.getItem(CHAT_CACHE_KEY);
    const cache = data ? JSON.parse(data) : {};
    const key = message.toLowerCase().trim();
    cache[key] = {
      response,
      cached_at: new Date().toISOString(),
    };
    await AsyncStorage.setItem(CHAT_CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.log('Chat cache error:', err.message);
  }
};

// General Cache Clear
export const clearCache = async () => {
  try {
    await AsyncStorage.multiRemove([HISTORY_KEY, CHAT_CACHE_KEY]);
  } catch (err) {
    console.log('Cache clear error:', err.message);
  }
};