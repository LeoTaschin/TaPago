import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeUser } from '../services/userService';

const USER_STORAGE_KEY = '@user_data';
const AUTH_CREDENTIALS_KEY = '@auth_credentials';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para reautenticar o usuário
  const reauthorizeUser = async () => {
    try {
      console.log('useAuth - reauthorizeUser - Iniciando reautenticação');
      const credentials = await AsyncStorage.getItem(AUTH_CREDENTIALS_KEY);
      if (credentials) {
        console.log('useAuth - reauthorizeUser - Credenciais encontradas, tentando reautenticar');
        const { email, password } = JSON.parse(credentials);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('useAuth - reauthorizeUser - Reautenticação bem-sucedida:', userCredential.user.uid);
        return true;
      }
      console.log('useAuth - reauthorizeUser - Nenhuma credencial encontrada');
      return false;
    } catch (error) {
      console.error('useAuth - reauthorizeUser - Erro ao reautenticar:', error);
      return false;
    }
  };

  useEffect(() => {
    let unsubscribe;
    let mounted = true;
    let reauthorizing = false;
    
    const initAuth = async () => {
      try {
        console.log('useAuth - initAuth - Iniciando');
        
        // Carregar dados do usuário do AsyncStorage
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (storedUser && mounted) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('useAuth - initAuth - Dados do usuário carregados do storage:', userData.uid);
        }

        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          console.log('useAuth - onAuthStateChanged - Estado mudou:', {
            firebaseUid: firebaseUser?.uid,
            reauthorizing,
            mounted
          });
          
          if (firebaseUser && mounted) {
            // Usuário está autenticado
            const userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            };

            try {
              // Inicializar ou atualizar dados do usuário no Firestore
              await initializeUser(userData);
              setUser(userData);
              await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
              console.log('useAuth - onAuthStateChanged - Usuário autenticado e dados salvos:', userData.uid);
            } catch (error) {
              console.error('useAuth - onAuthStateChanged - Erro ao inicializar usuário:', error);
              // Mesmo com erro na inicialização, mantemos o usuário logado
              setUser(userData);
              await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
            }
          } else if (!firebaseUser && mounted && !reauthorizing) {
            // Usuário não está autenticado e não está em processo de reautenticação
            console.log('useAuth - onAuthStateChanged - Usuário não autenticado, tentando reautenticar');
            reauthorizing = true;
            
            try {
              const reauthed = await reauthorizeUser();
              if (!reauthed && mounted) {
                console.log('useAuth - onAuthStateChanged - Reautenticação falhou, limpando dados');
                setUser(null);
                await AsyncStorage.multiRemove([USER_STORAGE_KEY, AUTH_CREDENTIALS_KEY]);
              } else {
                console.log('useAuth - onAuthStateChanged - Reautenticação bem-sucedida');
              }
            } finally {
              reauthorizing = false;
            }
          }

          if (mounted) {
            setLoading(false);
            console.log('useAuth - onAuthStateChanged - Estado final:', {
              isAuthenticated: !!firebaseUser,
              uid: firebaseUser?.uid,
              loading: false,
              reauthorizing
            });
          }
        });
      } catch (error) {
        console.error('useAuth - initAuth - Erro:', error);
        if (mounted) setLoading(false);
      }
    };

    initAuth();
    
    return () => {
      console.log('useAuth - cleanup - Desmontando hook');
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const saveCredentials = async (email, password) => {
    try {
      await AsyncStorage.setItem(AUTH_CREDENTIALS_KEY, JSON.stringify({ email, password }));
      console.log('useAuth - saveCredentials - Credenciais salvas com sucesso');
    } catch (error) {
      console.error('useAuth - saveCredentials - Erro ao salvar credenciais:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('useAuth - signOut - Iniciando processo de logout');
      
      // Primeiro limpar os dados locais
      console.log('useAuth - signOut - Limpando dados locais');
      await AsyncStorage.multiRemove([USER_STORAGE_KEY, AUTH_CREDENTIALS_KEY]);
      
      // Depois fazer o logout no Firebase
      console.log('useAuth - signOut - Fazendo logout no Firebase');
      await auth.signOut();
      
      // Por fim, atualizar o estado
      console.log('useAuth - signOut - Atualizando estado');
      setUser(null);
      
      console.log('useAuth - signOut - Logout concluído com sucesso');
    } catch (error) {
      console.error('useAuth - signOut - Erro ao fazer logout:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    saveCredentials,
    reauthorizeUser,
    signOut,
  };
} 