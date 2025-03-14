import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, Dimensions, Keyboard } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/Button';
import { auth, db } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { Logo } from '../components/Logo';
import { doc, getDoc } from 'firebase/firestore';
import { SPACING, moderateScale } from '../utils/dimensions';

export default function AccountConfirmation({ navigation }) {
  const { colors, textStyles } = useTheme();
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Desativa o teclado quando a tela é montada
    Keyboard.dismiss();
    
    const fetchUsername = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      }
    };
    fetchUsername();

    // Adiciona listeners para garantir que o teclado permaneça fechado
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        Keyboard.dismiss();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const user = auth.currentUser;
  const userProfilePic = user?.photoURL || 'default_profile_pic_url';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.logoContainer}>
        <Logo size={40} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.welcomeContainer}>
          <Text style={[textStyles.h3, { color: colors.text }]}>
            Bem-vindo ao TaPago!
          </Text>
          <Text style={[textStyles.subText, { color: colors.text, textAlign: 'center', marginTop: SPACING.sm }]}>
            Divida contas e faça pagamentos com amigos de forma simples.
          </Text>
        </View>

        <View style={styles.profileContainer}>
          <Image 
            source={{ uri: userProfilePic }} 
            style={[styles.profilePic, { borderColor: colors.primary }]} 
          />
          <Text style={[textStyles.body, { color: colors.text, marginTop: SPACING.sm }]}>
            Olá, {username || 'Usuário'}
          </Text>
          <Text style={[textStyles.bodySmall, { color: colors.primary, marginTop: SPACING.xs }]}>
            Comece a usar o TaPago agora!
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            title="Vamos começar!" 
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            })}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    height: moderateScale(44),
    justifyContent: 'center',
    paddingTop: SPACING.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  profileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  profilePic: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    borderWidth: moderateScale(2),
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
}); 