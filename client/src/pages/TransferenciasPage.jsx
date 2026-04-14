import EntityManager from "../components/EntityManager";
import { getResourceList } from "../services/api/resources";
import { formatCurrency, formatDate } from "../services/formatters";

const fields = [
  { name: "data", label: "Data", type: "date", required: true },
  { name: "mes", label: "Mes", type: "number", required: true, placeholder: "3" },
  { name: "ano", label: "Ano", type: "number", required: true, placeholder: "2026" },
  { name: "valor", label: "Valor", type: "number", step: "0.01", required: true, placeholder: "0.00" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "planejada", label: "Planejada" },
      { value: "realizada", label: "Realizada" }
    ]
  },
  { name: "data_realizacao", label: "Data realizacao", type: "date" },
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
  { name: "descricao", label: "Descricao", type: "text", placeholder: "Descricao opcional" }
];

const columns = [
  { key: "data", label: "Data", render: (row) => formatDate(row.data) },
  { key: "competencia", label: "Mes/Ano", render: (row) => `${row.mes}/${row.ano}` },
  { key: "status", label: "Status" },
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
  { key: "descricao", label: "Descricao", render: (row) => row.descricao || "-" }
];

export default function TransferenciasPage() {
  return (
    <EntityManager
      title="Transferencias"
      description="Movimentacoes entre subcontas com status planejada ou realizada."
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
        mes: String(item.mes ?? ""),
        ano: String(item.ano ?? ""),
        valor: String(item.valor),
        status: item.status ?? "planejada",
        data_realizacao: item.data_realizacao?.slice(0, 10) ?? "",
        subconta_origem_id: String(item.subconta_origem_id),
        subconta_destino_id: String(item.subconta_destino_id),
        descricao: item.descricao ?? ""
      })}
      buildPayload={(values) => ({
        data: values.data,
        mes: Number(values.mes),
        ano: Number(values.ano),
        valor: Number(values.valor),
        status: values.status,
        data_realizacao: values.data_realizacao?.trim() ? values.data_realizacao : null,
        subconta_origem_id: Number(values.subconta_origem_id),
        subconta_destino_id: Number(values.subconta_destino_id),
        descricao: values.descricao?.trim() ? values.descricao.trim() : null
      })}
    />
  );
}
