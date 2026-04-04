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
      { value: "saida", label: "Saida" }
    ]
  },
  { name: "grupo", label: "Grupo", type: "text", required: true, placeholder: "Ex.: essencial" },
  { name: "ativa", label: "Ativa", type: "checkbox" },
  { name: "eh_embutida", label: "Eh embutida", type: "checkbox" }
];

const columns = [
  { key: "nome", label: "Nome" },
  { key: "tipo", label: "Tipo" },
  { key: "grupo", label: "Grupo" },
  { key: "ativa", label: "Ativa", render: (row) => (row.ativa ? "Sim" : "Nao") },
  { key: "eh_embutida", label: "Embutida", render: (row) => (row.eh_embutida ? "Sim" : "Nao") }
];

export default function CategoriasPage() {
  return (
    <EntityManager
      title="Categorias"
      description="Categorias independentes para classificar entradas, saidas e composicoes embutidas."
      endpoint="categorias"
      fields={fields}
      columns={columns}
      toFormValues={(item) => ({
        nome: item.nome,
        tipo: item.tipo,
        grupo: item.grupo,
        ativa: item.ativa,
        eh_embutida: Boolean(item.eh_embutida)
      })}
      buildPayload={(values) => ({
        nome: values.nome,
        tipo: values.tipo,
        grupo: values.grupo,
        ativa: Boolean(values.ativa),
        eh_embutida: Boolean(values.eh_embutida)
      })}
    />
  );
}
