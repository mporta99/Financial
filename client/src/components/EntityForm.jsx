import "./EntityForm.css";

function getFieldValue(field, formValues) {
  if (field.type === "checkbox") {
    return Boolean(formValues[field.name]);
  }

  return formValues[field.name] ?? "";
}

export default function EntityForm({
  title,
  fields,
  formValues,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  loading
}) {
  return (
    <section className="form-card">
      <div className="form-card-header">
        <h3>{title}</h3>
        <p>Preencha os campos abaixo para salvar os dados.</p>
      </div>

      <form className="entity-form" onSubmit={onSubmit}>
        {fields.map((field) => (
          <label key={field.name} className={`field-wrapper ${field.type === "checkbox" ? "checkbox-field" : ""}`}>
            <span>{field.label}</span>
            {field.type === "select" ? (
              <select
                name={field.name}
                value={getFieldValue(field, formValues)}
                onChange={onChange}
                required={field.required}
              >
                <option value="">Selecione</option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <input
                type="checkbox"
                name={field.name}
                checked={Boolean(formValues[field.name])}
                onChange={onChange}
              />
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={getFieldValue(field, formValues)}
                onChange={onChange}
                step={field.step}
                required={field.required}
                placeholder={field.placeholder}
              />
            )}
          </label>
        ))}

        <div className="form-actions">
          <button type="submit" className="button-primary" disabled={loading}>
            {loading ? "Salvando..." : submitLabel}
          </button>
          <button type="button" className="button-secondary" onClick={onCancel}>
            Limpar
          </button>
        </div>
      </form>
    </section>
  );
}
