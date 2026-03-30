import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
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
        <strong>{card.descricao || "Lançamento sem descrição"}</strong>
        <span>{card.tipo}</span>
      </div>
      <p>{card.categoria?.nome ?? "Sem categoria"}</p>
      <div className="lancamento-card-bottom">
        <span>{formatDate(card.data)}</span>
        <strong>{formatCurrency(card.valor)}</strong>
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
          <div className="empty-drop-state">Arraste lançamentos para esta subconta.</div>
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

export default function MovementBoard({ carteiras, subcontas, lancamentos, transferencias }) {
  const [cardAssignments, setCardAssignments] = useState(() => randomizeAssignments(lancamentos, subcontas));
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const saldos = useMemo(() => {
    const saldoMap = Object.fromEntries(subcontas.map((subconta) => [subconta.id, 0]));

    lancamentos.forEach((lancamento) => {
      const multiplier = lancamento.tipo === "entrada" ? 1 : -1;
      saldoMap[lancamento.subconta_id] = (saldoMap[lancamento.subconta_id] ?? 0) + Number(lancamento.valor) * multiplier;
    });

    transferencias.forEach((transferencia) => {
      saldoMap[transferencia.subconta_origem_id] =
        (saldoMap[transferencia.subconta_origem_id] ?? 0) - Number(transferencia.valor);
      saldoMap[transferencia.subconta_destino_id] =
        (saldoMap[transferencia.subconta_destino_id] ?? 0) + Number(transferencia.valor);
    });

    return saldoMap;
  }, [lancamentos, subcontas, transferencias]);

  const cardsBySubconta = useMemo(() => {
    const initialMap = subcontas.reduce((accumulator, subconta) => {
      accumulator[subconta.id] = [];
      return accumulator;
    }, {});

    lancamentos.forEach((lancamento) => {
      const assignedSubcontaId = cardAssignments[lancamento.id];

      if (initialMap[assignedSubcontaId]) {
        initialMap[assignedSubcontaId].push(lancamento);
      }
    });

    return initialMap;
  }, [cardAssignments, lancamentos, subcontas]);

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) {
      return;
    }

    setCardAssignments((current) => ({
      ...current,
      [active.id]: Number(over.id)
    }));
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="movement-note">
        Os cards são distribuídos visualmente de forma simulada para esta fase. Os saldos exibidos abaixo usam os dados reais do backend.
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
