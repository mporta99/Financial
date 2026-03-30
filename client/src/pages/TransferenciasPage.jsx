import EntityManager from "../components/EntityManager";
import { getResourceList } from "../services/api/resources";
import { formatCurrency, formatDate } from "../services/formatters";

const fields = [
  { name: "data", label: "Data", type: "date", required: true },
  { name: "valor", label: "Valor", type: "number", step: "0.01", required: true, placeholder: "0.00" },
  {
    name: "subconta_origem_id",
    label: "Subconta de origem",
    type: "select",
    required: true,
    options: (lookups) => lookups.subcontas ?? []
  },
  {
    name: "subconta_destino_id",
    label: "Subconta de destino",
    type: "select",
    required: true,
    options: (lookups) => lookups.subcontas ?? []
  },
  { name: "descricao", label: "Descrição", type: "text", placeholder: "Descrição opcional" }
];

const columns = [
  { key: "data", label: "Data", render: (row) => formatDate(row.data) },
  { key: "valor", label: "Valor", render: (row) => formatCurrency(row.valor) },
  {
    key: "origem",
    label: "Origem",
    render: (row) => `${row.subconta_origem?.carteira?.nome ?? "-"} / ${row.subconta_origem?.nome ?? "-"}`
  },
  {
    key: "destino",
    label: "Destino",
    render: (row) => `${row.subconta_destino?.carteira?.nome ?? "-"} / ${row.subconta_destino?.nome ?? "-"}`
  },
  { key: "descricao", label: "Descrição", render: (row) => row.descricao || "-" }
];

export default function TransferenciasPage() {
  return (
    <EntityManager
      title="Transferências"
      description="Movimentações entre subcontas sem tratar como entrada ou saída."
      endpoint="transferencias"
      fields={fields}
      columns={columns}
      loadLookups={async () => {
        const subcontas = await getResourceList("subcontas");
        return {
          subcontas: subcontas.map((item) => ({ value: String(item.id), label: `${item.carteira?.nome} / ${item.nome}` }))
        };
      }}
      toFormValues={(item) => ({
        data: item.data?.slice(0, 10) ?? "",
        valor: String(item.valor),
        subconta_origem_id: String(item.subconta_origem_id),
        subconta_destino_id: String(item.subconta_destino_id),
        descricao: item.descricao ?? ""
      })}
      buildPayload={(values) => ({
        data: values.data,
        valor: Number(values.valor),
        subconta_origem_id: Number(values.subconta_origem_id),
        subconta_destino_id: Number(values.subconta_destino_id),
        descricao: values.descricao?.trim() ? values.descricao.trim() : null
      })}
    />
  );
}
