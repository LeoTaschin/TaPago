import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeUser } from '../services/userService';

const USER_STORAGE_KEY = '@user_data';
const AUTH_CREDENTIALS_KEY = '@auth_credentials';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Usuário está autenticado
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };

        try {
          // Inicializar ou atualizar dados do usuário no Firestore
          await initializeUser(userData);
          setUser(userData);
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        } catch (error) {
          console.error('Erro ao inicializar usuário:', error);
          // Mesmo com erro na inicialização, mantemos o usuário logado
          setUser(userData);
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        }
      } else {
        // Usuário não está autenticado
        setUser(null);
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
        await AsyncStorage.removeItem(AUTH_CREDENTIALS_KEY);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const saveCredentials = async (email, password) => {
    try {
      await AsyncStorage.setItem(AUTH_CREDENTIALS_KEY, JSON.stringify({ email, password }));
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error);
    }
  };

  const reauthorizeUser = async () => {
    try {
      const credentials = await AsyncStorage.getItem(AUTH_CREDENTIALS_KEY);
      if (credentials) {
        const { email, password } = JSON.parse(credentials);
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error('Erro ao reautenticar:', error);
      await AsyncStorage.removeItem(AUTH_CREDENTIALS_KEY);
    }
  };

  return {
    user,
    loading,
    saveCredentials,
    reauthorizeUser,
  };
} 