import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { formatCurrency, formatDate } from "../services/formatters";
import "./MovementBoard.css";

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function zoneId(kind, subcontaId, area) {
  return `${kind}:${subcontaId}:${area}`;
}

function parseZoneId(value) {
  const [kind, subcontaId, area] = String(value).split(":");
  return {
    kind,
    subcontaId: Number(subcontaId),
    area
  };
}

function isFaturaName(value) {
  return normalizeText(value).includes("fatura");
}

function isOutrosName(value) {
  return normalizeText(value) === "outros";
}

function adjustFaturaCards(lancamentos) {
  return lancamentos.map((card) => {
    const isParentFatura =
      card.item_template_id == null &&
      (isFaturaName(card.template_lancamento?.nome) || isFaturaName(card.categoria?.nome) || isFaturaName(card.descricao));

    if (isParentFatura) {
      const unpaidEmbeddedTotal = lancamentos
        .filter(
          (candidate) =>
            candidate.item_template_id != null &&
            candidate.template_lancamento_id === card.template_lancamento_id &&
            candidate.pessoa_id === card.pessoa_id &&
            candidate.ano === card.ano &&
            candidate.mes === card.mes &&
            candidate.status !== "pago" &&
            !isOutrosName(candidate.categoria?.nome)
        )
        .reduce((total, candidate) => total + Number(candidate.valor), 0);

      return {
        ...card,
        valor_fatura_aberta: Number(card.valor) + unpaidEmbeddedTotal
      };
    }

    const isOutrosFatura =
      card.item_template_id != null &&
      isOutrosName(card.categoria?.nome) &&
      (isFaturaName(card.template_lancamento?.nome) || isFaturaName(card.descricao));

    if (!isOutrosFatura) {
      return card;
    }

    const parentCard = lancamentos.find(
      (candidate) =>
        candidate.item_template_id == null &&
        candidate.template_lancamento_id === card.template_lancamento_id &&
        candidate.pessoa_id === card.pessoa_id &&
        candidate.ano === card.ano &&
        candidate.mes === card.mes &&
        isFaturaName(candidate.template_lancamento?.nome || candidate.descricao)
    );

    if (!parentCard || parentCard.status === "pago") {
      return card;
    }

    const paidEmbeddedTotal = lancamentos
      .filter(
        (candidate) =>
          candidate.id !== card.id &&
          candidate.item_template_id != null &&
          candidate.template_lancamento_id === card.template_lancamento_id &&
          candidate.pessoa_id === card.pessoa_id &&
          candidate.ano === card.ano &&
          candidate.mes === card.mes &&
          candidate.status === "pago" &&
          !isOutrosName(candidate.categoria?.nome)
      )
      .reduce((total, candidate) => total + Number(candidate.valor), 0);

    return {
      ...card,
      valor: Number(parentCard.valor) - paidEmbeddedTotal
    };
  });
}

function CardEditor({ value, date, saving, onChange, onSave, onCancel }) {
  return (
    <form
      className="card-editor"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <label className="card-editor-field">
        <span>Valor</span>
        <input type="number" step="0.01" name="value" value={value} onChange={onChange} />
      </label>
      <label className="card-editor-field">
        <span>Data</span>
        <input type="date" name="date" value={date} onChange={onChange} />
      </label>
      <div className="card-editor-actions">
        <button type="submit" className="card-editor-save" disabled={saving}>
          {saving ? "..." : "Salvar"}
        </button>
        <button type="button" className="card-editor-cancel" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function LancamentoCard({ card, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    value: String(card.valor),
    date: card.data?.slice(0, 10) ?? ""
  });

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `lancamento:${card.id}`,
    disabled: editing
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1
  };

  function resetForm() {
    setFormValues({
      value: String(card.valor),
      date: card.data?.slice(0, 10) ?? ""
    });
  }

  return (
    <article ref={setNodeRef} style={style} className="lancamento-card" {...listeners} {...attributes}>
      <div className="lancamento-card-top">
        <strong>{card.descricao || "Lancamento sem descricao"}</strong>
        <div className="lancamento-card-top-actions">
          <div className="lancamento-card-values">
            <strong>{formatCurrency(card.valor)}</strong>
            {card.valor_fatura_aberta != null ? <span className="lancamento-card-secondary-value">{formatCurrency(card.valor_fatura_aberta)}</span> : null}
          </div>
          <button
            type="button"
            className="card-edit-trigger"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => {
              if (!editing) {
                resetForm();
              }
              setEditing((current) => !current);
            }}
          >
            Editar
          </button>
          <button
            type="button"
            className="card-delete-trigger"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onDelete(card)}
          >
            Excluir
          </button>
        </div>
      </div>
      <div className="lancamento-card-meta">
        {card.categoria?.grupo ? <span>{card.categoria.grupo}</span> : null}
        {card.contabiliza_saldo === false ? <span>Embutido</span> : null}
        <span>{formatDate(card.data)}</span>
      </div>

      {editing ? (
        <CardEditor
          value={formValues.value}
          date={formValues.date}
          saving={false}
          onChange={(event) =>
            setFormValues((current) => ({
              ...current,
              [event.target.name]: event.target.value
            }))
          }
          onCancel={() => {
            resetForm();
            setEditing(false);
          }}
          onSave={async () => {
            await onEdit(card, {
              valor: Number(formValues.value),
              data: formValues.date
            });
            setEditing(false);
          }}
        />
      ) : null}
    </article>
  );
}

function TransferenciaCard({ card, perspective, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    value: String(card.valor),
    date: card.data?.slice(0, 10) ?? ""
  });

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `transferencia:${card.id}`,
    disabled: editing
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1
  };

  const directionLabel = perspective === "origem" ? `Saida para ${card.subconta_destino?.nome ?? "-"}` : `Entrada de ${card.subconta_origem?.nome ?? "-"}`;

  function resetForm() {
    setFormValues({
      value: String(card.valor),
      date: card.data?.slice(0, 10) ?? ""
    });
  }

  return (
    <article ref={setNodeRef} style={style} className="lancamento-card transferencia-card" {...listeners} {...attributes}>
      <div className="lancamento-card-top">
        <strong>{card.descricao || "Transferencia"}</strong>
        <div className="lancamento-card-top-actions">
          <strong>{formatCurrency(card.valor)}</strong>
          <button
            type="button"
            className="card-edit-trigger"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => {
              if (!editing) {
                resetForm();
              }
              setEditing((current) => !current);
            }}
          >
            Editar
          </button>
        </div>
      </div>
      <div className="lancamento-card-meta">
        <span>{directionLabel}</span>
        <span>{formatDate(card.data)}</span>
      </div>

      {editing ? (
        <CardEditor
          value={formValues.value}
          date={formValues.date}
          saving={false}
          onChange={(event) =>
            setFormValues((current) => ({
              ...current,
              [event.target.name]: event.target.value
            }))
          }
          onCancel={() => {
            resetForm();
            setEditing(false);
          }}
          onSave={async () => {
            await onEdit(card, {
              valor: Number(formValues.value),
              data: formValues.date
            });
            setEditing(false);
          }}
        />
      ) : null}
    </article>
  );
}

function Section({ title, count, emptyMessage, children, kind, subcontaId, area, variant }) {
  const { isOver, setNodeRef } = useDroppable({
    id: zoneId(kind, subcontaId, area)
  });

  return (
    <div ref={setNodeRef} className={`subconta-section subconta-section-${variant} ${isOver ? "subconta-section-over" : ""}`}>
      <div className="subconta-section-header">
        <strong>{title}</strong>
        <span>{count}</span>
      </div>
      <div className="subconta-card-list">
        {count === 0 ? <div className="empty-drop-state">{emptyMessage}</div> : children}
      </div>
    </div>
  );
}

function SubcontaColumn({ subconta, lancamentos, transferencias, saldo, saldoPlan, saldoAcm, saldoPlanAcm, onLancamentoEdit, onLancamentoDelete, onTransferenciaEdit }) {
  const entradas = lancamentos.filter((card) => card.tipo === "entrada");
  const saidasNaoPagas = lancamentos.filter((card) => card.tipo === "saida" && card.status === "nao_pago");
  const saidasPagas = lancamentos.filter((card) => card.tipo === "saida" && card.status === "pago");
  const transferenciasPlanejadas = transferencias.filter((card) => card.status === "planejada");
  const transferenciasRealizadas = transferencias.filter((card) => card.status === "realizada");

  return (
    <section className="subconta-column">
      <header className="subconta-header">
        <div className="subconta-title-block">
          <h4>{subconta.nome}</h4>
          <p>{subconta.tipo}</p>
        </div>
        <div className="saldo-block">
          <div className="saldo-line saldo-line-primary">
            <span>Saldo</span>
            <strong>{formatCurrency(saldo)}</strong>
          </div>
          <div className="saldo-line">
            <span>Saldo plan</span>
            <strong>{formatCurrency(saldoPlan)}</strong>
          </div>
          <div className="saldo-line saldo-line-acm">
            <span>Saldo ACM</span>
            <strong>{formatCurrency(saldoAcm)}</strong>
          </div>
          <div className="saldo-line saldo-line-acm">
            <span>Plan ACM</span>
            <strong>{formatCurrency(saldoPlanAcm)}</strong>
          </div>
        </div>
      </header>

      <div className="subconta-sections">
        <Section title="Entradas" count={entradas.length} emptyMessage="Sem entradas" kind="lancamento" subcontaId={subconta.id} area="entrada" variant="entry">
          {entradas.map((card) => (
            <LancamentoCard key={card.id} card={card} onEdit={onLancamentoEdit} onDelete={onLancamentoDelete} />
          ))}
        </Section>

        <Section title="Nao pago" count={saidasNaoPagas.length} emptyMessage="Sem saidas" kind="lancamento" subcontaId={subconta.id} area="nao_pago" variant="unpaid">
          {saidasNaoPagas.map((card) => (
            <LancamentoCard key={card.id} card={card} onEdit={onLancamentoEdit} onDelete={onLancamentoDelete} />
          ))}
        </Section>

        <Section title="Pago" count={saidasPagas.length} emptyMessage="Sem pagos" kind="lancamento" subcontaId={subconta.id} area="pago" variant="paid">
          {saidasPagas.map((card) => (
            <LancamentoCard key={card.id} card={card} onEdit={onLancamentoEdit} onDelete={onLancamentoDelete} />
          ))}
        </Section>

        <Section title="Planejada" count={transferenciasPlanejadas.length} emptyMessage="Sem transferencias" kind="transferencia" subcontaId={subconta.id} area="planejada" variant="planned">
          {transferenciasPlanejadas.map((card) => (
            <TransferenciaCard key={`${card.id}-${subconta.id}`} card={card} perspective={card.subconta_origem_id === subconta.id ? "origem" : "destino"} onEdit={onTransferenciaEdit} />
          ))}
        </Section>

        <Section title="Realizada" count={transferenciasRealizadas.length} emptyMessage="Sem transferencias" kind="transferencia" subcontaId={subconta.id} area="realizada" variant="realized">
          {transferenciasRealizadas.map((card) => (
            <TransferenciaCard key={`${card.id}-${subconta.id}`} card={card} perspective={card.subconta_origem_id === subconta.id ? "origem" : "destino"} onEdit={onTransferenciaEdit} />
          ))}
        </Section>
      </div>
    </section>
  );
}

function computeSaldos(subcontas, lancamentos, transferencias) {
  const saldo = Object.fromEntries(subcontas.map((subconta) => [subconta.id, 0]));
  const saldoPlan = Object.fromEntries(subcontas.map((subconta) => [subconta.id, 0]));

  lancamentos.forEach((lancamento) => {
    if (lancamento.contabiliza_saldo === false) {
      return;
    }

    if (lancamento.tipo === "entrada") {
      saldo[lancamento.subconta_id] = (saldo[lancamento.subconta_id] ?? 0) + Number(lancamento.valor);
      saldoPlan[lancamento.subconta_id] = (saldoPlan[lancamento.subconta_id] ?? 0) + Number(lancamento.valor);
      return;
    }

    const plannedValue = Number(lancamento.valor_fatura_aberta ?? lancamento.valor);

    if (lancamento.status === "pago") {
      saldo[lancamento.subconta_id] = (saldo[lancamento.subconta_id] ?? 0) - Number(lancamento.valor);
    }

    saldoPlan[lancamento.subconta_id] = (saldoPlan[lancamento.subconta_id] ?? 0) - plannedValue;
  });

  transferencias.forEach((transferencia) => {
    const isRealizada = transferencia.status === "realizada";
    const value = Number(transferencia.valor);

    if (isRealizada) {
      saldo[transferencia.subconta_origem_id] = (saldo[transferencia.subconta_origem_id] ?? 0) - value;
      saldo[transferencia.subconta_destino_id] = (saldo[transferencia.subconta_destino_id] ?? 0) + value;
    }

    saldoPlan[transferencia.subconta_origem_id] = (saldoPlan[transferencia.subconta_origem_id] ?? 0) - value;
    saldoPlan[transferencia.subconta_destino_id] = (saldoPlan[transferencia.subconta_destino_id] ?? 0) + value;
  });

  return { saldo, saldoPlan };
}

export default function MovementBoard({
  carteiras,
  subcontas,
  lancamentos,
  transferencias,
  lancamentosAcumulados = [],
  transferenciasAcumuladas = [],
  onLancamentoMove,
  onTransferenciaMove,
  onLancamentoEdit,
  onLancamentoDelete,
  onTransferenciaEdit,
  saving
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const displayLancamentos = useMemo(() => adjustFaturaCards(lancamentos), [lancamentos]);
  const displayLancamentosAcumulados = useMemo(() => adjustFaturaCards(lancamentosAcumulados), [lancamentosAcumulados]);

  const { saldo, saldoPlan } = useMemo(() => computeSaldos(subcontas, displayLancamentos, transferencias), [subcontas, displayLancamentos, transferencias]);
  const { saldo: saldoAcm, saldoPlan: saldoPlanAcm } = useMemo(
    () => computeSaldos(subcontas, displayLancamentosAcumulados, transferenciasAcumuladas),
    [subcontas, displayLancamentosAcumulados, transferenciasAcumuladas]
  );

  const lancamentosBySubconta = useMemo(() => {
    const map = Object.fromEntries(subcontas.map((subconta) => [subconta.id, []]));
    displayLancamentos.forEach((item) => {
      if (map[item.subconta_id]) {
        map[item.subconta_id].push(item);
      }
    });
    return map;
  }, [subcontas, displayLancamentos]);

  const transferenciasBySubconta = useMemo(() => {
    const map = Object.fromEntries(subcontas.map((subconta) => [subconta.id, []]));
    transferencias.forEach((item) => {
      if (map[item.subconta_origem_id]) {
        map[item.subconta_origem_id].push(item);
      }
      if (map[item.subconta_destino_id]) {
        map[item.subconta_destino_id].push(item);
      }
    });
    return map;
  }, [subcontas, transferencias]);

  async function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const [kind, rawId] = String(active.id).split(":");
    const destination = parseZoneId(over.id);

    if (kind === "lancamento") {
      const lancamento = lancamentos.find((item) => String(item.id) === rawId);

      if (!lancamento || destination.kind !== "lancamento") {
        return;
      }

      if (lancamento.tipo === "entrada" && destination.area !== "entrada") {
        return;
      }

      if (lancamento.tipo === "saida" && !["nao_pago", "pago"].includes(destination.area)) {
        return;
      }

      const payload = {
        subconta_id: destination.subcontaId
      };

      if (lancamento.tipo === "saida") {
        payload.status = destination.area;
      }

      if (Number(lancamento.subconta_id) === payload.subconta_id && (!payload.status || lancamento.status === payload.status)) {
        return;
      }

      await onLancamentoMove(lancamento, payload);
      return;
    }

    if (kind === "transferencia") {
      const transferencia = transferencias.find((item) => String(item.id) === rawId);

      if (!transferencia || destination.kind !== "transferencia") {
        return;
      }

      const relatedToSubconta =
        transferencia.subconta_origem_id === destination.subcontaId || transferencia.subconta_destino_id === destination.subcontaId;

      if (!relatedToSubconta) {
        return;
      }

      if (!["planejada", "realizada"].includes(destination.area) || transferencia.status === destination.area) {
        return;
      }

      await onTransferenciaMove(transferencia, { status: destination.area });
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="movement-note">
        <div className="movement-note-meta">
          <span>{displayLancamentos.filter((item) => item.tipo === "entrada").length} entradas</span>
          <span>{displayLancamentos.filter((item) => item.tipo === "saida" && item.status === "nao_pago").length} nao pagos</span>
          <span>{transferencias.filter((item) => item.status === "planejada").length} planejadas</span>
          <span>{saving ? "Salvando..." : "Sincronizado"}</span>
        </div>
      </div>

      <div className="wallet-grid">
        {carteiras.map((carteira) => (
          <section key={carteira.id} className="wallet-panel">
            <header className="wallet-header">
              <div className="wallet-title-block">
                <span className="wallet-kicker">{carteira.tipo}</span>
                <h3>{carteira.nome}</h3>
              </div>
              <div className="wallet-balance-stack">
                <span>Saldo</span>
                <strong className="wallet-balance-primary">
                  {formatCurrency(
                    subcontas
                      .filter((subconta) => subconta.carteira_id === carteira.id)
                      .reduce((total, subconta) => total + (saldo[subconta.id] ?? 0), 0)
                  )}
                </strong>
                <span>Saldo plan</span>
                <strong className="wallet-balance-secondary">
                  {formatCurrency(
                    subcontas
                      .filter((subconta) => subconta.carteira_id === carteira.id)
                      .reduce((total, subconta) => total + (saldoPlan[subconta.id] ?? 0), 0)
                  )}
                </strong>
                <span>Saldo ACM</span>
                <strong className="wallet-balance-secondary">
                  {formatCurrency(
                    subcontas
                      .filter((subconta) => subconta.carteira_id === carteira.id)
                      .reduce((total, subconta) => total + (saldoAcm[subconta.id] ?? 0), 0)
                  )}
                </strong>
                <span>Plan ACM</span>
                <strong className="wallet-balance-secondary">
                  {formatCurrency(
                    subcontas
                      .filter((subconta) => subconta.carteira_id === carteira.id)
                      .reduce((total, subconta) => total + (saldoPlanAcm[subconta.id] ?? 0), 0)
                  )}
                </strong>
              </div>
            </header>

            <div className="subcontas-grid">
              {subcontas
                .filter((subconta) => subconta.carteira_id === carteira.id)
                .map((subconta) => (
                  <SubcontaColumn
                    key={subconta.id}
                    subconta={subconta}
                    lancamentos={lancamentosBySubconta[subconta.id] ?? []}
                    transferencias={transferenciasBySubconta[subconta.id] ?? []}
                    saldo={saldo[subconta.id] ?? 0}
                    saldoPlan={saldoPlan[subconta.id] ?? 0}
                    saldoAcm={saldoAcm[subconta.id] ?? 0}
                    saldoPlanAcm={saldoPlanAcm[subconta.id] ?? 0}
                    onLancamentoEdit={onLancamentoEdit}
                    onLancamentoDelete={onLancamentoDelete}
                    onTransferenciaEdit={onTransferenciaEdit}
                  />
                ))}
            </div>
          </section>
        ))}
      </div>
    </DndContext>
  );
}
