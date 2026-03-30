import EntityManager from "../components/EntityManager";
import { getResourceList } from "../services/api/resources";
import { formatCurrency, formatDate } from "../services/formatters";

const fields = [
  { name: "data", label: "Data", type: "date", required: true },
  { name: "valor", label: "Valor", type: "number", step: "0.01", required: true, placeholder: "0.00" },
  {
    name: "tipo",
    label: "Tipo",
    type: "select",
    required: true,
    options: [
      { value: "entrada", label: "Entrada" },
      { value: "saida", label: "Saída" }
    ]
  },
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
  { name: "descricao", label: "Descrição", type: "text", placeholder: "Descrição opcional" }
];

const columns = [
  { key: "data", label: "Data", render: (row) => formatDate(row.data) },
  { key: "descricao", label: "Descrição", render: (row) => row.descricao || "-" },
  { key: "tipo", label: "Tipo" },
  { key: "valor", label: "Valor", render: (row) => formatCurrency(row.valor) },
  { key: "categoria", label: "Categoria", render: (row) => row.categoria?.nome ?? "-" },
  { key: "subconta", label: "Subconta", render: (row) => row.subconta?.nome ?? "-" }
];

export default function LancamentosPage() {
  return (
    <EntityManager
      title="Lançamentos"
      description="Entradas e saídas reais de dinheiro conectadas a categoria e subconta."
      endpoint="lancamentos"
      fields={fields}
      columns={columns}
      loadLookups={async () => {
        const [categorias, subcontas] = await Promise.all([
          getResourceList("categorias"),
          getResourceList("subcontas")
        ]);

        return {
          categorias: categorias.map((item) => ({ value: String(item.id), label: `${item.nome} (${item.tipo})` })),
          subcontas: subcontas.map((item) => ({ value: String(item.id), label: `${item.carteira?.nome} / ${item.nome}` }))
        };
      }}
      toFormValues={(item) => ({
        data: item.data?.slice(0, 10) ?? "",
        valor: String(item.valor),
        tipo: item.tipo,
        categoria_id: String(item.categoria_id),
        subconta_id: String(item.subconta_id),
        descricao: item.descricao ?? ""
      })}
      buildPayload={(values) => ({
        data: values.data,
        valor: Number(values.valor),
        tipo: values.tipo,
        categoria_id: Number(values.categoria_id),
        subconta_id: Number(values.subconta_id),
        descricao: values.descricao?.trim() ? values.descricao.trim() : null
      })}
    />
  );
}
