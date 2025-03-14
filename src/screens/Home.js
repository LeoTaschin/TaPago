import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text,
  Alert,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { BottomToolbar } from '../components/BottomToolbar';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '../components/Logo';
import { MainTabs } from '../components/MainTabs';
import { SPACING, moderateScale } from '../utils/dimensions';

export default function HomeScreen({ navigation }) {
  const { colors, textStyles } = useTheme();
  const { signOut: signOutAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSignOut = async () => {
    try {
      Alert.alert(
        'Sair',
        'Tem certeza que deseja sair?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: async () => {
              try {
                await signOut(auth);
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              } catch (error) {
                console.error('Erro ao fazer logout:', error);
                Alert.alert(
                  'Erro',
                  'Não foi possível fazer logout. Tente novamente.'
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao mostrar diálogo de logout:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.logoContainer}>
            <Logo size={32} />
          </View>
          <TouchableOpacity 
            onPress={handleSignOut}
            style={[styles.signOutButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={[textStyles.h4, styles.welcomeText, { color: colors.text }]}>
            Bem-vindo ao TaPago
          </Text>

          <View style={styles.tabsContainer}>
            <MainTabs activeTab={activeTab} />
          </View>
        </View>

        <BottomToolbar activeTab={activeTab} onTabChange={handleTabChange} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingTop: Platform.OS === 'ios' ? moderateScale(8) : SPACING.sm,
    paddingBottom: SPACING.sm,
    position: 'relative',
    borderBottomWidth: 1,
    height: Platform.OS === 'ios' ? moderateScale(44) : moderateScale(56),
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButton: {
    padding: SPACING.xs,
    borderRadius: moderateScale(8),
    position: 'absolute',
    right: SPACING.sm,
  },
  content: {
    flex: 1,
    paddingTop: SPACING.sm,
  },
  welcomeText: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  tabsContainer: {
    flex: 1,
    marginBottom: Platform.OS === 'ios' ? moderateScale(85) : moderateScale(65),
  },
}); 