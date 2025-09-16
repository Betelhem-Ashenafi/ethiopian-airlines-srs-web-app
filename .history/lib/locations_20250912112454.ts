// lib/locations.ts
// Client helper to load locations from backend

export type Location = {
  locationID: number;
  locationName: string;
  isActive: boolean;
};

export async function loadLocationsHelper(): Promise<Location[]> {
  try {
    const res = await fetch('/api/location/GetLocationsAll');
    if (!res.ok) throw new Error('Failed to load locations');
    const data = await res.json();
    // Expecting an array of location objects
    const list = Array.isArray(data) ? data : (data?.data || []);
    return list.map((loc: any) => ({
      locationID: Number(loc.locationID ?? loc.id ?? loc.LocationID ?? 0),
      locationName: loc.locationName ?? loc.name ?? loc.LocationName ?? '',
      isActive: loc.isActive ?? loc.IsActive ?? false,
    })).filter((loc: Location) => !!loc.locationName);
  } catch (e) {
    // fallback: keep empty list
    return [];
  }
}
