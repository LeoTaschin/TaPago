import React, { useState, useEffect } from 'react';
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
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useDebts } from '../hooks/useDebts';
import { BottomToolbar } from '../components/BottomToolbar';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '../components/Logo';
import { MainTabs } from '../components/MainTabs';
import { SPACING, moderateScale } from '../utils/dimensions';

export default function HomeScreen({ navigation }) {
  const { colors, textStyles } = useTheme();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');
  const { 
    debtsAsCreditor, 
    debtsAsDebtor, 
    userTotals, 
    loading, 
    error,
    fetchDebts 
  } = useDebts(user?.uid);

  useEffect(() => {
    console.log('Home - useEffect - user:', user?.uid);
    fetchDebts();
  }, [fetchDebts]);

  const handleTabChange = (tab) => {
    if (tab === 'new') {
      if (!user) {
        console.log('Home - handleTabChange - Usuário não autenticado');
        navigation.navigate('Login');
        return;
      }
      console.log('Home - handleTabChange - Navegando para SelectDebtTarget');
      navigation.navigate('SelectDebtTarget');
      return;
    }
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
                await signOut();
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

  const renderDebtsSummary = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={[textStyles.body, { color: colors.error }]}>{error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.summaryHeader}>
            <Ionicons name="arrow-down" size={16} color={colors.success} />
            <Text style={[textStyles.caption, { color: colors.text, marginLeft: 4 }]}>
              A receber
            </Text>
          </View>
          <Text style={[textStyles.h3, { color: colors.success }]}>
            R$ {userTotals.totalToReceive.toFixed(2)}
          </Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.summaryHeader}>
            <Ionicons name="arrow-up" size={16} color={colors.error} />
            <Text style={[textStyles.caption, { color: colors.text, marginLeft: 4 }]}>
              A pagar
            </Text>
          </View>
          <Text style={[textStyles.h3, { color: colors.error }]}>
            R$ {userTotals.totalToPay.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} />
      <View style={styles.header}>
        <Logo size={moderateScale(40)} />
        <TouchableOpacity onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={moderateScale(24)} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {renderDebtsSummary()}
        <MainTabs 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          debtsAsCreditor={debtsAsCreditor}
          debtsAsDebtor={debtsAsDebtor}
          loading={loading}
          error={error}
        />
      </View>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  content: {
    flex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  summaryCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: moderateScale(12),
    marginHorizontal: SPACING.xs,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  errorContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
}); 