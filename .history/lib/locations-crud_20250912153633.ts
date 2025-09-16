// Delete location using /api/location/GetLocation/{id}
export async function deleteLocationByGetLocation(id: number | string) {
  const res = await fetch(`/api/location/GetLocation/${id}`, { method: 'DELETE' });
  const text = await res.text();
  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
    throw new Error(`Backend returned HTML error when deleting location ${id}: ${text.slice(0,200)}`);
  }
  let data: any;
  try { data = JSON.parse(text); } catch (e) {
    throw new Error(`Failed to parse JSON when deleting location ${id}: ${String(e)} - response: ${text.slice(0,200)}`);
  }
  if (!res.ok) throw new Error(data?.message || `Failed to delete location: ${res.status}`);
  return data;
}
// lib/locations-crud.ts
// Location CRUD helpers matching department logic

export type LocationInput = {
  locationName: string;
  description?: string;
  locationEmail?: string;
  contactNumber?: string;
  isActive?: boolean;
};

export async function addLocation(payload: LocationInput) {
  // POST to /api/location/CreateLocation (correct endpoint for add)
  const res = await fetch('/api/location/CreateLocation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
    throw new Error(`Backend returned HTML error when adding location: ${text.slice(0,200)}`);
  }
  let data: any;
  try { data = JSON.parse(text); } catch (e) {
    throw new Error(`Failed to parse JSON when adding location: ${String(e)} - response: ${text.slice(0,200)}`);
  }
  if (!res.ok) throw new Error(data?.message || `Failed to add location: ${res.status}`);
  return data;
}

export async function deleteLocation(id: number | string) {
  const res = await fetch(`/api/location/DeactivateLocation/${id}`, { method: 'DELETE' });
  const text = await res.text();
  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
    throw new Error(`Backend returned HTML error when deleting location ${id}: ${text.slice(0,200)}`);
  }
  let data: any;
  try { data = JSON.parse(text); } catch (e) {
    throw new Error(`Failed to parse JSON when deleting location ${id}: ${String(e)} - response: ${text.slice(0,200)}`);
  }
  if (!res.ok) throw new Error(data?.message || `Failed to delete location: ${res.status}`);
  return data;
}

export async function editLocation(id: number | string, payload: LocationInput) {
  // PUT to /api/location/UpdateLocation/{id}
  const res = await fetch(`/api/location/UpdateLocation/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, id }),
  });
  const text = await res.text();
  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
    throw new Error(`Backend returned HTML error when updating location ${id}: ${text.slice(0,200)}`);
  }
  let data: any;
  try { data = JSON.parse(text); } catch (e) {
    throw new Error(`Failed to parse JSON when updating location ${id}: ${String(e)} - response: ${text.slice(0,200)}`);
  }
  if (!res.ok) throw new Error(data?.message || `Failed to update location: ${res.status}`);
  return data;
}
