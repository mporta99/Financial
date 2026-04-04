import EntityManager from "../components/EntityManager";
import { getResourceList } from "../services/api/resources";
import { formatCurrency } from "../services/formatters";

const fields = [
  {
    name: "template_pai_id",
    label: "Template pai",
    type: "select",
    required: true,
    options: (lookups) => lookups.templates ?? []
  },
  {
    name: "categoria_id",
    label: "Categoria",
    type: "select",
    required: true,
    options: (lookups) => lookups.categorias ?? []
  },
  { name: "tem_valor_fixo", label: "Tem valor fixo", type: "checkbox" },
  { name: "valor_padrao", label: "Valor padrao", type: "number", step: "0.01", placeholder: "0.00" },
  { name: "dia_fixo", label: "Dia fixo", type: "number", placeholder: "10" }
];

const columns = [
  { key: "template_pai", label: "Template pai", render: (row) => row.template_pai?.nome ?? "-" },
  { key: "categoria", label: "Categoria", render: (row) => row.categoria?.nome ?? "-" },
  { key: "tem_valor_fixo", label: "Valor fixo", render: (row) => (row.tem_valor_fixo ? "Sim" : "Nao") },
  { key: "valor_padrao", label: "Valor padrao", render: (row) => (row.valor_padrao == null ? "-" : formatCurrency(row.valor_padrao)) },
  { key: "dia_fixo", label: "Dia fixo", render: (row) => row.dia_fixo ?? "-" }
];

export default function ItensTemplatePage() {
  return (
    <EntityManager
      title="Itens de Template"
      description="Monte a composicao analitica dos templates principais."
      endpoint="itens-template"
      fields={fields}
      columns={columns}
      loadLookups={async () => {
        const [templates, categorias] = await Promise.all([
          getResourceList("templates-lancamento"),
          getResourceList("categorias")
        ]);

        return {
          templates: templates.map((item) => ({ value: String(item.id), label: item.nome })),
          categorias: categorias.map((item) => ({ value: String(item.id), label: `${item.nome} (${item.tipo})` }))
        };
      }}
      toFormValues={(item) => ({
        template_pai_id: String(item.template_pai_id),
        categoria_id: String(item.categoria_id),
        tem_valor_fixo: item.tem_valor_fixo,
        valor_padrao: item.valor_padrao == null ? "" : String(item.valor_padrao),
        dia_fixo: item.dia_fixo == null ? "" : String(item.dia_fixo)
      })}
      buildPayload={(values) => ({
        template_pai_id: Number(values.template_pai_id),
        categoria_id: Number(values.categoria_id),
        tem_valor_fixo: Boolean(values.tem_valor_fixo),
        valor_padrao: values.valor_padrao === "" ? null : Number(values.valor_padrao),
        dia_fixo: values.dia_fixo === "" ? null : Number(values.dia_fixo)
      })}
    />
  );
}
