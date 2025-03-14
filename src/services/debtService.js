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
import { auth } from '../config/firebase';

// Criar uma nova dívida
export async function createDebt(creditorId, debtorId, amount, description) {
  console.log('debtService: Iniciando criação de dívida', { creditorId, debtorId, amount, description });

  try {
    // Verificar se os documentos dos usuários existem
    const creditorRef = doc(db, 'users', creditorId);
    const debtorRef = doc(db, 'users', debtorId);

    const [creditorDoc, debtorDoc] = await Promise.all([
      getDoc(creditorRef),
      getDoc(debtorRef)
    ]);

    if (!creditorDoc.exists()) {
      console.error('debtService: Documento do credor não encontrado');
      throw new Error('Documento do credor não encontrado');
    }

    if (!debtorDoc.exists()) {
      console.error('debtService: Documento do devedor não encontrado');
      throw new Error('Documento do devedor não encontrado');
    }

    // Criar a dívida em uma transação
    const result = await runTransaction(db, async (transaction) => {
      // Criar o documento da dívida
      const debtRef = doc(collection(db, 'debts'));
      
      const debtData = {
        creditorId,
        debtorId,
        amount: Number(amount),
        description,
        createdAt: new Date(),
        paid: false,
        creditor: {
          id: creditorId,
          ...creditorDoc.data()
        },
        debtor: {
          id: debtorId,
          ...debtorDoc.data()
        }
      };

      transaction.set(debtRef, debtData);

      // Atualizar os totais dos usuários
      const creditorData = creditorDoc.data();
      const debtorData = debtorDoc.data();

      transaction.update(creditorRef, {
        totalToReceive: (creditorData.totalToReceive || 0) + Number(amount)
      });

      transaction.update(debtorRef, {
        totalToPay: (debtorData.totalToPay || 0) + Number(amount)
      });

      return { success: true, debtId: debtRef.id };
    });

    console.log('debtService: Dívida criada com sucesso', result);
    return result;

  } catch (error) {
    console.error('debtService: Erro ao criar dívida:', error);
    return { success: false, error: error.message };
  }
}

// Buscar dívidas onde o usuário é credor
export const getDebtsAsCreditor = async (userId) => {
  try {
    console.log('debtService: Buscando dívidas como credor para', userId);
    const q = query(
      collection(db, 'debts'),
      where('creditorId', '==', userId),
      where('paid', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const debts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('debtService: Encontradas', debts.length, 'dívidas como credor');
    return debts;
  } catch (error) {
    console.error('debtService: Erro ao buscar dívidas como credor:', error);
    throw error;
  }
};

// Buscar dívidas onde o usuário é devedor
export const getDebtsAsDebtor = async (userId) => {
  try {
    console.log('debtService: Buscando dívidas como devedor para', userId);
    const q = query(
      collection(db, 'debts'),
      where('debtorId', '==', userId),
      where('paid', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const debts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('debtService: Encontradas', debts.length, 'dívidas como devedor');
    return debts;
  } catch (error) {
    console.error('debtService: Erro ao buscar dívidas como devedor:', error);
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
        throw new Error('Dívida não encontrada');
      }

      const debtData = debtDoc.data();
      const { creditorId, debtorId, amount } = debtData;

      // Atualizar a dívida
      transaction.update(debtRef, {
        paid: true,
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
    console.error('debtService: Erro ao marcar dívida como paga:', error);
    throw error;
  }
};

// Atualizar os totais do usuário
export const updateUserTotals = async (userId) => {
  try {
    console.log('debtService: Atualizando totais para usuário', userId);
    const debtsAsCreditorQuery = query(
      collection(db, 'debts'),
      where('creditorId', '==', userId),
      where('paid', '==', false)
    );

    const debtsAsDebtorQuery = query(
      collection(db, 'debts'),
      where('debtorId', '==', userId),
      where('paid', '==', false)
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

    console.log('debtService: Totais atualizados', { totalToReceive, totalToPay });
    return { totalToReceive, totalToPay };
  } catch (error) {
    console.error('debtService: Erro ao atualizar totais do usuário:', error);
    throw error;
  }
}; 