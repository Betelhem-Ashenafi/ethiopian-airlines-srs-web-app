// lib/locations.ts
// Client helper to load locations from backend

export async function loadLocationsHelper(): Promise<string[]> {
  try {
    const res = await fetch('/api/location/GetLocationsAll');
    if (!res.ok) throw new Error('Failed to load locations');
    const data = await res.json();
    // Expecting an array of location objects or strings
    // Normalize to array of strings
    const list = Array.isArray(data) ? data : (data?.data || []);
    return list.map((loc: any) =>
      typeof loc === 'string' ? loc : (loc.name ?? loc.locationName ?? loc.LocationName ?? '')
    ).filter((loc: string) => !!loc);
  } catch (e) {
    // fallback: keep empty list
    return [];
  }
}
