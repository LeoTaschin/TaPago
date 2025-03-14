import { useState, useCallback } from 'react';
import { 
  createDebt, 
  getDebtsAsCreditor, 
  getDebtsAsDebtor, 
  markDebtAsPaid,
  updateUserTotals 
} from '../services/debtService';
import { getUserData } from '../services/userService';

export function useDebts(userId) {
  const [debtsAsCreditor, setDebtsAsCreditor] = useState([]);
  const [debtsAsDebtor, setDebtsAsDebtor] = useState([]);
  const [userTotals, setUserTotals] = useState({ totalToReceive: 0, totalToPay: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Buscar todas as dívidas do usuário
  const fetchDebts = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      // Buscar dívidas em paralelo
      const [creditorDebts, debtorDebts] = await Promise.all([
        getDebtsAsCreditor(userId),
        getDebtsAsDebtor(userId)
      ]);

      // Buscar dados dos usuários envolvidos nas dívidas
      const userIds = new Set();
      creditorDebts.forEach(debt => userIds.add(debt.debtorId));
      debtorDebts.forEach(debt => userIds.add(debt.creditorId));

      const usersData = await Promise.all(
        Array.from(userIds).map(id => getUserData(id))
      );

      const usersMap = {};
      usersData.forEach(user => {
        usersMap[user.uid] = user;
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
      const totals = await updateUserTotals(userId);
      setUserTotals(totals);
    } catch (err) {
      console.error('Error fetching debts:', err);
      setError('Não foi possível carregar as dívidas');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Criar uma nova dívida
  const addDebt = useCallback(async (debtorId, amount, description) => {
    if (!userId || !debtorId || !amount) return;

    setLoading(true);
    setError(null);
    try {
      await createDebt(userId, debtorId, amount, description);
      await fetchDebts(); // Recarregar dívidas após criar uma nova
      return { success: true };
    } catch (err) {
      console.error('Error creating debt:', err);
      setError('Não foi possível criar a dívida');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [userId, fetchDebts]);

  // Marcar uma dívida como paga
  const payDebt = useCallback(async (debtId) => {
    if (!userId || !debtId) return;

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
  }, [userId, fetchDebts]);

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
