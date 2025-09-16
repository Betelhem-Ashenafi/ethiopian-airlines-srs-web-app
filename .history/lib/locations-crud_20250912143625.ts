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
  // POST to /api/location (correct endpoint for add)
  const res = await fetch('/api/location', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add location');
  return data;
}

export async function deleteLocation(id: number | string) {
  // DELETE to /api/location/DeactivateLocation/{id}
  const res = await fetch(`/api/location/DeactivateLocation/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete location');
  return data;
}

export async function editLocation(id: number | string, payload: LocationInput) {
  // PUT to /api/location/UpdateLocation/{id}
  const res = await fetch(`/api/location/UpdateLocation/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update location');
  return data;
}
