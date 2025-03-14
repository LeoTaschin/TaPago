import { useState, useCallback, useEffect } from 'react';
import { 
  createDebt, 
  getDebtsAsCreditor, 
  getDebtsAsDebtor, 
  markDebtAsPaid,
  updateUserTotals 
} from '../services/debtService';
import { getUserData } from '../services/userService';
import { useAuth } from '../hooks/useAuth';

export function useDebts() {
  const { user } = useAuth();
  const [debtsAsCreditor, setDebtsAsCreditor] = useState([]);
  const [debtsAsDebtor, setDebtsAsDebtor] = useState([]);
  const [userTotals, setUserTotals] = useState({ totalToReceive: 0, totalToPay: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Buscar todas as dívidas do usuário
  const fetchDebts = useCallback(async () => {
    if (!user?.uid) {
      console.log('useDebts: Usuário não autenticado');
      setError('Usuário não autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Buscando dívidas para usuário:', user.uid);

      const [creditorDebts, debtorDebts] = await Promise.all([
        getDebtsAsCreditor(user.uid),
        getDebtsAsDebtor(user.uid)
      ]);

      // Buscar dados dos usuários envolvidos nas dívidas
      const userIds = new Set();
      creditorDebts.forEach(debt => userIds.add(debt.debtorId));
      debtorDebts.forEach(debt => userIds.add(debt.creditorId));

      const usersData = await Promise.all(
        Array.from(userIds).map(id => getUserData(id))
      );

      const usersMap = {};
      usersData.forEach(userData => {
        if (userData) usersMap[userData.uid] = userData;
      });

      // Adicionar dados dos usuários às dívidas
      const enrichedCreditorDebts = creditorDebts.map(debt => ({
        ...debt,
        debtor: usersMap[debt.debtorId]
      }));

      const enrichedDebtorDebts = debtorDebts.map(debt => ({
        ...debt,
        creditor: usersMap[debt.creditorId]
      }));

      setDebtsAsCreditor(enrichedCreditorDebts);
      setDebtsAsDebtor(enrichedDebtorDebts);

      // Atualizar totais
      const totals = await updateUserTotals(user.uid);
      setUserTotals(totals);

    } catch (err) {
      console.error('Erro ao buscar dívidas:', err);
      setError('Não foi possível carregar as dívidas');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Criar uma nova dívida
  const addDebt = async (debtorId, amount, description) => {
    if (!user?.uid) {
      console.error('useDebts: Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Iniciando criação de dívida:', {
        creditorId: user.uid,
        debtorId,
        amount,
        description
      });

      const result = await createDebt(user.uid, debtorId, amount, description);
      
      if (result.success) {
        await fetchDebts(); // Recarregar dívidas após criar nova
      }

      return result;
    } catch (err) {
      console.error('Erro ao criar dívida:', err);
      setError('Não foi possível criar a dívida');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Marcar uma dívida como paga
  const payDebt = useCallback(async (debtId) => {
    if (!user?.uid || !debtId) {
      console.error('useDebts: Usuário não autenticado ou debtId não fornecido');
      return { success: false, error: 'Usuário não autenticado ou debtId não fornecido' };
    }

    setLoading(true);
    setError(null);
    try {
      await markDebtAsPaid(debtId);
      await fetchDebts(); // Recarregar dívidas após marcar como paga
      return { success: true };
    } catch (err) {
      console.error('Error marking debt as paid:', err);
      setError('Não foi possível marcar a dívida como paga');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user?.uid, fetchDebts]);

  // Carregar dívidas quando o usuário mudar
  useEffect(() => {
    if (user?.uid) {
      console.log('Usuário autenticado, carregando dívidas:', user.uid);
      fetchDebts();
    } else {
      console.log('Usuário não autenticado, limpando dívidas');
      setDebtsAsCreditor([]);
      setDebtsAsDebtor([]);
      setUserTotals({ totalToReceive: 0, totalToPay: 0 });
    }
  }, [user?.uid, fetchDebts]);

  return {
    debtsAsCreditor,    // Dívidas onde o usuário é credor
    debtsAsDebtor,      // Dívidas onde o usuário é devedor
    userTotals,         // Totais a receber e a pagar
    loading,            // Estado de carregamento
    error,              // Mensagem de erro, se houver
    fetchDebts,         // Função para buscar dívidas
    addDebt,            // Função para criar nova dívida
    payDebt,            // Função para marcar dívida como paga
  };
}
