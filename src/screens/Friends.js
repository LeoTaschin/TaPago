import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, moderateScale } from '../utils/dimensions';
import { db, auth } from '../config/firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export function Friends() {
  const { colors, textStyles } = useTheme();
  const [searchUsername, setSearchUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const searchUser = async () => {
    if (!searchUsername.trim()) {
      Alert.alert('Erro', 'Digite um apelido para buscar');
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Erro', 'Você precisa estar logado');
        return;
      }

      // Busca o usuário pelo username
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where('username', '==', searchUsername.trim()),
        where('createdAt', '>', new Date(0)) // Isso forçará o Firebase a mostrar o link do índice
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Usuário não encontrado', 'Nenhum usuário encontrado com este apelido');
        return;
      }

      const foundUser = querySnapshot.docs[0];
      
      // Não permitir adicionar a si mesmo
      if (foundUser.id === currentUser.uid) {
        Alert.alert('Erro', 'Você não pode adicionar a si mesmo como amigo');
        return;
      }

      // Verifica se já é amigo
      const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const currentUserData = currentUserDoc.data();
      
      if (currentUserData?.friends?.includes(foundUser.id)) {
        Alert.alert('Erro', 'Este usuário já é seu amigo');
        return;
      }

      // Adiciona o amigo
      Alert.alert(
        'Adicionar Amigo',
        `Deseja adicionar ${foundUser.data().username || 'usuário'} como amigo?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Adicionar',
            onPress: async () => {
              try {
                // Adiciona o ID do amigo na lista de amigos do usuário atual
                await updateDoc(doc(db, 'users', currentUser.uid), {
                  friends: arrayUnion(foundUser.id)
                });

                // Adiciona o ID do usuário atual na lista de amigos do outro usuário
                await updateDoc(doc(db, 'users', foundUser.id), {
                  friends: arrayUnion(currentUser.uid)
                });

                Alert.alert('Sucesso', 'Amigo adicionado com sucesso!');
                setSearchUsername('');
              } catch (error) {
                console.error('Erro ao adicionar amigo:', error);
                Alert.alert('Erro', 'Não foi possível adicionar o amigo');
              }
            },
          },
        ]
      );

    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      Alert.alert('Erro', 'Não foi possível buscar o usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.searchContainer}>
              <TextInput
                style={[styles.searchInput, { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Buscar amigo por apelido..."
                placeholderTextColor={colors.text2}
                value={searchUsername}
                onChangeText={setSearchUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={searchUser}
                enablesReturnKeyAutomatically={true}
              />
              <TouchableOpacity 
                style={[styles.searchButton, { backgroundColor: colors.primary }]}
                onPress={searchUser}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Ionicons name="search" size={24} color={colors.white} />
                )}
              </TouchableOpacity>
            </View>

            <View style={[styles.content, { borderColor: colors.border }]}>
              <Text style={[textStyles.h3, { color: colors.primary }]}>
                Meus Amigos
              </Text>
              
              <Text style={[textStyles.body, { color: colors.text2, marginTop: SPACING.md, textAlign: 'center' }]}>
                Busque e adicione amigos usando o campo de busca acima
              </Text>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    height: moderateScale(48),
    borderWidth: 1,
    borderRadius: moderateScale(10),
    paddingHorizontal: SPACING.md,
    fontSize: moderateScale(16),
    marginRight: SPACING.sm,
  },
  searchButton: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: moderateScale(15),
  },
}); 