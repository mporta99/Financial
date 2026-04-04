import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import { formatCurrency, formatDate } from "../services/formatters";
import "./MovementBoard.css";

function LancamentoCard({ card, subcontaId }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(card.id),
    data: {
      subcontaId
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1
  };

  return (
    <article ref={setNodeRef} style={style} className="lancamento-card" {...listeners} {...attributes}>
      <div className="lancamento-card-top">
        <strong>{card.descricao || "Lancamento sem descricao"}</strong>
        <strong>{formatCurrency(card.valor)}</strong>
      </div>
      <div className="lancamento-card-meta">
        <span>{card.categoria?.nome ?? "Sem categoria"}</span>
        <span>{card.pessoa?.nome ?? "Sem pessoa"}</span>
        <span>{card.eh_casa ? "Casa" : "Pessoal"}</span>
        <span>{card.tipo}</span>
        <span>{formatDate(card.data)}</span>
      </div>
    </article>
  );
}

function SubcontaColumn({ subconta, cards, saldo }) {
  const { isOver, setNodeRef } = useDroppable({
    id: String(subconta.id)
  });

  return (
    <section ref={setNodeRef} className={`subconta-column ${isOver ? "subconta-column-over" : ""}`}>
      <header className="subconta-header">
        <div>
          <h4>{subconta.nome}</h4>
          <p>{subconta.tipo}</p>
        </div>
        <div className="saldo-block">
          <span>Saldo</span>
          <strong>{formatCurrency(saldo)}</strong>
        </div>
      </header>

      <div className="subconta-card-list">
        {cards.length === 0 ? (
          <div className="empty-drop-state">Arraste lancamentos para esta subconta.</div>
        ) : (
          cards.map((card) => <LancamentoCard key={card.id} card={card} subcontaId={subconta.id} />)
        )}
      </div>
    </section>
  );
}

function randomizeAssignments(lancamentos, subcontas) {
  if (subcontas.length === 0) {
    return {};
  }

  return lancamentos.reduce((accumulator, lancamento, index) => {
    const subconta = subcontas[(lancamento.id + index) % subcontas.length];
    accumulator[lancamento.id] = subconta.id;
    return accumulator;
  }, {});
}

function countMovedCards(lancamentos, cardAssignments) {
  return lancamentos.reduce((total, lancamento) => {
    return total + (Number(cardAssignments[lancamento.id]) !== Number(lancamento.subconta_id) ? 1 : 0);
  }, 0);
}

export default function MovementBoard({
  carteiras,
  subcontas,
  lancamentos,
  transferencias,
  cardAssignments,
  onAssignmentsChange,
  draftSavedAt,
  hasUnsavedChanges
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const saldos = useMemo(() => {
    const saldoMap = Object.fromEntries(subcontas.map((subconta) => [subconta.id, 0]));

    lancamentos.forEach((lancamento) => {
      const multiplier = lancamento.tipo === "entrada" ? 1 : -1;
      const assignedSubcontaId = Number(cardAssignments[lancamento.id] ?? lancamento.subconta_id);
      saldoMap[assignedSubcontaId] = (saldoMap[assignedSubcontaId] ?? 0) + Number(lancamento.valor) * multiplier;
    });

    transferencias.forEach((transferencia) => {
      saldoMap[transferencia.subconta_origem_id] =
        (saldoMap[transferencia.subconta_origem_id] ?? 0) - Number(transferencia.valor);
      saldoMap[transferencia.subconta_destino_id] =
        (saldoMap[transferencia.subconta_destino_id] ?? 0) + Number(transferencia.valor);
    });

    return saldoMap;
  }, [cardAssignments, lancamentos, subcontas, transferencias]);

  const cardsBySubconta = useMemo(() => {
    const initialMap = subcontas.reduce((accumulator, subconta) => {
      accumulator[subconta.id] = [];
      return accumulator;
    }, {});

    lancamentos.forEach((lancamento) => {
      const assignedSubcontaId = Number(cardAssignments[lancamento.id] ?? lancamento.subconta_id);

      if (initialMap[assignedSubcontaId]) {
        initialMap[assignedSubcontaId].push(lancamento);
      }
    });

    return initialMap;
  }, [cardAssignments, lancamentos, subcontas]);

  const movedCardsCount = useMemo(
    () => countMovedCards(lancamentos, cardAssignments),
    [cardAssignments, lancamentos]
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) {
      return;
    }

    onAssignmentsChange({
      ...cardAssignments,
      [active.id]: Number(over.id)
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="movement-note">
        <div>
          Os cards sao distribuidos visualmente de forma simulada nesta fase. O saldo acompanha a posicao atual dos cards no draft, sem alterar o banco ate voce salvar.
        </div>
        <div className="movement-note-meta">
          <span>{movedCardsCount} card(s) fora da subconta original</span>
          <span>{hasUnsavedChanges ? "Ha alteracoes nao salvas" : "Draft sincronizado"}</span>
          <span>{draftSavedAt ? `Ultimo draft salvo: ${draftSavedAt}` : "Nenhum draft salvo ainda"}</span>
        </div>
      </div>

      <div className="wallet-grid">
        {carteiras.map((carteira) => (
          <section key={carteira.id} className="wallet-panel">
            <header className="wallet-header">
              <div>
                <span>{carteira.tipo}</span>
                <h3>{carteira.nome}</h3>
              </div>
              <strong>
                {formatCurrency(
                  subcontas
                    .filter((subconta) => subconta.carteira_id === carteira.id)
                    .reduce((total, subconta) => total + (saldos[subconta.id] ?? 0), 0)
                )}
              </strong>
            </header>

            <div className="subcontas-grid">
              {subcontas
                .filter((subconta) => subconta.carteira_id === carteira.id)
                .map((subconta) => (
                  <SubcontaColumn
                    key={subconta.id}
                    subconta={subconta}
                    cards={cardsBySubconta[subconta.id] ?? []}
                    saldo={saldos[subconta.id] ?? 0}
                  />
                ))}
            </div>
          </section>
        ))}
      </div>
    </DndContext>
  );
}

export { randomizeAssignments };
