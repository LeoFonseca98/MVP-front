import { useEffect, useState } from "react";
import {
  getObras,
  criarObra,
  getTransacoes,
  criarTransacao,
  updateObra,
} from "../services/api";
import "./Home.css";

export default function Home() {
  const [obras, setObras] = useState<any[]>([]);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [view, setView] = useState<"cadastro" | "lista">("cadastro");

  // Formulário de obra
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("andamento");

  // Formulário de transação
  const [selectedObraId, setSelectedObraId] = useState<number | null>(null);
  const [transacaoType, setTransacaoType] = useState("entrada");
  const [transacaoValue, setTransacaoValue] = useState("");
  const [transacaoDesc, setTransacaoDesc] = useState("");

  // Edição de status
  const [editStatusObraId, setEditStatusObraId] = useState<number | null>(null);
  const [editStatusValue, setEditStatusValue] = useState("andamento");

  // Modal de relatório
  const [showRelatório, setShowRelatório] = useState(false);
  const [relatórioObraId, setRelatórioObraId] = useState<number | null>(null);

  async function carregar() {
    try {
      const obrasData = await getObras();
      const transacoesData = await getTransacoes();
      setObras(obrasData);
      setTransacoes(transacoesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }

  useEffect(() => {
    carregar();
    // Recarregar a cada 5 segundos para atualização em tempo real
    const interval = setInterval(carregar, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleCreateObra() {
    if (!name.trim()) {
      alert("Nome da obra é obrigatório");
      return;
    }

    try {
      await criarObra({
        name: name.trim(),
        client: client.trim() || undefined,
        description: description.trim() || undefined,
        status,
      });
      setName("");
      setClient("");
      setDescription("");
      setStatus("andamento");
      alert("Obra cadastrada com sucesso!");
      await carregar();
    } catch (error) {
      console.error("Erro ao criar obra:", error);
      alert("Erro ao criar obra");
    }
  }

  async function handleCreateTransacao(obraId: number) {
    if (!transacaoValue || parseFloat(transacaoValue) <= 0) {
      alert("Valor deve ser maior que 0");
      return;
    }

    try {
      await criarTransacao({
        type: transacaoType,
        value: parseFloat(transacaoValue),
        description: transacaoDesc.trim() || undefined,
        obraId,
      });
      setTransacaoType("entrada");
      setTransacaoValue("");
      setTransacaoDesc("");
      setSelectedObraId(null);
      alert("Transação cadastrada com sucesso!");
      await carregar();
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      alert("Erro ao criar transação");
    }
  }

  async function handleUpdateStatus(obraId: number) {
    try {
      await updateObra(obraId, { status: editStatusValue });
      setEditStatusObraId(null);
      alert("Status atualizado com sucesso!");
      await carregar();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status");
    }
  }

  function calcularTotais(obraId: number) {
    const valores = transacoes.filter((t) => t.obraId === obraId);
    const entradas = valores
      .filter((t) => t.type === "entrada")
      .reduce((sum, t) => sum + Number(t.value), 0);
    const saidas = valores
      .filter((t) => t.type === "saida")
      .reduce((sum, t) => sum + Number(t.value), 0);
    return { entradas, saidas };
  }

  function obterTransacoesObra(obraId: number) {
    return transacoes.filter((t) => t.obraId === obraId);
  }

  function obterObraPorId(id: number | undefined) {
    return obras.find((o) => o.id === id);
  }

  return (
    <div className="container">
      <h1>Gerenciador de Obras</h1>

      {view === "cadastro" ? (
        <div className="form-section">
          <h2>Cadastrar Obra</h2>

          <div className="form-group">
            <label>Nome da Obra *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Reforma da fachada"
            />
          </div>

          <div className="form-group">
            <label>Cliente</label>
            <input
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Ex: João Silva"
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a obra..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="andamento">Em andamento</option>
              <option value="parada">Parada</option>
              <option value="concluida">Concluída</option>
            </select>
          </div>

          <div className="button-group">
            <button className="btn btn-primary" onClick={handleCreateObra}>
              Cadastrar Obra
            </button>
            <button className="btn btn-secondary" onClick={() => setView("lista")}>
              Visualizar Obras
            </button>
          </div>
        </div>
      ) : (
        <div className="list-section">
          <h2>Obras Cadastradas</h2>
          {obras.length === 0 ? (
            <p className="empty-message">Nenhuma obra cadastrada</p>
          ) : (
            <div className="obras-grid">
              {obras.map((obra) => {
                const totais = calcularTotais(obra.id);
                return (
                  <div key={obra.id} className="obra-card">
                    <h3>{obra.name}</h3>
                    {obra.client && <p><strong>Cliente:</strong> {obra.client}</p>}
                    {obra.description && <p><strong>Descrição:</strong> {obra.description}</p>}
                    <p>
                      <strong>Status:</strong>{" "}
                      {editStatusObraId === obra.id ? (
                        <span>
                          <select
                            value={editStatusValue}
                            onChange={(e) => setEditStatusValue(e.target.value)}
                          >
                            <option value="andamento">Em andamento</option>
                            <option value="parada">Parada</option>
                            <option value="concluida">Concluída</option>
                          </select>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleUpdateStatus(obra.id)}
                          >
                            Salvar
                          </button>
                        </span>
                      ) : (
                        <span className={`status ${obra.status}`}>{obra.status}</span>
                      )}
                    </p>
                    <p className="date">
                      <strong>Criada em:</strong>{" "}
                      {new Date(obra.createdAt).toLocaleDateString("pt-BR")}
                    </p>

                    <div className="totals">
                      <p><strong>Entradas:</strong> R$ {totais.entradas.toFixed(2)}</p>
                      <p><strong>Saídas:</strong> R$ {totais.saidas.toFixed(2)}</p>
                      <p className={`saldo ${totais.entradas - totais.saidas >= 0 ? 'positivo' : 'negativo'}`}>
                        <strong>Saldo:</strong> R$ {(totais.entradas - totais.saidas).toFixed(2)}
                      </p>
                    </div>

                    <div className="card-buttons">
                      <button
                        className="btn btn-success"
                        onClick={() => {
                          setSelectedObraId(selectedObraId === obra.id ? undefined : obra.id);
                          setTransacaoValue("");
                          setTransacaoDesc("");
                        }}
                      >
                        {selectedObraId === obra.id ? "Fechar" : "+ Transação"}
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setEditStatusObraId(obra.id);
                          setEditStatusValue(obra.status || "andamento");
                        }}
                      >
                        Editar Status
                      </button>
                      <button
                        className="btn btn-info"
                        onClick={() => {
                          setShowRelatório(true);
                          setRelatórioObraId(obra.id);
                        }}
                      >
                        📊 Relatório
                      </button>
                    </div>

                    {selectedObraId === obra.id && (
                      <div className="transacao-form">
                        <h4>Nova transação para {obra.name}</h4>

                        <div className="form-group">
                          <label>Tipo</label>
                          <select
                            value={transacaoType}
                            onChange={(e) => setTransacaoType(e.target.value)}
                          >
                            <option value="entrada">Entrada</option>
                            <option value="saida">Saída</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Valor</label>
                          <input
                            type="number"
                            step="0.01"
                            value={transacaoValue}
                            onChange={(e) => setTransacaoValue(e.target.value)}
                            placeholder="Ex: 1500.00"
                          />
                        </div>

                        <div className="form-group">
                          <label>Descrição</label>
                          <textarea
                            value={transacaoDesc}
                            onChange={(e) => setTransacaoDesc(e.target.value)}
                            placeholder="Ex: Pagamento de materiais"
                            rows={3}
                          />
                        </div>

                        <button
                          className="btn btn-primary"
                          onClick={() => handleCreateTransacao(obra.id)}
                        >
                          Salvar Transação
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button className="btn btn-primary" onClick={() => setView("cadastro")}>
            ← Voltar ao Cadastro
          </button>
        </div>
      )}

      {/* Modal de Relatório */}
      {showRelatório && (
        <div className="modal-overlay" onClick={() => setShowRelatório(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Relatório - {obterObraPorId(relatórioObraId)?.name}</h2>
              <button
                className="modal-close"
                onClick={() => setShowRelatório(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {obterTransacoesObra(relatórioObraId || 0).length === 0 ? (
                <p className="empty-message">Nenhuma transação registrada</p>
              ) : (
                <>
                  <div className="relatorio-totals">
                    <div className="relatorio-card entrada">
                      <p className="label">Entradas</p>
                      <p className="valor">
                        R$ {calcularTotais(relatórioObraId || 0).entradas.toFixed(2)}
                      </p>
                    </div>
                    <div className="relatorio-card saida">
                      <p className="label">Saídas</p>
                      <p className="valor">
                        R$ {calcularTotais(relatórioObraId || 0).saidas.toFixed(2)}
                      </p>
                    </div>
                    <div className="relatorio-card saldo">
                      <p className="label">Saldo</p>
                      <p className="valor">
                        R${" "}
                        {(
                          calcularTotais(relatórioObraId || 0).entradas -
                          calcularTotais(relatórioObraId || 0).saidas
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="transacoes-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Tipo</th>
                          <th>Descrição</th>
                          <th>Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {obterTransacoesObra(relatórioObraId || 0).map((t) => (
                          <tr key={t.id}>
                            <td>{new Date(t.data).toLocaleDateString("pt-BR")}</td>
                            <td>
                              <span className={`tipo ${t.type}`}>
                                {t.type === "entrada" ? "📈 Entrada" : "📉 Saída"}
                              </span>
                            </td>
                            <td>{t.description || "-"}</td>
                            <td className={`valor ${t.type}`}>
                              R$ {t.value.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowRelatório(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}