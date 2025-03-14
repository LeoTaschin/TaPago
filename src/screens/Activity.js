import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, moderateScale } from '../utils/dimensions';

// Componente para animar valores numéricos
const AnimatedValue = ({ value, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Anima o valor numérico
    Animated.timing(animatedValue, {
      toValue: value,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    // Anima o efeito de "pulse"
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Atualiza o valor mostrado durante a animação
    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(value.toFixed(2));
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value]);

  return (
    <Animated.Text 
      style={[
        style,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      R$ {displayValue}
    </Animated.Text>
  );
};

export function Activity({ userTotals, debtsAsCreditor, debtsAsDebtor, loading }) {
  const { colors, textStyles } = useTheme();
  
  const balance = userTotals.totalToReceive - userTotals.totalToPay;
  const totalFriendsWithDebts = new Set([
    ...debtsAsCreditor.map(debt => debt.debtorId),
    ...debtsAsDebtor.map(debt => debt.creditorId)
  ]).size;

  const largestDebt = Math.max(
    ...debtsAsCreditor.map(debt => debt.amount),
    ...debtsAsDebtor.map(debt => debt.amount),
    0
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[textStyles.h4, { color: colors.text, marginBottom: SPACING.md }]}>
        Atividade
      </Text>

      <View style={styles.summaryContainer}>
        <Animated.View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.summaryHeader}>
            <Ionicons name="arrow-down" size={16} color={colors.success} />
            <Text style={[textStyles.caption, { color: colors.text, marginLeft: 4 }]}>
              A receber
            </Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color={colors.success} style={styles.cardLoader} />
          ) : (
            <AnimatedValue 
              value={userTotals.totalToReceive}
              style={[textStyles.h3, { color: colors.success }]}
            />
          )}
        </Animated.View>

        <Animated.View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.summaryHeader}>
            <Ionicons name="arrow-up" size={16} color={colors.error} />
            <Text style={[textStyles.caption, { color: colors.text, marginLeft: 4 }]}>
              A pagar
            </Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color={colors.error} style={styles.cardLoader} />
          ) : (
            <AnimatedValue 
              value={userTotals.totalToPay}
              style={[textStyles.h3, { color: colors.error }]}
            />
          )}
        </Animated.View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <Ionicons name="people" size={16} color={colors.primary} />
          <Text style={[textStyles.caption, { color: colors.text, marginTop: 4 }]}>
            Amigos com dívidas
          </Text>
          <Text style={[textStyles.body, { color: colors.text }]}>
            {totalFriendsWithDebts}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <Ionicons name="trending-up" size={16} color={colors.primary} />
          <Text style={[textStyles.caption, { color: colors.text, marginTop: 4 }]}>
            Maior dívida
          </Text>
          <Text style={[textStyles.body, { color: colors.text }]}>
            R$ {largestDebt.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Aqui podemos adicionar mais conteúdo da aba de atividade */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
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
  cardLoader: {
    height: 30,
    marginTop: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: moderateScale(12),
    alignItems: 'center',
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
}); 