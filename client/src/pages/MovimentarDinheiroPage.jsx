import { useEffect, useMemo, useState } from "react";
import MovementBoard, { randomizeAssignments } from "../components/MovementBoard";
import { getMovementData } from "../services/api/dashboard";
import "./MovimentarDinheiroPage.css";

const DRAFT_STORAGE_KEY = "financial-app:movimentacao-draft";

function sanitizeAssignments(assignments, lancamentos, subcontas) {
  const validLancamentoIds = new Set(lancamentos.map((item) => String(item.id)));
  const validSubcontaIds = new Set(subcontas.map((item) => Number(item.id)));

  return Object.entries(assignments ?? {}).reduce((accumulator, [lancamentoId, subcontaId]) => {
    if (validLancamentoIds.has(String(lancamentoId)) && validSubcontaIds.has(Number(subcontaId))) {
      accumulator[lancamentoId] = Number(subcontaId);
    }

    return accumulator;
  }, {});
}

function readDraftFromStorage() {
  try {
    const rawValue = window.localStorage.getItem(DRAFT_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue);
  } catch (_error) {
    return null;
  }
}

function formatSavedAt(timestamp) {
  if (!timestamp) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(timestamp));
}

function areAssignmentsEqual(first, second, lancamentos) {
  return lancamentos.every(
    (lancamento) => Number(first[lancamento.id] ?? lancamento.subconta_id) === Number(second[lancamento.id] ?? lancamento.subconta_id)
  );
}

export default function MovimentarDinheiroPage() {
  const [data, setData] = useState({
    carteiras: [],
    subcontas: [],
    lancamentos: [],
    transferencias: []
  });
  const [cardAssignments, setCardAssignments] = useState({});
  const [savedAssignments, setSavedAssignments] = useState({});
  const [draftSavedAt, setDraftSavedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const response = await getMovementData();
        setData(response);

        const storedDraft = readDraftFromStorage();
        const fallbackAssignments = randomizeAssignments(response.lancamentos, response.subcontas);
        const hydratedAssignments = storedDraft?.assignments
          ? {
              ...fallbackAssignments,
              ...sanitizeAssignments(storedDraft.assignments, response.lancamentos, response.subcontas)
            }
          : fallbackAssignments;

        setCardAssignments(hydratedAssignments);
        setSavedAssignments(hydratedAssignments);
        setDraftSavedAt(formatSavedAt(storedDraft?.savedAt ?? ""));
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const hasUnsavedChanges = useMemo(
    () => !areAssignmentsEqual(cardAssignments, savedAssignments, data.lancamentos),
    [cardAssignments, data.lancamentos, savedAssignments]
  );

  function handleAssignmentsChange(nextAssignments) {
    setFeedback("");
    setCardAssignments(nextAssignments);
  }

  function handleSaveDraft() {
    setSaving(true);
    setFeedback("");

    try {
      const savedAt = new Date().toISOString();

      window.localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          assignments: cardAssignments,
          savedAt
        })
      );

      setSavedAssignments(cardAssignments);
      setDraftSavedAt(formatSavedAt(savedAt));
      setFeedback("Draft salvo. Nenhuma alteracao foi enviada ao banco ainda.");
    } catch (_error) {
      setError("Nao foi possivel salvar o draft localmente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="movement-page">
      <header className="movement-page-header">
        <div>
          <h2>Movimentar Dinheiro</h2>
          <p>Arraste os cards, ajuste o draft e salve quando quiser guardar a distribuicao sem alterar o banco.</p>
        </div>
        <button type="button" className="button-primary" onClick={handleSaveDraft} disabled={saving || loading}>
          {saving ? "Salvando..." : "Salvar Draft"}
        </button>
      </header>

      {loading ? <div className="movement-feedback">Carregando movimentacoes...</div> : null}
      {error ? <div className="movement-feedback movement-feedback-error">{error}</div> : null}
      {feedback ? <div className="movement-feedback movement-feedback-success">{feedback}</div> : null}

      {!loading && !error ? (
        <MovementBoard
          carteiras={data.carteiras}
          subcontas={data.subcontas}
          lancamentos={data.lancamentos}
          transferencias={data.transferencias}
          cardAssignments={cardAssignments}
          onAssignmentsChange={handleAssignmentsChange}
          draftSavedAt={draftSavedAt}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      ) : null}
    </section>
  );
}
