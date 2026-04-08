const API_BASE = import.meta.env.VITE_API_URL;

// ===== OBRAS =====
export async function getObras() {
  const response = await fetch(`${API_BASE}/obras`);
  if (!response.ok) throw new Error('Erro ao buscar obras');
  return response.json();
}

export async function criarObra(obra: {
  name: string;
  client?: string;
  description?: string;
  status: string;
}) {
  const response = await fetch(`${API_BASE}/obras`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obra),
  });
  if (!response.ok) throw new Error('Erro ao criar obra');
  return response.json();
}

export async function getObraById(id: number) {
  const response = await fetch(`${API_BASE}/obras/${id}`);
  if (!response.ok) throw new Error('Erro ao buscar obra');
  return response.json();
}

export async function updateObra(id: number, obra: any) {
  const response = await fetch(`${API_BASE}/obras/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obra),
  });
  if (!response.ok) throw new Error('Erro ao atualizar obra');
  return response.json();
}

export async function deleteObra(id: number) {
  const response = await fetch(`${API_BASE}/obras/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Erro ao deletar obra');
  return response.json();
}

// ===== TRANSAÇÕES =====
export async function getTransacoes() {
  const response = await fetch(`${API_BASE}/transacoes`);
  if (!response.ok) throw new Error('Erro ao buscar transações');
  return response.json();
}

export async function getTransacoesPorObra(obraId: number) {
  const response = await fetch(`${API_BASE}/obras/${obraId}/transacoes`);
  if (!response.ok) throw new Error('Erro ao buscar transações');
  return response.json();
}

export async function criarTransacao(transacao: {
  type: string;
  value: number;
  description?: string;
  obraId: number;
}) {
  const response = await fetch(`${API_BASE}/transacoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transacao),
  });
  if (!response.ok) throw new Error('Erro ao criar transação');
  return response.json();
}

export async function updateTransacao(id: number, transacao: any) {
  const response = await fetch(`${API_BASE}/transacoes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transacao),
  });
  if (!response.ok) throw new Error('Erro ao atualizar transação');
  return response.json();
}

export async function deleteTransacao(id: number) {
  const response = await fetch(`${API_BASE}/transacoes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Erro ao deletar transação');
  return response.json();
}