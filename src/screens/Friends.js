import React, { useState, useEffect, useRef } from 'react';
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
  Image,
  FlatList,
  Modal,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, moderateScale } from '../utils/dimensions';
import { db, auth } from '../config/firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export function Friends() {
  const { colors, textStyles } = useTheme();
  const [searchUsername, setSearchUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    initializeUserData();
    fetchFriends();
  }, []);

  const initializeUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      if (!userDoc.exists()) {
        // Se o documento não existe, cria com dados básicos
        await setDoc(doc(db, 'users', currentUser.uid), {
          uid: currentUser.uid,
          email: currentUser.email,
          username: currentUser.email.split('@')[0].toLowerCase(), // Username básico do email
          photoURL: currentUser.photoURL,
          friends: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Se existe mas falta algum campo, atualiza
        const userData = userDoc.data();
        const updates = {};

        if (!userData.friends) updates.friends = [];
        if (!userData.username) updates.username = currentUser.email.split('@')[0].toLowerCase();
        if (!userData.createdAt) updates.createdAt = serverTimestamp();
        if (!userData.updatedAt) updates.updatedAt = serverTimestamp();
        if (!userData.photoURL && currentUser.photoURL) updates.photoURL = currentUser.photoURL;

        if (Object.keys(updates).length > 0) {
          await updateDoc(doc(db, 'users', currentUser.uid), updates);
        }

        // Se o username não está registrado na coleção usernames, registra
        if (userData.username) {
          const usernameDoc = await getDoc(doc(db, 'usernames', userData.username));
          if (!usernameDoc.exists()) {
            await setDoc(doc(db, 'usernames', userData.username), {
              uid: currentUser.uid
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar dados do usuário:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      
      if (!userData?.friends?.length) {
        setFriends([]);
        setLoadingFriends(false);
        return;
      }

      const friendsData = [];
      for (const friendId of userData.friends) {
        const friendDoc = await getDoc(doc(db, 'users', friendId));
        if (friendDoc.exists()) {
          friendsData.push({
            id: friendDoc.id,
            ...friendDoc.data()
          });
        }
      }

      setFriends(friendsData);
    } catch (error) {
      console.error('Erro ao buscar amigos:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus amigos');
    } finally {
      setLoadingFriends(false);
    }
  };

  const searchUser = async (username) => {
    if (!username.trim()) {
      setSearchResults(null);
      setSearchError('');
      return;
    }

    setLoading(true);
    setSearchError('');
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setSearchError('Você precisa estar logado');
        return;
      }

      const usersRef = collection(db, 'users');
      const searchTerm = username.trim().toLowerCase();
      
      // Busca todos os usuários para fazer filtragem local
      const querySnapshot = await getDocs(usersRef);

      if (querySnapshot.empty) {
        setSearchResults(null);
        setSearchError('Nenhum usuário encontrado');
        return;
      }

      const foundUsers = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(user => 
          // Filtra usuários que contêm o termo de busca no username
          user.username?.toLowerCase().includes(searchTerm) &&
          // Não mostra o usuário atual
          user.id !== currentUser.uid && 
          // Não mostra usuários que já são amigos
          !friends.some(friend => friend.id === user.id)
        );

      if (foundUsers.length === 0) {
        setSearchResults(null);
        setSearchError('Usuário não encontrado ou já é seu amigo');
        return;
      }

      setSearchResults(foundUsers);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      setSearchError('Erro ao buscar usuário');
    } finally {
      setLoading(false);
    }
  };

  const showCustomAlert = () => {
    setShowSuccessAlert(true);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.3);
    
    Animated.parallel([
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        })
      ]),
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(scaleAnim, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        })
      ])
    ]).start(() => {
      setShowSuccessAlert(false);
    });
  };

  const addFriend = async (user) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      await updateDoc(doc(db, 'users', currentUser.uid), {
        friends: arrayUnion(user.id)
      });

      await updateDoc(doc(db, 'users', user.id), {
        friends: arrayUnion(currentUser.uid)
      });

      setSearchUsername('');
      setSearchResults(null);
      setIsSearchModalVisible(false);
      fetchFriends();
      showCustomAlert();
    } catch (error) {
      console.error('Erro ao adicionar amigo:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o amigo');
    }
  };

  const removeFriend = async (friendId) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Remove friend from current user's friends list
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const updatedFriends = userDoc.data().friends.filter(id => id !== friendId);
      await updateDoc(userRef, { friends: updatedFriends });

      // Remove current user from friend's friends list
      const friendRef = doc(db, 'users', friendId);
      const friendDoc = await getDoc(friendRef);
      const updatedFriendFriends = friendDoc.data().friends.filter(id => id !== currentUser.uid);
      await updateDoc(friendRef, { friends: updatedFriendFriends });

      // Refresh friends list
      fetchFriends();
    } catch (error) {
      console.error('Erro ao remover amigo:', error);
      Alert.alert('Erro', 'Não foi possível remover o amigo');
    }
  };

  const handleRemoveFriend = (friend) => {
    Alert.alert(
      'Remover amigo',
      `Tem certeza que deseja remover ${friend.username} da sua lista de amigos?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeFriend(friend.id)
        }
      ]
    );
  };

  const renderFriendItem = ({ item }) => (
    <View style={[styles.friendItem, { backgroundColor: colors.card }]}>
      <Image 
        source={{ uri: item.photoURL }} 
        style={styles.friendPhoto}
        defaultSource={require('../assets/images/logoPequena.png')}
      />
      <View style={styles.friendInfo}>
        <Text style={[textStyles.bodyLarge, { color: colors.text }]}>
          {item.username}
        </Text>
        <Text style={[textStyles.bodySmall, { color: colors.text2 }]}>
          {item.email}
        </Text>
      </View>
      <TouchableOpacity 
        style={[styles.removeFriendButton]}
        onPress={() => handleRemoveFriend(item)}
      >
        <Ionicons name="close-circle-outline" size={24} color={colors.text2} />
      </TouchableOpacity>
    </View>
  );

  const renderSearchResult = ({ item }) => (
    <View style={[styles.searchResultItem, { backgroundColor: colors.card }]}>
      <Image 
        source={{ uri: item.photoURL }} 
        style={styles.friendPhoto}
        defaultSource={require('../assets/images/logoPequena.png')}
      />
      <View style={styles.friendInfo}>
        <Text style={[textStyles.bodyLarge, { color: colors.text }]}>
          {item.username}
        </Text>
        <Text style={[textStyles.bodySmall, { color: colors.text2 }]}>
          {item.email}
        </Text>
      </View>
      <TouchableOpacity 
        style={[styles.addFriendButton, { backgroundColor: colors.primary }]}
        onPress={() => addFriend(item)}
      >
        <Ionicons name="person-add" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[textStyles.h4, { color: colors.text, marginBottom: SPACING.md }]}>
        Amigos
      </Text>

      {loadingFriends ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {friends.length > 0 ? (
            <FlatList
              data={friends}
              renderItem={renderFriendItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.friendsList}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={
                <View style={styles.footerContainer}>
                  <TouchableOpacity 
                    style={[styles.addButton, { 
                      backgroundColor: colors.background,
                      borderColor: colors.primary,
                    }]}
                    onPress={() => setIsSearchModalVisible(true)}
                  >
                    <Ionicons name="person-add-outline" size={20} color={colors.primary} />
                    <Text style={[textStyles.body, { color: colors.primary, marginLeft: SPACING.sm }]}>
                      Adicionar amigos
                    </Text>
                  </TouchableOpacity>
                </View>
              }
            />
          ) : (
            <View style={[styles.centerContent, { borderColor: colors.border }]}>
              <Text style={[textStyles.body, { color: colors.text2, textAlign: 'center', marginBottom: SPACING.md }]}>
                Você ainda não tem amigos adicionados.
              </Text>
              <View style={styles.footerContainer}>
                <TouchableOpacity 
                  style={[styles.addButton, { 
                    backgroundColor: colors.background,
                    borderColor: colors.primary 
                  }]}
                  onPress={() => setIsSearchModalVisible(true)}
                >
                  <Ionicons name="person-add-outline" size={20} color={colors.primary} />
                  <Text style={[textStyles.body, { color: colors.primary, marginLeft: SPACING.sm }]}>
                    Adicionar amigos
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      <Modal
        visible={isSearchModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsSearchModalVisible(false);
          setSearchUsername('');
          setSearchResults(null);
          setSearchError('');
        }}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[textStyles.h3, { color: colors.text }]}>
              Adicionar Amigo
            </Text>
            <TouchableOpacity 
              onPress={() => {
                setIsSearchModalVisible(false);
                setSearchUsername('');
                setSearchResults(null);
                setSearchError('');
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

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
              onChangeText={(text) => {
                setSearchUsername(text);
                searchUser(text);
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {loading ? (
            <View style={styles.searchContent}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : searchError ? (
            <View style={styles.searchContent}>
              <Text style={[textStyles.body, { color: colors.text2, textAlign: 'center' }]}>
                {searchError}
              </Text>
            </View>
          ) : searchResults ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.searchResultsList}
              showsVerticalScrollIndicator={false}
            />
          ) : null}
        </View>
      </Modal>

      {showSuccessAlert && (
        <Animated.View 
          style={[
            styles.fullScreenAlert,
            { 
              backgroundColor: colors.background,
              opacity: fadeAnim,
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.alertContent,
              {
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
              <Ionicons name="checkmark" size={32} color={colors.white} />
            </View>
            <Text style={[textStyles.h3, { color: colors.text, marginTop: SPACING.md, textAlign: 'center' }]}>
              Amigo adicionado{'\n'}com sucesso!
            </Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(15),
    padding: SPACING.lg,
  },
  contentContainer: {
    flex: 1,
  },
  friendsList: {
    flexGrow: 1,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: moderateScale(10),
    marginBottom: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  friendPhoto: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    marginRight: SPACING.md,
  },
  friendInfo: {
    flex: 1,
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: moderateScale(8),
    borderWidth: 1,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    alignSelf: 'center',
  },
  modalContainer: {
    flex: 1,
    marginTop: moderateScale(100),
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  searchContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  searchResultsList: {
    padding: SPACING.md,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: moderateScale(10),
    marginBottom: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  addFriendButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  fullScreenAlert: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  alertContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  checkCircle: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  removeFriendButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 