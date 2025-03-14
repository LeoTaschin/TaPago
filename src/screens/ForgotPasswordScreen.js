import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  Text, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { auth } from '../config/firebase';
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const SPACING = 20;
const { height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const { colors, textStyles } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const navigation = useNavigation();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    setHasAttemptedSubmit(true);
    setEmailError('');

    if (!email) {
      setEmailError('O e-mail é obrigatório. Por favor, insira um e-mail válido.');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Por favor, insira um e-mail válido.');
      return;
    }

    try {
      setLoading(true);
      
      // Verifica se existe uma conta com este email
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      
      if (signInMethods.length === 0) {
        Alert.alert(
          'Conta não encontrada',
          'Não existe uma conta associada a este e-mail. Deseja criar uma nova conta?',
          [
            {
              text: 'Criar conta',
              onPress: () => {
                setEmail('');
                navigation.navigate('Register');
              }
            },
            {
              text: 'Cancelar',
              style: 'cancel'
            }
          ]
        );
        return;
      }

      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Email enviado com sucesso!',
        'Verifique sua caixa de entrada e siga as instruções para redefinir sua senha. Não esqueça de verificar sua pasta de spam.',
        [
          {
            text: 'OK',
            onPress: () => {
              setEmail('');
              navigation.navigate('Login');
            }
          }
        ]
      );
    } catch (error) {
      console.log('Erro ao enviar email:', error);
      
      switch (error.code) {
        case 'auth/invalid-email':
          setEmailError('O formato do e-mail é inválido.');
          break;
        case 'auth/user-not-found':
          Alert.alert(
            'Conta não encontrada',
            'Não existe uma conta associada a este e-mail. Deseja criar uma nova conta?',
            [
              {
                text: 'Criar conta',
                onPress: () => {
                  setEmail('');
                  navigation.navigate('Register');
                }
              },
              {
                text: 'Cancelar',
                style: 'cancel'
              }
            ]
          );
          break;
        case 'auth/too-many-requests':
          Alert.alert(
            'Muitas tentativas',
            'Por favor, aguarde alguns minutos antes de tentar novamente.'
          );
          break;
        case 'auth/network-request-failed':
          Alert.alert(
            'Erro de conexão',
            'Verifique sua conexão com a internet e tente novamente.'
          );
          break;
        default:
          Alert.alert(
            'Erro',
            'Ocorreu um erro ao enviar o email. Por favor, tente novamente mais tarde.'
          );
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputBorderColor = (hasError, isEmpty) => {
    if (hasAttemptedSubmit) {
      if (isEmpty) return colors.warning;
      if (hasError) return colors.error;
    }
    return colors.gray[300];
  };

  const getEmailErrorColor = (error) => {
    if (!error) return null;
    if (error === 'O e-mail é obrigatório. Por favor, insira um e-mail válido.') {
      return colors.warning;
    }
    return colors.error;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Logo size={height * 0.1} />
          </View>

          <View style={styles.mainContent}>
            <Text style={[textStyles.h4, { color: colors.text, marginBottom: SPACING }]}>
              Recupere sua senha
            </Text>
            
            <Text style={[textStyles.body, { color: colors.text, marginBottom: SPACING, textAlign: 'left' }]}>
              Digite seu e-mail cadastrado e enviaremos as instruções para redefinir sua senha.
            </Text>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={[textStyles.bodySmall, { color: colors.text }]}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.surface,
                      color: colors.text,
                      borderColor: getInputBorderColor(emailError, !email),
                    }
                  ]}
                  placeholder="Seu email"
                  placeholderTextColor={colors.gray[400]}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError('');
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
                {emailError ? (
                  <Text style={[styles.errorText, { color: getEmailErrorColor(emailError) }]}>{emailError}</Text>
                ) : null}
              </View>

              <Button
                title="Enviar instruções"
                onPress={handleResetPassword}
                style={{ marginTop: SPACING }}
                loading={loading}
              />

              <View style={styles.backContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={[textStyles.bodySmall, { color: colors.primary }]}>
                    Voltar para o login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING,
    paddingTop: 0,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.02,
    marginBottom: height * 0.03,
    minHeight: height * 0.12,
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: SPACING,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: SPACING,
    marginTop: SPACING / 2,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  backContainer: {
    alignItems: 'center',
    marginTop: SPACING,
  },
}); 