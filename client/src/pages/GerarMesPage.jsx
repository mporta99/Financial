import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { request } from "../services/api/http";
import { getResourceList } from "../services/api/resources";
import "./GerarMesPage.css";

export default function GerarMesPage() {
  const today = new Date();
  const [pessoas, setPessoas] = useState([]);
  const [formValues, setFormValues] = useState({
    pessoa_id: "",
    mes: String(today.getMonth() + 1),
    ano: String(today.getFullYear())
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    getResourceList("pessoas")
      .then((items) => {
        setPessoas(items);
        setFormValues((current) => ({
          ...current,
          pessoa_id: current.pessoa_id || (items[0] ? String(items[0].id) : "")
        }));
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setResult(null);

    try {
      const response = await request("/gerar-mes", {
        method: "POST",
        body: JSON.stringify({
          pessoa_id: Number(formValues.pessoa_id),
          mes: Number(formValues.mes),
          ano: Number(formValues.ano)
        })
      });

      setResult(response);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="gerar-mes-page">
      <PageHeader
        title="Gerar Mes"
        description="Cria lancamentos do mes informado a partir dos templates ativos e evita duplicar o que ja existe."
      />

      {error ? <div className="feedback-banner feedback-error">{error}</div> : null}

      <div className="gerar-mes-grid">
        <form className="gerar-mes-form" onSubmit={handleSubmit}>
          <label>
            <span>Pessoa</span>
            <select name="pessoa_id" value={formValues.pessoa_id} onChange={handleChange} disabled={loading || submitting}>
              {pessoas.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Mes</span>
            <input type="number" min="1" max="12" name="mes" value={formValues.mes} onChange={handleChange} disabled={submitting} />
          </label>

          <label>
            <span>Ano</span>
            <input type="number" min="2000" max="2100" name="ano" value={formValues.ano} onChange={handleChange} disabled={submitting} />
          </label>

          <button type="submit" disabled={loading || submitting || !formValues.pessoa_id}>
            {submitting ? "Gerando..." : "Gerar mes"}
          </button>
        </form>

        <section className="gerar-mes-result">
          <h3>Resultado</h3>

          {!result ? <p className="gerar-mes-empty">Nenhuma geracao executada ainda.</p> : null}

          {result ? (
            <>
              <div className="gerar-mes-summary">
                <div>
                  <span>Criados</span>
                  <strong>{result.generated.length}</strong>
                </div>
                <div>
                  <span>Pulados</span>
                  <strong>{result.skipped.length}</strong>
                </div>
                <div>
                  <span>Competencia</span>
                  <strong>
                    {String(result.meta.mes).padStart(2, "0")}/{result.meta.ano}
                  </strong>
                </div>
              </div>

              <div className="gerar-mes-lists">
                <div>
                  <h4>Criados</h4>
                  <ul>
                    {result.generated.map((item) => (
                      <li key={item.id}>
                        <strong>{item.descricao}</strong>
                        <span>
                          {item.subconta?.nome} - {item.categoria?.nome}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4>Pulados</h4>
                  <ul>
                    {result.skipped.map((item) => (
                      <li key={`${item.template_id}-${item.motivo}`}>
                        <strong>{item.nome}</strong>
                        <span>{item.motivo}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </section>
  );
}
