import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, moderateScale } from '../utils/dimensions';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useDebts } from '../hooks/useDebts';
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatCurrency } from '../utils/formatters';

export default function NewCharge() {
  const { colors, textStyles } = useTheme();
  const { user } = useAuth();
  const { addDebt, loading, error } = useDebts();
  const navigation = useNavigation();
  const route = useRoute();
  const selectedTarget = route.params?.selectedTarget;
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedTarget?.id) {
      navigation.goBack();
    }
  }, [selectedTarget, navigation]);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleAmountChange = (text) => {
    // Remove tudo exceto números e ponto
    const numericValue = text.replace(/[^0-9.]/g, '');
    
    // Garante que só há um ponto decimal
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limita casas decimais a 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setAmount(numericValue);
  };

  const handleCreate = async () => {
    if (!description.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma descrição');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido');
      return;
    }

    try {
      setSubmitting(true);
      const result = await addDebt(selectedTarget.id, parseFloat(amount), description.trim());
      
      if (result.success) {
        Alert.alert('Sucesso', 'Cobrança criada com sucesso', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(result.error || 'Erro ao criar cobrança');
      }
    } catch (err) {
      console.error('Erro ao criar cobrança:', err);
      Alert.alert('Erro', err.message || 'Não foi possível criar a cobrança');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || !selectedTarget) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={moderateScale(24)} color={colors.text} />
          </TouchableOpacity>
          <Text style={[textStyles.h3, { color: colors.text }]}>Nova Cobrança</Text>
          <TouchableOpacity 
            onPress={handleCreate}
            disabled={submitting || loading}
            style={[
              styles.createButton,
              { opacity: submitting || loading ? 0.7 : 1 }
            ]}
          >
            {submitting || loading ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Text style={[textStyles.button, { color: colors.text }]}>Criar</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent}>
          <View style={[styles.targetInfo, { backgroundColor: colors.cardBackground }]}>
            <Image
              source={{ uri: selectedTarget?.photoURL || 'https://via.placeholder.com/40' }}
              style={styles.avatar}
            />
            <View style={styles.targetDetails}>
              <Text style={[textStyles.h3, { color: colors.text }]}>
                {selectedTarget?.username}
              </Text>
              <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                {selectedTarget?.email}
              </Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[textStyles.label, { color: colors.text }]}>Descrição</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.cardBackground,
                  color: colors.text,
                  borderColor: colors.border
                }
              ]}
              placeholder="Ex: Almoço, Cinema, etc..."
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[textStyles.label, { color: colors.text }]}>Valor Total</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.cardBackground,
                  color: colors.text,
                  borderColor: colors.border
                }
              ]}
              placeholder="R$ 0,00"
              placeholderTextColor={colors.textSecondary}
              value={amount ? formatCurrency(amount) : ''}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  createButton: {
    minWidth: moderateScale(60),
    alignItems: 'center',
  },
  targetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: moderateScale(8),
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
  },
  targetDetails: {
    marginLeft: SPACING.md,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  input: {
    height: moderateScale(48),
    borderWidth: 1,
    borderRadius: moderateScale(8),
    paddingHorizontal: SPACING.md,
    fontSize: moderateScale(16),
    marginTop: SPACING.xs,
  },
}); 