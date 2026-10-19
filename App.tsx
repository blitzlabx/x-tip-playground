import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#0B0E14',
  surface: '#12151C',
  surface2: '#1A1D27',
  surface3: '#222633',
  border: '#2A2F3D',
  text: '#E8EAED',
  textMuted: '#8B92A5',
  textDim: '#5C6370',
  accent: '#5865F2',
  accent2: '#25D366',
  accent3: '#2AABEE',
  danger: '#ED4245',
  online: '#3BA55D',
};

const SERVERS = [
  { id: '1', name: 'Blitz HQ', icon: '⚡', color: '#5865F2' },
  { id: '2', name: 'Dev Lounge', icon: '💻', color: '#57F287' },
  { id: '3', name: 'Anime Club', icon: '🌸', color: '#EB459E' },
  { id: '4', name: 'Gaming', icon: '🎮', color: '#FEE75C' },
  { id: '5', name: 'Music', icon: '🎵', color: '#2AABEE' },
];

const CHANNELS = [
  { id: 'c1', name: 'general', type: 'text', unread: 3 },
  { id: 'c2', name: 'announcements', type: 'text', unread: 0 },
  { id: 'c3', name: 'dev-chat', type: 'text', unread: 12 },
  { id: 'c4', name: 'Voice Lounge', type: 'voice', unread: 0 },
  { id: 'c5', name: 'music-bot', type: 'voice', unread: 0 },
];

const CHATS = [
  { id: '1', name: 'Blitz Lab', lastMessage: 'The new UI looks fire 🔥', time: '2:41 PM', unread: 4, avatar: 'BL', color: '#5865F2', online: true, platform: 'discord' },
  { id: '2', name: 'Sarah Chen', lastMessage: 'Can you send the designs?', time: '1:18 PM', unread: 0, avatar: 'SC', color: '#25D366', online: true, platform: 'whatsapp' },
  { id: '3', name: 'Telegram Dev Group', lastMessage: 'New bot update available', time: '12:05 PM', unread: 9, avatar: 'TG', color: '#2AABEE', online: false, platform: 'telegram' },
  { id: '4', name: 'Alex Rivera', lastMessage: 'Meeting at 4?', time: 'Yesterday', unread: 0, avatar: 'AR', color: '#ED4245', online: false, platform: 'whatsapp' },
  { id: '5', name: 'Design Squad', lastMessage: 'Check the latest Figma', time: 'Yesterday', unread: 2, avatar: 'DS', color: '#FEE75C', online: true, platform: 'discord' },
  { id: '6', name: 'Mom', lastMessage: 'Call me when free ❤️', time: 'Mon', unread: 0, avatar: 'M', color: '#EB459E', online: true, platform: 'whatsapp' },
];

const MESSAGES: Record<string, any[]> = {
  '1': [
    { id: 'm1', text: 'Yo, the new playground is looking insane', time: '2:30 PM', me: false, name: 'Kai' },
    { id: 'm2', text: 'Fr. The glass effects + Discord sidebar combo hits different', time: '2:32 PM', me: true },
    { id: 'm3', text: 'We should add voice channels next', time: '2:35 PM', me: false, name: 'Kai' },
    { id: 'm4', text: 'Already on the roadmap 🔥 The new UI looks fire', time: '2:41 PM', me: true },
  ],
  '2': [
    { id: 'm1', text: 'Hey! Did you finish the mockups?', time: '1:10 PM', me: false, name: 'Sarah' },
    { id: 'm2', text: 'Almost done. Sending in 10 mins', time: '1:12 PM', me: true },
    { id: 'm3', text: 'Can you send the designs?', time: '1:18 PM', me: false, name: 'Sarah' },
  ],
  '3': [
    { id: 'm1', text: 'Bot v2.4 is live', time: '11:50 AM', me: false, name: 'System' },
    { id: 'm2', text: 'New bot update available', time: '12:05 PM', me: false, name: 'Admin' },
  ],
};

function Avatar({ initials, color, size = 48, online }: { initials: string; color: string; size?: number; online?: boolean }) {
  return (
    <View style={{ width: size, height: size }}>
      <LinearGradient colors={[color, color + '99']} style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{initials}</Text>
      </LinearGradient>
      {online && <View style={[styles.onlineDot, { width: size * 0.28, height: size * 0.28, borderRadius: size * 0.14, right: 0, bottom: 0 }]} />}
    </View>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  const config: any = {
    discord: { icon: 'discord', color: COLORS.accent, lib: 'MaterialCommunityIcons' },
    whatsapp: { icon: 'whatsapp', color: COLORS.accent2, lib: 'FontAwesome5' },
    telegram: { icon: 'telegram', color: COLORS.accent3, lib: 'FontAwesome5' },
  };
  const c = config[platform] || config.discord;
  const IconComp = c.lib === 'MaterialCommunityIcons' ? MaterialCommunityIcons : FontAwesome5;
  return (
    <View style={[styles.platformBadge, { backgroundColor: c.color + '22' }]}>
      <IconComp name={c.icon as any} size={10} color={c.color} />
    </View>
  );
}

function ChatsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSub}>Discord · WhatsApp · Telegram</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="search" size={20} color={COLORS.text} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="create-outline" size={20} color={COLORS.text} /></TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}>
        <TouchableOpacity style={styles.storyItem}>
          <LinearGradient colors={[COLORS.accent, COLORS.accent2]} style={styles.storyRing}>
            <View style={styles.storyInner}><Ionicons name="add" size={22} color={COLORS.text} /></View>
          </LinearGradient>
          <Text style={styles.storyLabel}>Status</Text>
        </TouchableOpacity>
        {CHATS.slice(0, 5).map((c) => (
          <TouchableOpacity key={c.id} style={styles.storyItem}>
            <LinearGradient colors={[c.color, c.color + '88']} style={styles.storyRing}>
              <View style={styles.storyInner}><Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{c.avatar}</Text></View>
            </LinearGradient>
            <Text style={styles.storyLabel} numberOfLines={1}>{c.name.split(' ')[0]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={CHATS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatRow} activeOpacity={0.7} onPress={() => navigation.navigate('Chat', { chat: item })}>
            <Avatar initials={item.avatar} color={item.color} online={item.online} />
            <View style={styles.chatContent}>
              <View style={styles.chatTop}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.chatName}>{item.name}</Text>
                  <PlatformBadge platform={item.platform} />
                </View>
                <Text style={styles.chatTime}>{item.time}</Text>
              </View>
              <View style={styles.chatBottom}>
                <Text style={styles.chatPreview} numberOfLines={1}>{item.lastMessage}</Text>
                {item.unread > 0 && <View style={styles.unreadBadge}><Text style={styles.unreadText}>{item.unread}</Text></View>}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function ChatScreen({ route, navigation }: any) {
  const { chat } = route.params;
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState(MESSAGES[chat.id] || []);
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);

  const send = () => {
    if (!input.trim()) return;
    setMsgs((prev) => [...prev, { id: Date.now().toString(), text: input.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), me: true }]);
    setInput('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="chevron-back" size={24} color={COLORS.text} /></TouchableOpacity>
        <Avatar initials={chat.avatar} color={chat.color} size={40} online={chat.online} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.chatHeaderName}>{chat.name}</Text>
          <Text style={styles.chatHeaderStatus}>{chat.online ? 'online' : 'last seen recently'}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}><Ionicons name="call-outline" size={20} color={COLORS.text} /></TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}><Ionicons name="videocam-outline" size={22} color={COLORS.text} /></TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={msgs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <View style={[styles.bubbleRow, item.me ? styles.bubbleRowMe : styles.bubbleRowThem]}>
            {!item.me && item.name && <Text style={styles.senderName}>{item.name}</Text>}
            <View style={[styles.bubble, item.me ? styles.bubbleMe : styles.bubbleThem]}>
              <Text style={styles.bubbleText}>{item.text}</Text>
              <Text style={[styles.bubbleTime, item.me && { color: 'rgba(255,255,255,0.6)' }]}>{item.time}</Text>
            </View>
          </View>
        )}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity style={styles.attachBtn}><Ionicons name="add-circle" size={28} color={COLORS.accent} /></TouchableOpacity>
          <View style={styles.inputWrap}>
            <TextInput style={styles.input} placeholder="Message..." placeholderTextColor={COLORS.textDim} value={input} onChangeText={setInput} multiline />
            <TouchableOpacity><Ionicons name="happy-outline" size={22} color={COLORS.textMuted} /></TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.sendBtn} onPress={send}>
            <LinearGradient colors={[COLORS.accent, COLORS.accent3]} style={styles.sendGradient}><Ionicons name="send" size={18} color="#fff" /></LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function ServersScreen() {
  const insets = useSafeAreaInsets();
  const [activeServer, setActiveServer] = useState(SERVERS[0]);
  return (
    <View style={[styles.screen, { flexDirection: 'row', paddingTop: insets.top }]}>
      <View style={styles.serverRail}>
        <TouchableOpacity style={styles.serverItem}>
          <LinearGradient colors={[COLORS.accent, COLORS.accent2]} style={styles.serverIcon}><Ionicons name="home" size={20} color="#fff" /></LinearGradient>
        </TouchableOpacity>
        <View style={styles.serverDivider} />
        {SERVERS.map((s) => (
          <TouchableOpacity key={s.id} style={styles.serverItem} onPress={() => setActiveServer(s)}>
            <View style={[styles.serverIcon, { backgroundColor: s.color + '33' }, activeServer.id === s.id && { borderWidth: 2, borderColor: s.color }]}>
              <Text style={{ fontSize: 18 }}>{s.icon}</Text>
            </View>
            {activeServer.id === s.id && <View style={[styles.serverPill, { backgroundColor: s.color }]} />}
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.serverItem}>
          <View style={[styles.serverIcon, { backgroundColor: COLORS.surface3 }]}><Ionicons name="add" size={22} color={COLORS.textMuted} /></View>
        </TouchableOpacity>
      </View>
      <View style={styles.channelPanel}>
        <LinearGradient colors={[activeServer.color + '44', 'transparent']} style={styles.serverBanner}>
          <Text style={styles.serverName}>{activeServer.name}</Text>
        </LinearGradient>
        <Text style={styles.channelSection}>TEXT CHANNELS</Text>
        {CHANNELS.filter(c => c.type === 'text').map((c) => (
          <TouchableOpacity key={c.id} style={styles.channelRow}>
            <Text style={{ fontSize: 18, color: COLORS.textMuted, fontWeight: '700' }}>#</Text>
            <Text style={styles.channelName}>{c.name}</Text>
            {c.unread > 0 && <View style={styles.channelUnread}><Text style={styles.channelUnreadText}>{c.unread}</Text></View>}
          </TouchableOpacity>
        ))}
        <Text style={[styles.channelSection, { marginTop: 16 }]}>VOICE CHANNELS</Text>
        {CHANNELS.filter(c => c.type === 'voice').map((c) => (
          <TouchableOpacity key={c.id} style={styles.channelRow}>
            <Ionicons name="volume-medium" size={18} color={COLORS.textMuted} />
            <Text style={styles.channelName}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function StatusScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
      <LinearGradient colors={[COLORS.accent + '33', COLORS.accent2 + '22']} style={styles.emptyCard}>
        <Ionicons name="radio-outline" size={48} color={COLORS.accent} />
        <Text style={styles.emptyTitle}>Status & Stories</Text>
        <Text style={styles.emptySub}>WhatsApp-style status + Telegram stories coming soon in this playground</Text>
      </LinearGradient>
    </View>
  );
}

function ProfileScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={{ alignItems: 'center', paddingTop: 40 }}>
        <LinearGradient colors={[COLORS.accent, COLORS.accent2]} style={styles.profileAvatar}>
          <Text style={{ fontSize: 36, fontWeight: '800', color: '#fff' }}>B</Text>
        </LinearGradient>
        <Text style={styles.profileName}>Blitz</Text>
        <Text style={styles.profileHandle}>@ultrablitz · X-Tip Playground</Text>
        <View style={styles.profileStats}>
          <View style={styles.stat}><Text style={styles.statNum}>12</Text><Text style={styles.statLabel}>Servers</Text></View>
          <View style={styles.stat}><Text style={styles.statNum}>48</Text><Text style={styles.statLabel}>Chats</Text></View>
          <View style={styles.stat}><Text style={styles.statNum}>3</Text><Text style={styles.statLabel}>Platforms</Text></View>
        </View>
        <View style={styles.profileCard}>
          <Text style={styles.profileCardTitle}>About this Playground</Text>
          <Text style={styles.profileCardText}>A premium UI experiment combining Discord servers, WhatsApp chats, and Telegram aesthetics into one sleek Android experience.</Text>
        </View>
      </View>
    </View>
  );
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ChatsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: COLORS.bg } }}>
      <Stack.Screen name="ChatsList" component={ChatsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: COLORS.accent,
      tabBarInactiveTintColor: COLORS.textDim,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
    }}>
      <Tab.Screen name="Chats" component={ChatsStack} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} /> }} />
      <Tab.Screen name="Servers" component={ServersScreen} options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name={"discord" as any} size={size} color={color} /> }} />
      <Tab.Screen name="Status" component={StatusScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="radio" size={size} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={{
        ...DarkTheme,
        colors: { ...DarkTheme.colors, background: COLORS.bg, card: COLORS.surface, text: COLORS.text, border: COLORS.border, primary: COLORS.accent },
      }}>
        <StatusBar style="light" />
        <MainTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface2, alignItems: 'center', justifyContent: 'center' },
  storiesRow: { maxHeight: 100, marginBottom: 8 },
  storyItem: { alignItems: 'center', width: 64 },
  storyRing: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', padding: 3 },
  storyInner: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  storyLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 6 },
  chatRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 14 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700' },
  onlineDot: { position: 'absolute', backgroundColor: COLORS.online, borderWidth: 2.5, borderColor: COLORS.bg },
  chatContent: { flex: 1, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border, paddingBottom: 12 },
  chatTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chatName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  chatTime: { fontSize: 12, color: COLORS.textDim },
  chatBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatPreview: { fontSize: 14, color: COLORS.textMuted, flex: 1, marginRight: 8 },
  unreadBadge: { backgroundColor: COLORS.accent, minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  platformBadge: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  chatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 4 },
  backBtn: { padding: 4 },
  chatHeaderName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  chatHeaderStatus: { fontSize: 12, color: COLORS.online },
  bubbleRow: { marginBottom: 10, maxWidth: '80%' },
  bubbleRowMe: { alignSelf: 'flex-end' },
  bubbleRowThem: { alignSelf: 'flex-start' },
  senderName: { fontSize: 12, color: COLORS.accent, marginBottom: 2, marginLeft: 4, fontWeight: '600' },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleMe: { backgroundColor: COLORS.accent, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: COLORS.surface2, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, color: COLORS.text, lineHeight: 21 },
  bubbleTime: { fontSize: 10, color: COLORS.textDim, alignSelf: 'flex-end', marginTop: 4 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingTop: 10, gap: 8, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.surface },
  attachBtn: { marginBottom: 6 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface2, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  input: { flex: 1, fontSize: 15, color: COLORS.text, maxHeight: 100 },
  sendBtn: { marginBottom: 4 },
  sendGradient: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  serverRail: { width: 72, backgroundColor: COLORS.bg, alignItems: 'center', paddingTop: 8, gap: 8 },
  serverItem: { alignItems: 'center', position: 'relative' },
  serverIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  serverPill: { position: 'absolute', left: -14, width: 4, height: 28, borderRadius: 2 },
  serverDivider: { width: 32, height: 2, backgroundColor: COLORS.border, marginVertical: 4 },
  channelPanel: { flex: 1, backgroundColor: COLORS.surface, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  serverBanner: { height: 80, justifyContent: 'flex-end', padding: 16 },
  serverName: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  channelSection: { fontSize: 11, fontWeight: '700', color: COLORS.textDim, letterSpacing: 0.8, paddingHorizontal: 16, marginTop: 12, marginBottom: 6 },
  channelRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  channelName: { fontSize: 15, color: COLORS.textMuted, flex: 1 },
  channelUnread: { backgroundColor: COLORS.danger, minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  channelUnreadText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  emptyCard: { width: width - 48, padding: 32, borderRadius: 24, alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  emptySub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  profileAvatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  profileName: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginTop: 16 },
  profileHandle: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  profileStats: { flexDirection: 'row', gap: 32, marginTop: 28 },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  profileCard: { marginTop: 32, marginHorizontal: 24, backgroundColor: COLORS.surface2, borderRadius: 16, padding: 20 },
  profileCardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  profileCardText: { fontSize: 14, color: COLORS.textMuted, lineHeight: 21 },
  tabBar: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border, borderTopWidth: 1, height: 64, paddingTop: 6 },
});
