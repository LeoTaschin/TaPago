import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc,
  doc, 
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';

// Criar uma nova dívida
export const createDebt = async (creditorId, debtorId, amount, description) => {
  try {
    const debtData = {
      creditorId,
      debtorId,
      amount: parseFloat(amount),
      description,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Criar referência da dívida antes da transação
    const debtRef = doc(collection(db, 'debts'));

    // Iniciar uma transação para garantir consistência dos dados
    await runTransaction(db, async (transaction) => {
      // Primeiro, fazer todas as leituras necessárias
      const creditorRef = doc(db, 'users', creditorId);
      const debtorRef = doc(db, 'users', debtorId);
      
      const creditorDoc = await transaction.get(creditorRef);
      const debtorDoc = await transaction.get(debtorRef);

      if (!creditorDoc.exists() || !debtorDoc.exists()) {
        throw new Error('Usuário não encontrado');
      }

      const creditorData = creditorDoc.data();
      const debtorData = debtorDoc.data();

      // Agora, fazer todas as escritas
      transaction.set(debtRef, debtData);

      transaction.update(creditorRef, {
        debtsAsCreditor: [...(creditorData.debtsAsCreditor || []), debtRef.id],
        totalToReceive: (creditorData.totalToReceive || 0) + parseFloat(amount),
        updatedAt: serverTimestamp(),
      });

      transaction.update(debtorRef, {
        debtsAsDebtor: [...(debtorData.debtsAsDebtor || []), debtRef.id],
        totalToPay: (debtorData.totalToPay || 0) + parseFloat(amount),
        updatedAt: serverTimestamp(),
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating debt:', error);
    throw error;
  }
};

// Buscar dívidas onde o usuário é credor
export const getDebtsAsCreditor = async (userId) => {
  try {
    const q = query(
      collection(db, 'debts'),
      where('creditorId', '==', userId),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching debts as creditor:', error);
    throw error;
  }
};

// Buscar dívidas onde o usuário é devedor
export const getDebtsAsDebtor = async (userId) => {
  try {
    const q = query(
      collection(db, 'debts'),
      where('debtorId', '==', userId),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching debts as debtor:', error);
    throw error;
  }
};

// Marcar uma dívida como paga
export const markDebtAsPaid = async (debtId) => {
  try {
    await runTransaction(db, async (transaction) => {
      const debtRef = doc(db, 'debts', debtId);
      const debtDoc = await transaction.get(debtRef);
      
      if (!debtDoc.exists()) {
        throw new Error('Debt not found');
      }

      const debtData = debtDoc.data();
      const { creditorId, debtorId, amount } = debtData;

      // Atualizar a dívida
      transaction.update(debtRef, {
        status: 'paid',
        updatedAt: serverTimestamp(),
      });

      // Atualizar o credor
      const creditorRef = doc(db, 'users', creditorId);
      const creditorDoc = await transaction.get(creditorRef);
      const creditorData = creditorDoc.data();

      transaction.update(creditorRef, {
        totalToReceive: creditorData.totalToReceive - amount,
      });

      // Atualizar o devedor
      const debtorRef = doc(db, 'users', debtorId);
      const debtorDoc = await transaction.get(debtorRef);
      const debtorData = debtorDoc.data();

      transaction.update(debtorRef, {
        totalToPay: debtorData.totalToPay - amount,
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking debt as paid:', error);
    throw error;
  }
};

// Atualizar os totais do usuário
export const updateUserTotals = async (userId) => {
  try {
    const debtsAsCreditorQuery = query(
      collection(db, 'debts'),
      where('creditorId', '==', userId),
      where('status', '==', 'pending')
    );

    const debtsAsDebtorQuery = query(
      collection(db, 'debts'),
      where('debtorId', '==', userId),
      where('status', '==', 'pending')
    );

    const [creditorDebts, debtorDebts] = await Promise.all([
      getDocs(debtsAsCreditorQuery),
      getDocs(debtsAsDebtorQuery)
    ]);

    const totalToReceive = creditorDebts.docs.reduce(
      (total, doc) => total + doc.data().amount,
      0
    );

    const totalToPay = debtorDebts.docs.reduce(
      (total, doc) => total + doc.data().amount,
      0
    );

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      totalToReceive,
      totalToPay,
      updatedAt: serverTimestamp(),
    });

    return { totalToReceive, totalToPay };
  } catch (error) {
    console.error('Error updating user totals:', error);
    throw error;
  }
}; 