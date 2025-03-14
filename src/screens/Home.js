import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  Text,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { BottomToolbar } from '../components/BottomToolbar';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '../components/Logo';
import { MainTabs } from '../components/MainTabs';

const SPACING = 20;

export default function HomeScreen({ navigation }) {
  const { colors, textStyles } = useTheme();
  const { signOut: signOutAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSignOut = async () => {
    try {
      // Mostra um diálogo de confirmação
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
                // Faz logout no Firebase
                await signOut(auth);
                // Navega para a tela de login
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
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Logo />
        </View>
        <TouchableOpacity 
          onPress={handleSignOut}
          style={[styles.signOutButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={[textStyles.h4, { color: colors.text, marginBottom: SPACING }]}>
            Bem-vindo ao TaPago
          </Text>

          <View style={styles.tabsContainer}>
            <MainTabs activeTab={activeTab} onTabChange={handleTabChange} />
          </View>
        </View>
      </ScrollView>

      <BottomToolbar activeTab={activeTab} onTabChange={handleTabChange} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING,
    paddingTop: Platform.OS === 'ios' ? 44 : SPACING,
    position: 'relative',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING * 2,
    height: 120,
    justifyContent: 'center',
  },
  signOutButton: {
    padding: SPACING / 2,
    borderRadius: 8,
    position: 'absolute',
    right: SPACING,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 90 : 70, // Add padding for bottom toolbar
  },
  content: {
    padding: SPACING,
  },
  tabsContainer: {
    flex: 1,
    height: 500, // Ajuste este valor conforme necessário
    marginTop: SPACING,
  },
}); 