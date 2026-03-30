import EntityManager from "../components/EntityManager";
import { getResourceList } from "../services/api/resources";

const fields = [
  { name: "nome", label: "Nome", type: "text", required: true, placeholder: "Ex.: Alimentação" },
  {
    name: "tipo",
    label: "Tipo",
    type: "select",
    required: true,
    options: [
      { value: "livre", label: "Livre" },
      { value: "restrita", label: "Restrita" },
      { value: "investimento", label: "Investimento" }
    ]
  },
  {
    name: "carteira_id",
    label: "Carteira",
    type: "select",
    required: true,
    options: (lookups) => lookups.carteiras ?? []
  },
  { name: "ativa", label: "Ativa", type: "checkbox" }
];

const columns = [
  { key: "nome", label: "Nome" },
  { key: "tipo", label: "Tipo" },
  { key: "carteira", label: "Carteira", render: (row) => row.carteira?.nome ?? "-" },
  { key: "ativa", label: "Ativa", render: (row) => (row.ativa ? "Sim" : "Não") }
];

export default function SubcontasPage() {
  return (
    <EntityManager
      title="Subcontas"
      description="Cadastro de subcontas ligadas às carteiras."
      endpoint="subcontas"
      fields={fields}
      columns={columns}
      loadLookups={async () => {
        const carteiras = await getResourceList("carteiras");
        return {
          carteiras: carteiras.map((item) => ({ value: String(item.id), label: item.nome }))
        };
      }}
      toFormValues={(item) => ({
        nome: item.nome,
        tipo: item.tipo,
        carteira_id: String(item.carteira_id),
        ativa: item.ativa
      })}
      buildPayload={(values) => ({
        nome: values.nome,
        tipo: values.tipo,
        carteira_id: Number(values.carteira_id),
        ativa: Boolean(values.ativa)
      })}
    />
  );
}
