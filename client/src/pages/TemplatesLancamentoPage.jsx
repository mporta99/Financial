import EntityManager from "../components/EntityManager";
import { getResourceList } from "../services/api/resources";
import { formatCurrency } from "../services/formatters";

const fields = [
  { name: "nome", label: "Nome", type: "text", required: true, placeholder: "Ex.: Fatura" },
  {
    name: "categoria_id",
    label: "Categoria",
    type: "select",
    required: true,
    options: (lookups) => lookups.categorias ?? []
  },
  {
    name: "pessoa_id",
    label: "Pessoa",
    type: "select",
    options: (lookups) => lookups.pessoas ?? []
  },
  { name: "ativo", label: "Ativo", type: "checkbox" },
  {
    name: "frequencia",
    label: "Frequencia",
    type: "select",
    required: true,
    options: [{ value: "mensal", label: "Mensal" }]
  },
  {
    name: "tipo_geracao",
    label: "Tipo de geracao",
    type: "select",
    required: true,
    options: [
      { value: "fixo", label: "Fixo" },
      { value: "variavel_com_data", label: "Variavel com data" },
      { value: "acumulador", label: "Acumulador" },
      { value: "embutido", label: "Embutido" }
    ]
  },
  { name: "dia_fixo", label: "Dia fixo", type: "number", placeholder: "10" },
  { name: "tem_valor_fixo", label: "Tem valor fixo", type: "checkbox" },
  { name: "valor_padrao", label: "Valor padrao", type: "number", step: "0.01", placeholder: "0.00" },
  { name: "gera_lancamento", label: "Gera lancamento", type: "checkbox" }
];

const columns = [
  { key: "nome", label: "Nome" },
  { key: "categoria", label: "Categoria", render: (row) => row.categoria?.nome ?? "-" },
  { key: "pessoa", label: "Pessoa", render: (row) => row.pessoa?.nome ?? "Todas" },
  { key: "frequencia", label: "Frequencia" },
  { key: "tipo_geracao", label: "Tipo geracao" },
  { key: "dia_fixo", label: "Dia fixo", render: (row) => row.dia_fixo ?? "-" },
  { key: "tem_valor_fixo", label: "Valor fixo", render: (row) => (row.tem_valor_fixo ? "Sim" : "Nao") },
  { key: "valor_padrao", label: "Valor padrao", render: (row) => (row.valor_padrao == null ? "-" : formatCurrency(row.valor_padrao)) },
  { key: "gera_lancamento", label: "Gera lancamento", render: (row) => (row.gera_lancamento ? "Sim" : "Nao") },
  { key: "ativo", label: "Ativo", render: (row) => (row.ativo ? "Sim" : "Nao") }
];

export default function TemplatesLancamentoPage() {
  return (
    <EntityManager
      title="Templates de Lancamento"
      description="Defina como um lancamento nasce em cada mes."
      endpoint="templates-lancamento"
      fields={fields}
      columns={columns}
      loadLookups={async () => {
        const [categorias, pessoas] = await Promise.all([getResourceList("categorias"), getResourceList("pessoas")]);
        return {
          categorias: categorias.map((item) => ({ value: String(item.id), label: `${item.nome} (${item.tipo})` })),
          pessoas: [{ value: "", label: "Todas as pessoas" }].concat(pessoas.map((item) => ({ value: String(item.id), label: item.nome })))
        };
      }}
      toFormValues={(item) => ({
        nome: item.nome,
        categoria_id: String(item.categoria_id),
        pessoa_id: item.pessoa_id == null ? "" : String(item.pessoa_id),
        ativo: item.ativo,
        frequencia: item.frequencia,
        tipo_geracao: item.tipo_geracao,
        dia_fixo: item.dia_fixo == null ? "" : String(item.dia_fixo),
        tem_valor_fixo: item.tem_valor_fixo,
        valor_padrao: item.valor_padrao == null ? "" : String(item.valor_padrao),
        gera_lancamento: item.gera_lancamento
      })}
      buildPayload={(values) => ({
        nome: values.nome,
        categoria_id: Number(values.categoria_id),
        pessoa_id: values.pessoa_id === "" ? null : Number(values.pessoa_id),
        ativo: Boolean(values.ativo),
        frequencia: values.frequencia,
        tipo_geracao: values.tipo_geracao,
        dia_fixo: values.dia_fixo === "" ? null : Number(values.dia_fixo),
        tem_valor_fixo: Boolean(values.tem_valor_fixo),
        valor_padrao: values.valor_padrao === "" ? null : Number(values.valor_padrao),
        gera_lancamento: Boolean(values.gera_lancamento)
      })}
    />
  );
}
