<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## A & I Realty site
- Site content (listings, services, projects, contact) lives in `src/data/site.ts`; demo listings must stay labelled "Demo" until real data replaces them.
- 3D scenes (`src/components/three/`) and Mapbox (`src/components/map/MapView.tsx`) are lazy-loaded behind `<ClientOnly>` because they touch browser APIs at import.
- Map token is read from `VITE_MAPBOX_TOKEN` or the Mapbox connector's public token; without one, `SmartMap` shows a labelled schematic instead of faking a live map.
- Map pins cluster via a Mapbox GeoJSON cluster source; single homes stay HTML price markers shown only when unclustered — keeps branded pins while scaling to more listings.
- Property size is stored with an optional areaUnit (sq ft default, sq yd for plots); display via sizeLabel() and filter via areaSqft() so units never mix.
- 3D canvases pause (frameloop "never") when off-screen and pick a quality tier via src/components/three/quality.ts; the homepage map mounts only when its section nears the viewport — keeps scrolling smooth on ordinary devices.
