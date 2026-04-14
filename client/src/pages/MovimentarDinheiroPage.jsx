import { useEffect, useMemo, useState } from "react";
import MovementBoard from "../components/MovementBoard";
import { getMovementCompetencias, getMovementData } from "../services/api/dashboard";
import { deleteEntity, patchEntity, saveEntity } from "../services/api/resources";
import "./MovimentarDinheiroPage.css";

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function buildCompetenciaDate({ ano, mes }) {
  return `${ano}-${String(mes).padStart(2, "0")}-01`;
}

export default function MovimentarDinheiroPage() {
  const today = new Date();
  const [competencia, setCompetencia] = useState({
    mes: today.getMonth() + 1,
    ano: today.getFullYear()
  });
  const [anosDisponiveis, setAnosDisponiveis] = useState([]);
  const [data, setData] = useState({
    carteiras: [],
    subcontas: [],
    pessoas: [],
    categorias: [],
    lancamentos: [],
    transferencias: [],
    lancamentosAcumulados: [],
    transferenciasAcumuladas: []
  });
  const [createForm, setCreateForm] = useState({
    pessoa_id: "",
    categoria_id: "",
    subconta_id: "",
    valor: "",
    data: buildCompetenciaDate({ mes: today.getMonth() + 1, ano: today.getFullYear() }),
    status: "nao_pago",
    descricao: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  async function loadCompetencias() {
    const response = await getMovementCompetencias();
    const anos = response.anos.length > 0 ? response.anos : [today.getFullYear()];
    setAnosDisponiveis(anos);

    setCompetencia((current) => {
      if (anos.includes(current.ano)) {
        return current;
      }

      return {
        mes: current.mes,
        ano: anos[anos.length - 1]
      };
    });
  }

  async function loadData(periodo) {
    try {
      setLoading(true);
      setError("");
      const response = await getMovementData(periodo);
      setData(response);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompetencias().catch((requestError) => setError(requestError.message));
  }, []);

  useEffect(() => {
    loadData(competencia);
  }, [competencia.ano, competencia.mes]);

  useEffect(() => {
    setCreateForm((current) => ({
      ...current,
      data: buildCompetenciaDate(competencia)
    }));
  }, [competencia.ano, competencia.mes]);

  function handleCreateFormChange(event) {
    const { name, value } = event.target;
    setCreateForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "categoria_id" ? { subconta_id: "" } : {})
    }));
  }

  async function handleLancamentoCreate(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFeedback("");

    try {
      const categoria = data.categorias.find((item) => String(item.id) === String(createForm.categoria_id));
      const subcontaId = createForm.subconta_id || categoria?.subconta_id;

      if (!categoria) {
        throw new Error("Selecione uma categoria valida.");
      }

      if (!subcontaId) {
        throw new Error("Selecione uma subconta ou configure a subconta padrao da categoria.");
      }

      const parsedDate = new Date(`${createForm.data}T00:00:00`);
      const response = await saveEntity("lancamentos", null, {
        data: createForm.data,
        mes: parsedDate.getMonth() + 1,
        ano: parsedDate.getFullYear(),
        valor: Number(createForm.valor || 0),
        tipo: categoria.tipo,
        status: createForm.status,
        data_pagamento: null,
        pessoa_id: Number(createForm.pessoa_id),
        casa: Boolean(categoria.casa),
        categoria_id: Number(createForm.categoria_id),
        subconta_id: Number(subcontaId),
        template_lancamento_id: null,
        descricao: createForm.descricao || null
      });

      setCreateForm((current) => ({
        ...current,
        valor: "",
        descricao: ""
      }));
      await loadData(competencia);
      await loadCompetencias();
      setFeedback(`Lancamento criado: ${response.item.descricao ?? response.item.id}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLancamentoMove(lancamento, payload) {
    setSaving(true);
    setError("");
    setFeedback("");

    try {
      const response = await patchEntity("lancamentos", lancamento.id, payload);
      setData((current) => ({
        ...current,
        lancamentos: current.lancamentos.map((item) => (item.id === lancamento.id ? response.item : item)),
        lancamentosAcumulados: current.lancamentosAcumulados.map((item) => (item.id === lancamento.id ? response.item : item))
      }));
      setFeedback("Lancamento atualizado.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleTransferenciaMove(transferencia, payload) {
    setSaving(true);
    setError("");
    setFeedback("");

    try {
      const response = await patchEntity("transferencias", transferencia.id, payload);
      setData((current) => ({
        ...current,
        transferencias: current.transferencias.map((item) => (item.id === transferencia.id ? response.item : item)),
        transferenciasAcumuladas: current.transferenciasAcumuladas.map((item) => (item.id === transferencia.id ? response.item : item))
      }));
      setFeedback("Transferencia atualizada.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLancamentoEdit(lancamento, payload) {
    setSaving(true);
    setError("");
    setFeedback("");

    try {
      const response = await patchEntity("lancamentos", lancamento.id, payload);
      setData((current) => ({
        ...current,
        lancamentos: current.lancamentos.map((item) => (item.id === lancamento.id ? response.item : item)),
        lancamentosAcumulados: current.lancamentosAcumulados.map((item) => (item.id === lancamento.id ? response.item : item))
      }));
      setFeedback("Lancamento atualizado.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLancamentoDelete(lancamento) {
    if (!window.confirm(`Excluir "${lancamento.descricao ?? lancamento.id}"?`)) {
      return;
    }

    setSaving(true);
    setError("");
    setFeedback("");

    try {
      await deleteEntity("lancamentos", lancamento.id);
      setData((current) => ({
        ...current,
        lancamentos: current.lancamentos.filter((item) => item.id !== lancamento.id),
        lancamentosAcumulados: current.lancamentosAcumulados.filter((item) => item.id !== lancamento.id)
      }));
      await loadCompetencias();
      setFeedback("Lancamento excluido.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleTransferenciaEdit(transferencia, payload) {
    setSaving(true);
    setError("");
    setFeedback("");

    try {
      const response = await patchEntity("transferencias", transferencia.id, payload);
      setData((current) => ({
        ...current,
        transferencias: current.transferencias.map((item) => (item.id === transferencia.id ? response.item : item)),
        transferenciasAcumuladas: current.transferenciasAcumuladas.map((item) => (item.id === transferencia.id ? response.item : item))
      }));
      setFeedback("Transferencia atualizada.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  const filteredLancamentos = useMemo(
    () => data.lancamentos.filter((item) => Number(item.mes) === competencia.mes && Number(item.ano) === competencia.ano),
    [data.lancamentos, competencia.ano, competencia.mes]
  );

  const filteredTransferencias = useMemo(
    () => data.transferencias.filter((item) => Number(item.mes) === competencia.mes && Number(item.ano) === competencia.ano),
    [data.transferencias, competencia.ano, competencia.mes]
  );

  return (
    <section className="movement-page">
      <header className="movement-page-header">
        <div className="movement-toolbar">
          <div className="movement-filter-group">
            <span className="movement-filter-label">Ano</span>
            <div className="movement-chip-row">
              {anosDisponiveis.map((ano) => (
                <button
                  key={ano}
                  type="button"
                  className={`movement-chip ${competencia.ano === ano ? "movement-chip-active" : ""}`}
                  onClick={() => setCompetencia((current) => ({ ...current, ano }))}
                >
                  {ano}
                </button>
              ))}
            </div>
          </div>

          <div className="movement-filter-group">
            <span className="movement-filter-label">Mes</span>
            <div className="movement-chip-row movement-chip-row-months">
              {MONTH_LABELS.map((label, index) => {
                const month = index + 1;

                return (
                  <button
                    key={label}
                    type="button"
                    className={`movement-chip ${competencia.mes === month ? "movement-chip-active" : ""}`}
                    onClick={() => setCompetencia((current) => ({ ...current, mes: month }))}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <form className="movement-create-form" onSubmit={handleLancamentoCreate}>
          <label>
            <span>Pessoa</span>
            <select name="pessoa_id" value={createForm.pessoa_id} onChange={handleCreateFormChange} required>
              <option value="">Selecione</option>
              {data.pessoas.map((pessoa) => (
                <option key={pessoa.id} value={pessoa.id}>
                  {pessoa.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Categoria</span>
            <select name="categoria_id" value={createForm.categoria_id} onChange={handleCreateFormChange} required>
              <option value="">Selecione</option>
              {data.categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome} / {categoria.grupo}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Subconta</span>
            <select name="subconta_id" value={createForm.subconta_id} onChange={handleCreateFormChange}>
              <option value="">Padrao da categoria</option>
              {data.subcontas.map((subconta) => (
                <option key={subconta.id} value={subconta.id}>
                  {subconta.carteira?.nome} / {subconta.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Valor</span>
            <input name="valor" type="number" step="0.01" value={createForm.valor} onChange={handleCreateFormChange} required />
          </label>
          <label>
            <span>Data</span>
            <input name="data" type="date" value={createForm.data} onChange={handleCreateFormChange} required />
          </label>
          <label>
            <span>Status</span>
            <select name="status" value={createForm.status} onChange={handleCreateFormChange}>
              <option value="nao_pago">Nao pago</option>
              <option value="pago">Pago</option>
            </select>
          </label>
          <label className="movement-create-description">
            <span>Descricao</span>
            <input name="descricao" value={createForm.descricao} onChange={handleCreateFormChange} placeholder="Ex.: Compra mercado" />
          </label>
          <button type="submit" className="movement-create-button" disabled={saving}>
            Criar lancamento
          </button>
        </form>
      </header>

      {loading ? <div className="movement-feedback">Carregando movimentacoes...</div> : null}
      {error ? <div className="movement-feedback movement-feedback-error">{error}</div> : null}
      {feedback ? <div className="movement-feedback movement-feedback-success">{feedback}</div> : null}

      {!loading && !error ? (
        <MovementBoard
          carteiras={data.carteiras}
          subcontas={data.subcontas}
          lancamentos={filteredLancamentos}
          transferencias={filteredTransferencias}
          lancamentosAcumulados={data.lancamentosAcumulados}
          transferenciasAcumuladas={data.transferenciasAcumuladas}
          onLancamentoMove={handleLancamentoMove}
          onTransferenciaMove={handleTransferenciaMove}
          onLancamentoEdit={handleLancamentoEdit}
          onLancamentoDelete={handleLancamentoDelete}
          onTransferenciaEdit={handleTransferenciaEdit}
          saving={saving}
        />
      ) : null}
    </section>
  );
}
