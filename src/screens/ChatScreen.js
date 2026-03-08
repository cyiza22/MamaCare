import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, StatusBar,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../theme';
import { sendMessage } from '../services/api';

const QUICK_TOPICS = [
  { label: '🔍 Self-exam', msg: 'How do I do a self-exam?' },
  { label: '⚠️ Symptoms', msg: 'What are the symptoms?' },
  { label: '🛡️ Risk factors', msg: 'What are the risk factors?' },
  { label: '🏥 Get help', msg: 'Where can I get help?' },
  { label: '💊 Treatment', msg: 'Can breast cancer be cured?' },
  { label: '❓ Myths', msg: 'Is it true that bras cause cancer?' },
];

const ChatScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: '0',
      text: "Hello! 🌸 I'm your breast health assistant.\n\nI can help you in English, French, or Kinyarwanda. Ask me anything about breast health!",
      from: 'bot',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const send = async (text) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now().toString(), text: text.trim(), from: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendMessage(text.trim());
      const botMsg = {
        id: (Date.now() + 1).toString(),
        text: res.response || res.message || "I'm not sure how to help with that. Try asking about self-exams, symptoms, risk factors, screening, or treatment.",
        from: 'bot',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: '😔 Sorry, I could not connect to the server. Please check your connection and try again.',
          from: 'bot',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.from === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && <Text style={styles.botAvatar}>🎀</Text>}
        <View style={[styles.msgBubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.msgText, isUser && styles.userText]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🎀</Text>
        <View>
          <Text style={styles.headerTitle}>Health Assistant</Text>
          <Text style={styles.headerSub}>EN · FR · RW</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            loading ? (
              <View style={styles.typingRow}>
                <Text style={styles.botAvatar}>🎀</Text>
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color={COLORS.pink} />
                  <Text style={styles.typingText}>Thinking...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Quick topics (show only if few messages) */}
        {messages.length <= 2 && (
          <View style={styles.quickContainer}>
            <FlatList
              data={QUICK_TOPICS}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickList}
              keyExtractor={(item) => item.msg}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.quickChip}
                  onPress={() => send(item.msg)}
                >
                  <Text style={styles.quickText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything..."
            placeholderTextColor={COLORS.gray400}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => send(input)}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendText}>💕</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 56,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerEmoji: { fontSize: 32 },
  headerTitle: {
    fontSize: SIZES.subtitle,
    ...FONTS.bold,
    color: COLORS.dark,
  },
  headerSub: {
    fontSize: SIZES.tiny,
    color: COLORS.gray500,
    ...FONTS.medium,
  },
  // Messages
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
    gap: 8,
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  botAvatar: { fontSize: 20, marginBottom: 4 },
  msgBubble: {
    maxWidth: '78%',
    borderRadius: 20,
    padding: 14,
  },
  botBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: COLORS.pink,
    borderBottomRightRadius: 6,
  },
  msgText: {
    fontSize: SIZES.body,
    color: COLORS.dark,
    ...FONTS.regular,
    lineHeight: 22,
  },
  userText: { color: COLORS.white },
  // Typing
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  typingBubble: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    color: COLORS.gray500,
    fontSize: SIZES.small,
    ...FONTS.medium,
  },
  // Quick topics
  quickContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    backgroundColor: COLORS.white,
  },
  quickList: {
    padding: 12,
    gap: 8,
  },
  quickChip: {
    backgroundColor: COLORS.pinkSoft,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.pinkLight,
  },
  quickText: {
    fontSize: SIZES.small,
    color: COLORS.pinkDark,
    ...FONTS.medium,
  },
  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.pinkSoft,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: SIZES.body,
    color: COLORS.dark,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.pinkLight,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.pink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendText: { fontSize: 20 },
});

export default ChatScreen;
