import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { concreteTexture, grassTexture, pavingTexture, stoneTexture, woodTexture } from "./textures";

type Mat = "concrete" | "stone" | "wood" | "glass" | "warm" | "water" | "steel" | "grass" | "rail" | "linen" | "hedge" | "paving" | "lamp";

type PartDef = { size: [number, number, number]; pos: [number, number, number]; mat: Mat; at: number; line?: boolean };

/**
 * Conceptual contemporary villa — a detailed procedural architectural
 * visualisation (illustrative, not a real building).
 * `build` 0..1: blueprint lines → structure → materials → lit residence.
 */
const FL = 0.4, S1 = 3.8, F1 = 4.25, R = 7.25;
const P = (size: PartDef["size"], pos: PartDef["pos"], mat: Mat, at: number, line = false): PartDef => ({ size, pos, mat, at, line });

function row(from: number, to: number, step: number, f: (v: number, i: number) => PartDef) {
  const out: PartDef[] = [];
  let i = 0;
  for (let v = from; v <= to + 1e-6; v += step) out.push(f(v, i++));
  return out;
}

const PARTS: PartDef[] = [
  // ── site
  P([24, 0.4, 15], [0.5, 0, 0.5], "paving", 0.04, true),
  P([26, 1.5, 0.4], [0.5, 0, -7.4], "stone", 0.5),
  P([12.6, 0.42, 4.6], [3, 0, 10.4], "paving", 0.1, true),
  P([12, 0.04, 4], [3, 0.4, 10.4], "water", 0.62),
  P([10, 0.04, 18], [-14.5, 0, 2], "grass", 0.58),
  P([0.9, 0.95, 7], [-10.6, 0, 10], "hedge", 0.64),
  P([10, 0.8, 0.8], [-4.4, 0, 13.4], "hedge", 0.66),
  P([0.75, 0.32, 2], [-1.2, FL, 7], "linen", 0.82),
  P([0.75, 0.32, 2], [0.1, FL, 7], "linen", 0.84),
  // ── ground floor
  P([6, 3.4, 8.5], [-6.2, FL, -1], "stone", 0.16, true),
  P([0.9, 7.6, 4], [-9.6, FL, 0.2], "stone", 0.2, true),
  P([11, 3.4, 6.4], [3, FL, -0.6], "glass", 0.55, true),
  P([10.6, 3.2, 0.1], [3, FL, -3.7], "warm", 0.7),
  ...row(-2.5, 8.5, 1.375, (x) => P([0.06, 3.4, 0.08], [x, FL, 2.62], "steel", 0.6)),
  ...row(-3.8, 2.6, 1.6, (z) => P([0.08, 3.4, 0.06], [8.52, FL, z], "steel", 0.6)),
  P([3, 0.45, 1], [1.6, FL, 0.6], "linen", 0.72),
  P([3, 0.85, 0.25], [1.6, FL, 0.05], "linen", 0.72),
  P([2.4, 0.75, 1], [6.2, FL, -1.4], "wood", 0.74),
  P([2.6, 0.95, 0.9], [5.6, FL, -3.0], "stone", 0.74),
  ...[9.6, 3.2, -3.2].map((x) => P([0.22, 3.4, 0.22], [x, FL, 4.9], "steel", 0.25)),
  // ── first slab (cantilever)
  P([20, 0.45, 10.6], [0.8, S1, 0.4], "concrete", 0.3, true),
  P([20, 0.12, 0.05], [0.8, S1 + 0.17, 5.73], "steel", 0.35),
  ...row(-2, 9, 2.2, (x) => P([0.35, 0.03, 0.35], [x, S1 - 0.03, 4.4], "lamp", 0.8)),
  // ── first floor
  P([11.5, 3, 6.6], [3, F1, -1.4], "glass", 0.58, true),
  P([11, 2.8, 0.1], [3, F1, -4.6], "warm", 0.74),
  P([5.6, 3, 7.6], [-6.2, F1, -1.2], "concrete", 0.38, true),
  ...row(-2.6, 2.0, 0.3, (x) => P([0.1, 3, 0.2], [x, F1, 2.05], "wood", 0.5)),
  P([4.8, 0.14, 0.24], [-0.3, F1 + 2.86, 2.05], "wood", 0.5),
  ...row(2.4, 8.8, 1.6, (x) => P([0.06, 3, 0.08], [x, F1, 1.92], "steel", 0.6)),
  P([11.5, 1.05, 0.04], [3, F1, 5.4], "rail", 0.66),
  P([11.6, 0.05, 0.08], [3, F1 + 1.05, 5.4], "steel", 0.68),
  P([2.2, 0.5, 2], [6, F1, -2.6], "linen", 0.74),
  P([0.7, 0.35, 1.9], [5.2, F1, 3.6], "linen", 0.8),
  P([0.7, 0.35, 1.9], [6.4, F1, 3.6], "linen", 0.82),
  // ── roof
  P([16, 0.4, 9.2], [1, R, -1.1], "concrete", 0.4, true),
  P([16, 0.1, 0.05], [1, R + 0.15, 3.52], "steel", 0.45),
  P([3.4, 1.4, 3.4], [-4, R + 0.4, -2.4], "stone", 0.45, true),
  ...row(1, 7, 0.5, (x) => P([0.08, 0.12, 4], [x, R + 2.2, -1.5], "wood", 0.56)),
  ...[1, 7].flatMap((x) => [P([0.12, 1.8, 0.12], [x, R + 0.4, -3.4], "steel", 0.54), P([0.12, 1.8, 0.12], [x, R + 0.4, 0.4], "steel", 0.54)]),
  // garden uplights
  ...[[-9, 6.5], [-7.4, 1], [10.8, -2.4], [12, 4.5], [-12, -3]].map(([x, z]) => P([0.15, 0.12, 0.15], [x!, 0, z!], "lamp", 0.85)),
];

const TEX_SCALE: Partial<Record<Mat, number>> = { stone: 2.2, concrete: 2.6, paving: 4, grass: 3 };

function useMaterials() {
  const mats = useMemo(() => {
    const m: Record<Mat, THREE.MeshStandardMaterial> = {
      concrete: new THREE.MeshStandardMaterial({ map: concreteTexture(), roughness: 0.88 }),
      stone: new THREE.MeshStandardMaterial({ map: stoneTexture(), roughness: 0.95 }),
      wood: new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.55 }),
      paving: new THREE.MeshStandardMaterial({ map: pavingTexture(), roughness: 0.7 }),
      grass: new THREE.MeshStandardMaterial({ map: grassTexture(), roughness: 1 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#8fa8a3", roughness: 0.02, metalness: 0.15, transparent: true, opacity: 0.38, envMapIntensity: 3, clearcoat: 1, clearcoatRoughness: 0.05, depthWrite: false }),
      warm: new THREE.MeshStandardMaterial({ color: "#3a2c20", emissive: "#ffb46a", emissiveIntensity: 0, roughness: 1 }),
      lamp: new THREE.MeshStandardMaterial({ color: "#2a2a2a", emissive: "#ffd39a", emissiveIntensity: 0 }),
      water: new THREE.MeshPhysicalMaterial({ color: "#1f5e5a", roughness: 0.03, metalness: 0.2, envMapIntensity: 3.5, clearcoat: 1 }),
      steel: new THREE.MeshStandardMaterial({ color: "#232625", roughness: 0.35, metalness: 0.8 }),
      rail: new THREE.MeshPhysicalMaterial({ color: "#cbd8d4", transparent: true, opacity: 0.22, roughness: 0, envMapIntensity: 3, depthWrite: false }),
      linen: new THREE.MeshStandardMaterial({ color: "#d9d1c2", roughness: 0.95 }),
      hedge: new THREE.MeshStandardMaterial({ color: "#33502e", roughness: 1, flatShading: true }),
    };
    return m;
  }, []);
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);
  return mats;
}

function Part({ def, mats, build, lineColor }: { def: PartDef; mats: Record<Mat, THREE.MeshStandardMaterial>; build: MutableRefObject<number>; lineColor: string }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const lineMat = useRef<THREE.LineBasicMaterial>(null);
  const [w, h, d] = def.size;
  const geo = useMemo(() => new THREE.BoxGeometry(w, h, d), [w, h, d]);
  const edges = useMemo(() => (def.line ? new THREE.EdgesGeometry(geo) : null), [geo, def.line]);
  const material = useMemo(() => {
    const base = mats[def.mat];
    const scale = TEX_SCALE[def.mat];
    if (!scale || !base.map) return base;
    const m = base.clone();
    m.map = base.map.clone();
    const flat = h < 0.6;
    m.map.repeat.set(Math.max(w, d) / scale, (flat ? Math.min(w, d) : h) / scale);
    m.map.needsUpdate = true;
    return m;
  }, [mats, def.mat, w, h, d]);
  useEffect(() => () => {
    geo.dispose();
    edges?.dispose();
    if (material !== mats[def.mat]) { material.map?.dispose(); material.dispose(); }
  }, [geo, edges, material, mats, def.mat]);

  const last = useRef(-1);
  useFrame(() => {
    const b = build.current;
    if (b === last.current) return; // nothing changes once the build settles
    last.current = b;
    const t = THREE.MathUtils.clamp((b - def.at) / 0.16, 0, 1);
    const e = 1 - Math.pow(1 - t, 3);
    if (group.current) group.current.scale.y = Math.max(0.0001, e);
    if (mesh.current) mesh.current.visible = e > 0.002;
    if (lineMat.current) {
      const appear = THREE.MathUtils.clamp(b / Math.max(def.at, 0.05), 0, 1);
      const fade = 1 - THREE.MathUtils.clamp((b - 0.72) / 0.22, 0, 1);
      lineMat.current.opacity = appear * fade * 0.9;
    }
  });

  const cast = !["glass", "rail", "water", "grass", "paving", "lamp", "warm"].includes(def.mat);
  return (
    <group position={def.pos}>
      {edges && (
        <lineSegments geometry={edges} position={[0, h / 2, 0]}>
          <lineBasicMaterial ref={lineMat} color={lineColor} transparent opacity={0} depthWrite={false} />
        </lineSegments>
      )}
      <group ref={group}>
        <mesh ref={mesh} geometry={geo} material={material} position={[0, h / 2, 0]} castShadow={cast} receiveShadow={def.mat !== "glass"} renderOrder={def.mat === "glass" || def.mat === "rail" ? 2 : 0} />
      </group>
    </group>
  );
}

const LEAF = ["#3f5a36", "#4a6640", "#36502f"];
function Tree({ p, s = 1, build, at, seed = 1 }: { p: [number, number, number]; s?: number; build: MutableRefObject<number>; at: number; seed?: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    const t = THREE.MathUtils.clamp((build.current - at) / 0.15, 0, 1);
    if (g.current) g.current.scale.setScalar(Math.max(0.0001, 1 - Math.pow(1 - t, 3)) * s);
  });
  const blobs = useMemo(() => [0, 1, 2, 3].map((i) => ({ x: Math.sin(seed * 3 + i * 2.1) * 0.8, y: 3 + Math.cos(seed + i) * 0.5 + i * 0.25, z: Math.cos(seed * 2 + i * 1.7) * 0.8, r: 0.9 + ((seed + i) % 3) * 0.2 })), [seed]);
  return (
    <group ref={g} position={p}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.14, 2.8, 7]} />
        <meshStandardMaterial color="#4b3b2c" roughness={1} />
      </mesh>
      {blobs.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]} castShadow>
          <icosahedronGeometry args={[b.r, 1]} />
          <meshStandardMaterial color={LEAF[i % 3]!} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

export function Villa({ build, lineColor = "#c6ad83", ground = "#1d2522" }: { build: MutableRefObject<number>; lineColor?: string; ground?: string }) {
  const mats = useMaterials();
  useFrame(() => {
    const warm = THREE.MathUtils.clamp((build.current - 0.7) / 0.25, 0, 1);
    mats.warm.emissiveIntensity = warm * 2.2;
    mats.lamp.emissiveIntensity = warm * 6;
  });
  return (
    <group>
      {PARTS.map((def, i) => (
        <Part key={i} def={def} mats={mats} build={build} lineColor={lineColor} />
      ))}
      <Tree p={[-12, 0, 7]} s={1.15} build={build} at={0.62} seed={1} />
      <Tree p={[-13.5, 0, -1]} s={1.3} build={build} at={0.64} seed={2} />
      <Tree p={[-8, 0, 12]} s={0.9} build={build} at={0.66} seed={3} />
      <Tree p={[11.5, 0, -3.5]} s={1.35} build={build} at={0.7} seed={4} />
      <Tree p={[13, 0, 3.5]} s={1} build={build} at={0.72} seed={5} />
      <Tree p={[10, 0, 13]} s={0.85} build={build} at={0.74} seed={6} />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color={ground} roughness={1} />
      </mesh>
    </group>
  );
}
