import EntityManager from "../components/EntityManager";

const fields = [
  { name: "nome", label: "Nome", type: "text", required: true, placeholder: "Ex.: Nubank" },
  { name: "tipo", label: "Tipo", type: "text", required: true, placeholder: "Ex.: banco" },
  { name: "ativa", label: "Ativa", type: "checkbox" }
];

const columns = [
  { key: "nome", label: "Nome" },
  { key: "tipo", label: "Tipo" },
  { key: "ativa", label: "Ativa", render: (row) => (row.ativa ? "Sim" : "Não") }
];

export default function CarteirasPage() {
  return (
    <EntityManager
      title="Carteiras"
      description="Listagem e cadastro das carteiras principais do sistema."
      endpoint="carteiras"
      fields={fields}
      columns={columns}
      toFormValues={(item) => ({
        nome: item.nome,
        tipo: item.tipo,
        ativa: item.ativa
      })}
      buildPayload={(values) => ({
        nome: values.nome,
        tipo: values.tipo,
        ativa: Boolean(values.ativa)
      })}
    />
  );
}
