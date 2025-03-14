import { db } from '../config/firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// Inicializar ou atualizar dados do usuário
export const initializeUser = async (user) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Criar novo usuário
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        username: user.email.split('@')[0],
        photoURL: user.photoURL || null,
        friends: [],
        debtsAsCreditor: [],
        debtsAsDebtor: [],
        totalToReceive: 0,
        totalToPay: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      // Garantir que todos os campos necessários existam
      const userData = userDoc.data();
      const updates = {};

      if (!userData.debtsAsCreditor) updates.debtsAsCreditor = [];
      if (!userData.debtsAsDebtor) updates.debtsAsDebtor = [];
      if (!userData.totalToReceive) updates.totalToReceive = 0;
      if (!userData.totalToPay) updates.totalToPay = 0;

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = serverTimestamp();
        await updateDoc(userRef, updates);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error initializing user:', error);
    throw error;
  }
};

// Buscar dados do usuário
export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    return {
      id: userDoc.id,
      ...userDoc.data()
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

// Buscar amigos do usuário
export const getUserFriends = async (userId) => {
  try {
    // Primeiro, buscar o documento do usuário para obter a lista de IDs dos amigos
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('Usuário não encontrado');
    }

    const userData = userDoc.data();
    const friendsList = userData.friends || [];

    if (friendsList.length === 0) {
      return [];
    }

    // Buscar os dados de todos os amigos
    const usersRef = collection(db, 'users');
    const friendsQuery = query(usersRef, where('uid', 'in', friendsList));
    const friendsSnapshot = await getDocs(friendsQuery);

    return friendsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.uid,
        username: data.username,
        email: data.email,
        photoURL: data.photoURL
      };
    });
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
}; 