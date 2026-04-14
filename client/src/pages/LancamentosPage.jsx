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
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "nao_pago", label: "Nao pago" },
      { value: "pago", label: "Pago" }
    ]
  },
  { name: "data_pagamento", label: "Data pagamento", type: "date" },
  {
    name: "pessoa_id",
    label: "Pessoa",
    type: "select",
    required: true,
    options: (lookups) => lookups.pessoas ?? []
  },
  { name: "casa", label: "Casa", type: "checkbox" },
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
  {
    name: "template_lancamento_id",
    label: "Template",
    type: "select",
    options: (lookups) => lookups.templates ?? []
  },
  { name: "descricao", label: "Descricao", type: "text", placeholder: "Descricao opcional" }
];

const columns = [
  { key: "data", label: "Data", render: (row) => formatDate(row.data) },
  { key: "competencia", label: "Mes/Ano", render: (row) => `${row.mes}/${row.ano}` },
  { key: "descricao", label: "Descricao", render: (row) => row.descricao || "-" },
  { key: "pessoa", label: "Pessoa", render: (row) => row.pessoa?.nome ?? "-" },
  { key: "casa", label: "Casa", render: (row) => (row.casa ? "Sim" : "Nao") },
  { key: "status", label: "Status" },
  { key: "tipo", label: "Tipo" },
  { key: "valor", label: "Valor", render: (row) => formatCurrency(row.valor) },
  { key: "categoria", label: "Categoria", render: (row) => row.categoria?.nome ?? "-" },
  { key: "template_lancamento", label: "Template", render: (row) => row.template_lancamento?.nome ?? "-" },
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
        const [pessoas, categorias, subcontas, templates] = await Promise.all([
          getResourceList("pessoas"),
          getResourceList("categorias"),
          getResourceList("subcontas"),
          getResourceList("templates-lancamento")
        ]);

        return {
          pessoas: pessoas.map((item) => ({ value: String(item.id), label: item.nome })),
          categorias: categorias.map((item) => ({ value: String(item.id), label: `${item.nome} (${item.tipo})` })),
          subcontas: subcontas.map((item) => ({ value: String(item.id), label: `${item.carteira?.nome} / ${item.nome}` })),
          templates: templates.map((item) => ({ value: String(item.id), label: item.nome }))
        };
      }}
      toFormValues={(item) => ({
        data: item.data?.slice(0, 10) ?? "",
        mes: String(item.mes ?? ""),
        ano: String(item.ano ?? ""),
        valor: String(item.valor),
        tipo: item.tipo,
        status: item.status ?? "nao_pago",
        data_pagamento: item.data_pagamento?.slice(0, 10) ?? "",
        pessoa_id: String(item.pessoa_id),
        casa: Boolean(item.casa),
        categoria_id: String(item.categoria_id),
        subconta_id: String(item.subconta_id),
        template_lancamento_id: item.template_lancamento_id == null ? "" : String(item.template_lancamento_id),
        descricao: item.descricao ?? ""
      })}
      buildPayload={(values) => ({
        data: values.data,
        mes: Number(values.mes),
        ano: Number(values.ano),
        valor: Number(values.valor),
        tipo: values.tipo,
        status: values.status,
        data_pagamento: values.data_pagamento?.trim() ? values.data_pagamento : null,
        pessoa_id: Number(values.pessoa_id),
        casa: Boolean(values.casa),
        categoria_id: Number(values.categoria_id),
        subconta_id: Number(values.subconta_id),
        template_lancamento_id: values.template_lancamento_id ? Number(values.template_lancamento_id) : null,
        descricao: values.descricao?.trim() ? values.descricao.trim() : null
      })}
    />
  );
}
