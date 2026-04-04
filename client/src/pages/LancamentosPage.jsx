import EntityManager from "../components/EntityManager";
import { getResourceList } from "../services/api/resources";
import { formatCurrency, formatDate } from "../services/formatters";

const fields = [
  { name: "data", label: "Data", type: "date", required: true },
  { name: "mes", label: "Mes", type: "number", required: true, placeholder: "3" },
  { name: "ano", label: "Ano", type: "number", required: true, placeholder: "2026" },
  { name: "valor", label: "Valor", type: "number", step: "0.01", required: true, placeholder: "0.00" },
  {
    name: "tipo",
    label: "Tipo",
    type: "select",
    required: true,
    options: [
      { value: "entrada", label: "Entrada" },
      { value: "saida", label: "Saida" }
    ]
  },
  {
    name: "pessoa_id",
    label: "Pessoa",
    type: "select",
    required: true,
    options: (lookups) => lookups.pessoas ?? []
  },
  { name: "eh_casa", label: "Eh da casa", type: "checkbox" },
  {
    name: "categoria_id",
    label: "Categoria",
    type: "select",
    required: true,
    options: (lookups) => lookups.categorias ?? []
  },
  {
    name: "subconta_id",
    label: "Subconta",
    type: "select",
    required: true,
    options: (lookups) => lookups.subcontas ?? []
  },
  { name: "descricao", label: "Descricao", type: "text", placeholder: "Descricao opcional" }
];

const columns = [
  { key: "data", label: "Data", render: (row) => formatDate(row.data) },
  { key: "competencia", label: "Mes/Ano", render: (row) => `${row.mes}/${row.ano}` },
  { key: "descricao", label: "Descricao", render: (row) => row.descricao || "-" },
  { key: "pessoa", label: "Pessoa", render: (row) => row.pessoa?.nome ?? "-" },
  { key: "eh_casa", label: "Casa", render: (row) => (row.eh_casa ? "Sim" : "Nao") },
  { key: "tipo", label: "Tipo" },
  { key: "valor", label: "Valor", render: (row) => formatCurrency(row.valor) },
  { key: "categoria", label: "Categoria", render: (row) => row.categoria?.nome ?? "-" },
  { key: "subconta", label: "Subconta", render: (row) => row.subconta?.nome ?? "-" }
];

export default function LancamentosPage() {
  return (
    <EntityManager
      title="Lancamentos"
      description="Entradas e saidas reais de dinheiro conectadas a pessoa, categoria e subconta."
      endpoint="lancamentos"
      fields={fields}
      columns={columns}
      loadLookups={async () => {
        const [pessoas, categorias, subcontas] = await Promise.all([
          getResourceList("pessoas"),
          getResourceList("categorias"),
          getResourceList("subcontas")
        ]);

        return {
          pessoas: pessoas.map((item) => ({ value: String(item.id), label: item.nome })),
          categorias: categorias.map((item) => ({ value: String(item.id), label: `${item.nome} (${item.tipo})` })),
          subcontas: subcontas.map((item) => ({ value: String(item.id), label: `${item.carteira?.nome} / ${item.nome}` }))
        };
      }}
      toFormValues={(item) => ({
        data: item.data?.slice(0, 10) ?? "",
        mes: String(item.mes ?? ""),
        ano: String(item.ano ?? ""),
        valor: String(item.valor),
        tipo: item.tipo,
        pessoa_id: String(item.pessoa_id),
        eh_casa: Boolean(item.eh_casa),
        categoria_id: String(item.categoria_id),
        subconta_id: String(item.subconta_id),
        descricao: item.descricao ?? ""
      })}
      buildPayload={(values) => ({
        data: values.data,
        mes: Number(values.mes),
        ano: Number(values.ano),
        valor: Number(values.valor),
        tipo: values.tipo,
        pessoa_id: Number(values.pessoa_id),
        eh_casa: Boolean(values.eh_casa),
        categoria_id: Number(values.categoria_id),
        subconta_id: Number(values.subconta_id),
        descricao: values.descricao?.trim() ? values.descricao.trim() : null
      })}
    />
  );
}
