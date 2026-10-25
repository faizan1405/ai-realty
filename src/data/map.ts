export const getMapboxToken = (): string | undefined =>
  (import.meta.env["VITE_MAPBOX_TOKEN"] as string | undefined) ||
  (import.meta.env["VITE_LOVABLE_CONNECTOR_MAPBOX_PUBLIC_TOKEN"] as string | undefined) ||
  undefined;

export const HYDERABAD: [number, number] = [78.3867, 17.4486];

// Approximate neighbourhood centres — search suggestions, not inventory claims.
export const neighbourhoods: { name: string; center: [number, number] }[] = [
  { name: "Gachibowli", center: [78.3489, 17.4401] },
  { name: "Kondapur", center: [78.3637, 17.4632] },
  { name: "Narsingi", center: [78.3570, 17.3850] },
  { name: "Manikonda", center: [78.3870, 17.4040] },
  { name: "Miyapur", center: [78.3578, 17.4969] },
  { name: "Kukatpally", center: [78.4138, 17.4849] },
  { name: "Tellapur", center: [78.2860, 17.4630] },
  { name: "Shamshabad", center: [78.4294, 17.2403] },
];
