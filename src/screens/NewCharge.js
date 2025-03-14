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

export default function NewCharge({ navigation, route }) {
  const { colors, textStyles } = useTheme();
  const { user } = useAuth();
  const { addDebt, loading } = useDebts(user?.uid);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const selectedTarget = route.params?.selectedTarget;

  useEffect(() => {
    if (!selectedTarget) {
      navigation.goBack();
    }
  }, [selectedTarget]);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleCreate = async () => {
    if (!description.trim()) {
      Alert.alert('Erro', 'Por favor, adicione uma descrição para a cobrança.');
      return;
    }

    const numericAmount = parseFloat(amount.replace('R$', '').replace(',', '.').trim());
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Erro', 'Por favor, adicione um valor válido.');
      return;
    }

    try {
      const result = await addDebt(selectedTarget.uid, numericAmount, description);

      if (!result.success) {
        Alert.alert('Erro', 'Não foi possível criar a cobrança. Por favor, tente novamente.');
        return;
      }

      Alert.alert('Sucesso', 'Cobrança criada com sucesso!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (error) {
      console.error('Error creating charge:', error);
      Alert.alert('Erro', 'Não foi possível criar a cobrança. Por favor, tente novamente.');
    }
  };

  const formatCurrency = (text) => {
    // Remove tudo exceto números
    const numbers = text.replace(/\D/g, '');
    
    // Se não houver números, retorna vazio
    if (numbers === '') return '';
    
    // Converte para centavos
    const cents = parseInt(numbers);
    
    // Formata o número
    const formatted = (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
    
    return formatted;
  };

  const handleAmountChange = (text) => {
    // Se o usuário apagou tudo, limpa o campo
    if (!text) {
      setAmount('');
      return;
    }

    // Formata o valor
    const formatted = formatCurrency(text);
    setAmount(formatted);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name="close" size={moderateScale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[textStyles.h2, { color: colors.text }]}>Nova Cobrança</Text>
        <TouchableOpacity 
          onPress={handleCreate}
          disabled={loading}
          style={[
            styles.createButton,
            { opacity: loading ? 0.7 : 1 }
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Text style={[textStyles.button, { color: colors.text }]}>Criar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
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
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  createButton: {
    minWidth: moderateScale(60),
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
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