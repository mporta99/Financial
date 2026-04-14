import { request } from "./http";

async function getResourceList(resource, query = {}) {
  const searchParams = new URLSearchParams(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
  const suffix = searchParams.size ? `?${searchParams.toString()}` : "";
  const data = await request(`/${resource}${suffix}`);
  return data.items ?? [];
}

async function saveEntity(resource, id, payload) {
  return request(`/${resource}${id ? `/${id}` : ""}`, {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(payload)
  });
}

async function deleteEntity(resource, id) {
  return request(`/${resource}/${id}`, {
    method: "DELETE"
  });
}

async function patchEntity(resource, id, payload) {
  return request(`/${resource}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export { deleteEntity, getResourceList, patchEntity, saveEntity };
