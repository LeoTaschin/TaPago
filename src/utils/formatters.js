export function formatCurrency(value) {
  if (!value) return '';

  // Se for string, converte para número
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  // Se não for um número válido, retorna vazio
  if (isNaN(numericValue)) return '';

  // Formata o número para moeda brasileira
  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
} 