import { request } from "./http";

async function getResourceList(resource) {
  const data = await request(`/${resource}`);
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

export { deleteEntity, getResourceList, saveEntity };
