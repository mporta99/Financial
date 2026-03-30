import { useEffect, useMemo, useState } from "react";
import PageHeader from "./PageHeader";
import EntityForm from "./EntityForm";
import DataTable from "./DataTable";
import { deleteEntity, getResourceList, saveEntity } from "../services/api/resources";
import "./EntityManager.css";

export default function EntityManager({
  title,
  description,
  endpoint,
  fields,
  columns,
  buildPayload,
  toFormValues,
  loadLookups
}) {
  const [items, setItems] = useState([]);
  const [lookups, setLookups] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadPage() {
    setLoading(true);
    setError("");

    try {
      const [resourceItems, lookupData] = await Promise.all([
        getResourceList(endpoint),
        loadLookups ? loadLookups() : Promise.resolve({})
      ]);

      setItems(resourceItems);
      setLookups(lookupData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage();
  }, [endpoint]);

  const resolvedFields = useMemo(
    () =>
      fields.map((field) => ({
        ...field,
        options: typeof field.options === "function" ? field.options(lookups) : field.options ?? []
      })),
    [fields, lookups]
  );

  function resetForm() {
    setEditingItem(null);
    setFormValues({});
  }

  function handleInputChange(event) {
    const { name, type, value, checked } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = buildPayload(formValues);
      await saveEntity(endpoint, editingItem?.id, payload);
      resetForm();
      await loadPage();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(item) {
    setEditingItem(item);
    setFormValues(toFormValues(item));
  }

  async function handleDelete(item) {
    if (!window.confirm(`Excluir "${item.nome ?? item.id}"?`)) {
      return;
    }

    try {
      await deleteEntity(endpoint, item.id);
      if (editingItem?.id === item.id) {
        resetForm();
      }
      await loadPage();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section className="entity-page-grid">
      <PageHeader title={title} description={description} />

      {error ? <div className="feedback-banner feedback-error">{error}</div> : null}

      <div className="entity-content-grid">
        <EntityForm
          title={editingItem ? `Editar ${title}` : `Novo ${title}`}
          fields={resolvedFields}
          formValues={formValues}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          submitLabel={editingItem ? "Salvar alterações" : "Cadastrar"}
          loading={saving}
        />

        <div className="entity-table-section">
          {loading ? (
            <div className="feedback-banner">Carregando...</div>
          ) : (
            <DataTable
              columns={columns}
              rows={items}
              onEdit={handleEdit}
              onDelete={handleDelete}
              emptyMessage="Nenhum registro encontrado."
            />
          )}
        </div>
      </div>
    </section>
  );
}
