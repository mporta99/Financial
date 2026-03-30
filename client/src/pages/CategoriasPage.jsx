import EntityManager from "../components/EntityManager";

const fields = [
  { name: "nome", label: "Nome", type: "text", required: true, placeholder: "Ex.: Mercado" },
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
  { name: "grupo", label: "Grupo", type: "text", required: true, placeholder: "Ex.: essencial" },
  { name: "ativa", label: "Ativa", type: "checkbox" }
];

const columns = [
  { key: "nome", label: "Nome" },
  { key: "tipo", label: "Tipo" },
  { key: "grupo", label: "Grupo" },
  { key: "ativa", label: "Ativa", render: (row) => (row.ativa ? "Sim" : "Não") }
];

export default function CategoriasPage() {
  return (
    <EntityManager
      title="Categorias"
      description="Categorias independentes para classificar entradas e saídas."
      endpoint="categorias"
      fields={fields}
      columns={columns}
      toFormValues={(item) => ({
        nome: item.nome,
        tipo: item.tipo,
        grupo: item.grupo,
        ativa: item.ativa
      })}
      buildPayload={(values) => ({
        nome: values.nome,
        tipo: values.tipo,
        grupo: values.grupo,
        ativa: Boolean(values.ativa)
      })}
    />
  );
}
