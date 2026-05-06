import {GOOGLE_MAPS_API_KEY} from '@env';

export type PlacePrediction = {
  description: string;
  place_id: string;
};

const key = () => String(GOOGLE_MAPS_API_KEY ?? '').trim();

export async function fetchPlacePredictions(
  input: string,
): Promise<PlacePrediction[]> {
  const k = key();
  if (!k || !input?.trim() || input.trim().length < 2) return [];
  try {
    const params = new URLSearchParams({
      input: input.trim(),
      key: k,
      types: 'address',
    });
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`,
    );
    const json = await res.json();
    if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') return [];
    return (json.predictions || []).map((p: any) => ({
      description: p.description as string,
      place_id: p.place_id as string,
    }));
  } catch {
    return [];
  }
}

export async function fetchPlaceDetails(
  placeId: string,
): Promise<{address: string; lat: string; lng: string} | null> {
  const k = key();
  if (!k || !placeId) return null;
  try {
    const fields = encodeURIComponent('formatted_address,geometry/location');
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId,
    )}&fields=${fields}&key=${k}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.status !== 'OK' || !json.result) return null;
    const r = json.result;
    const loc = r.geometry?.location;
    if (loc == null) return null;
    return {
      address: r.formatted_address || '',
      lat: String(loc.lat),
      lng: String(loc.lng),
    };
  } catch {
    return null;
  }
}

export async function geocodeAddressLine(
  address: string,
): Promise<{lat: string; lng: string} | null> {
  const k = key();
  if (!k || !address?.trim()) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address.trim(),
    )}&key=${k}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.status !== 'OK' || !json.results?.length) return null;
    const loc = json.results[0].geometry?.location;
    if (!loc) return null;
    return {lat: String(loc.lat), lng: String(loc.lng)};
  } catch {
    return null;
  }
}
