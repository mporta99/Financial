import EntityManager from "../components/EntityManager";
import { getResourceList } from "../services/api/resources";

const GRUPOS_CATEGORIA = ["Essenciais", "Conforto", "Investimentos", "Outros", "Cartao"];

const fields = [
  { name: "nome", label: "Nome", type: "text", required: true, placeholder: "Ex.: Mercado" },
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
    name: "grupo",
    label: "Grupo",
    type: "select",
    required: true,
    options: GRUPOS_CATEGORIA.map((item) => ({ value: item, label: item }))
  },
  { name: "ativa", label: "Ativa", type: "checkbox" },
  { name: "casa", label: "Casa", type: "checkbox" },
  {
    name: "subconta_id",
    label: "Subconta padrao",
    type: "select",
    options: (lookups) => lookups.subcontas ?? []
  },
  { name: "embutido", label: "Embutido", type: "checkbox" }
];

const columns = [
  { key: "nome", label: "Nome" },
  { key: "tipo", label: "Tipo" },
  { key: "grupo", label: "Grupo" },
  { key: "ativa", label: "Ativa", render: (row) => (row.ativa ? "Sim" : "Nao") },
  { key: "casa", label: "Casa", render: (row) => (row.casa ? "Sim" : "Nao") },
  { key: "subconta_padrao", label: "Subconta padrao", render: (row) => row.subconta_padrao?.nome ?? "-" },
  { key: "embutido", label: "Embutida", render: (row) => (row.embutido ? "Sim" : "Nao") }
];

export default function CategoriasPage() {
  return (
    <EntityManager
      title="Categorias"
      description="Categorias independentes para classificar entradas, saidas e composicoes embutidas."
      endpoint="categorias"
      fields={fields}
      columns={columns}
      loadLookups={async () => {
        const subcontas = await getResourceList("subcontas");
        return {
          subcontas: [{ value: "", label: "Sem subconta padrao" }].concat(
            subcontas.map((item) => ({ value: String(item.id), label: `${item.carteira?.nome} / ${item.nome}` }))
          )
        };
      }}
      toFormValues={(item) => ({
        nome: item.nome,
        tipo: item.tipo,
        grupo: item.grupo,
        ativa: item.ativa,
        casa: Boolean(item.casa),
        subconta_id: item.subconta_id == null ? "" : String(item.subconta_id),
        embutido: Boolean(item.embutido)
      })}
      buildPayload={(values) => ({
        nome: values.nome,
        tipo: values.tipo,
        grupo: values.grupo,
        ativa: Boolean(values.ativa),
        casa: Boolean(values.casa),
        subconta_id: values.subconta_id ? Number(values.subconta_id) : null,
        embutido: Boolean(values.embutido)
      })}
    />
  );
}
