import EntityManager from "../components/EntityManager";

const fields = [
  { name: "nome", label: "Nome", type: "text", required: true, placeholder: "Ex.: Marcus" },
  { name: "ativa", label: "Ativa", type: "checkbox" }
];

const columns = [
  { key: "nome", label: "Nome" },
  { key: "ativa", label: "Ativa", render: (row) => (row.ativa ? "Sim" : "Nao") }
];

export default function PessoasPage() {
  return (
    <EntityManager
      title="Pessoas"
      description="Cadastre quem participa dos lancamentos do app."
      endpoint="pessoas"
      fields={fields}
      columns={columns}
      toFormValues={(item) => ({
        nome: item.nome,
        ativa: item.ativa
      })}
      buildPayload={(values) => ({
        nome: values.nome,
        ativa: Boolean(values.ativa)
      })}
    />
  );
}
