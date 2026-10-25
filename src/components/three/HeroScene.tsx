import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Html, Lightformer, OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, N8AO, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { RotateCcw, Hand } from "lucide-react";
import { Villa } from "./Villa";
import { images } from "@/data/site";
import { detectTier, useInView, type Tier } from "./quality";

const HOTSPOTS = [
  { p: [3.5, 2.4, 2.8] as [number, number, number], title: "Floor-to-ceiling glazing", text: "Slim steel mullions let the living spaces open fully to the pool deck." },
  { p: [9.6, 4.4, 5.6] as [number, number, number], title: "Cantilevered terrace", text: "A deep concrete slab shades the ground floor through Hyderabad summers." },
  { p: [-0.3, 6, 2.4] as [number, number, number], title: "Teak louvres", text: "Vertical timber fins filter western light into the upper suites." },
  { p: [3, 1.2, 10.4] as [number, number, number], title: "Reflecting pool", text: "Water cools the breeze before it enters the living room." },
];

const FINAL = new THREE.Vector3(31, 10, 40);
const START = new THREE.Vector3(2, 46, 6);
const TARGET = new THREE.Vector3(0, 3, 0);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function Director({ build, onReady, controls, tier }: { build: React.MutableRefObject<number>; onReady: () => void; controls: React.RefObject<OrbitControlsImpl | null>; tier: Tier }) {
  const group = useRef<THREE.Group>(null);
  const { pointer, camera, size } = useThree();
  const start = useRef<number | null>(null);
  const done = useRef(false);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const reduced = useRef(false);
  useEffect(() => { reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches; }, []);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    // shift the subject right on wide screens so the headline has room
    cam.filmOffset = size.width > 900 ? -2.4 : 0;
    cam.updateProjectionMatrix();
  }, [camera, size.width]);

  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    if (start.current === null) start.current = state.clock.elapsedTime;
    const t = reduced.current ? 10 : state.clock.elapsedTime - start.current; // reduced motion: skip the camera sweep
    build.current = THREE.MathUtils.clamp((t - 0.2) / 3.4, 0, 1);

    if (!done.current) {
      // plan view (blueprint) → sweeping descent to a three-quarter eye level
      const k = easeInOut(THREE.MathUtils.clamp((t - 0.3) / 3.8, 0, 1));
      const far = size.width < 700 ? 1.55 : size.width < 1100 ? 1.4 : 1.15;
      tmp.copy(FINAL).multiplyScalar(far).sub(START).multiplyScalar(k).add(START);
      const swing = Math.sin(k * Math.PI) * 10;
      camera.position.set(tmp.x - swing, tmp.y, tmp.z + swing * 0.4);
      if (size.width < 700) TARGET.y = -5;
      camera.lookAt(TARGET);
      if (k >= 1) {
        done.current = true;
        controls.current?.target.copy(TARGET);
        controls.current?.update();
        controls.current?.saveState();
        onReady();
      }
    }
    const g = group.current;
    if (!g) return;
    const scroll = Math.min(window.scrollY / window.innerHeight, 1);
    const ty = pointer.x * 0.08 + scroll * 0.35;
    g.rotation.y += (ty - g.rotation.y) * (1 - Math.exp(-3 * dt));
    g.position.y = -1 - scroll * 3;
  });

  return (
    <group ref={group}>
      <Villa build={build} />
      {/* Inside the group so it rotates with the villa; only re-rendered while the villa assembles. */}
      <ContactShadows position={[0, 0.01, 0]} opacity={0.6} scale={60} blur={2.8} far={12} resolution={tier === "high" ? 512 : 256} frames={300} />
    </group>
  );
}

function Hotspots({ show }: { show: boolean }) {
  const [active, setActive] = useState<number | null>(null);
  if (!show) return null;
  return (
    <>
      {HOTSPOTS.map((h, i) => (
        <Html key={i} position={h.p} center zIndexRange={[20, 0]}>
          <div className="relative animate-fade" style={{ animationDelay: `${i * 120}ms` }}>
            <button
              onClick={() => setActive(active === i ? null : i)}
              aria-label={h.title}
              aria-expanded={active === i}
              className="group grid h-8 w-8 place-items-center rounded-full border border-champagne/70 bg-charcoal/30 backdrop-blur-sm transition-transform duration-500 hover:scale-110"
            >
              <span className="absolute inset-0 animate-ping rounded-full border border-champagne/40 [animation-duration:2.4s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-champagne" />
            </button>
            {active === i && (
              <div className="absolute left-11 top-1/2 w-60 -translate-y-1/2 animate-fade border-l border-champagne bg-charcoal/85 p-4 text-ivory backdrop-blur-md">
                <p className="eyebrow text-champagne">0{i + 1} — {h.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-ivory/75">{h.text}</p>
              </div>
            )}
          </div>
        </Html>
      ))}
    </>
  );
}

export default function HeroScene() {
  const build = useRef(0);
  const controls = useRef<OrbitControlsImpl>(null);
  const [ready, setReady] = useState(false);
  const [moved, setMoved] = useState(false);
  const [gl, setGl] = useState<boolean | null>(null);
  const [tier, setTier] = useState<Tier>("high");
  const [dpr, setDpr] = useState(1.5);
  const box = useRef<HTMLDivElement>(null);
  // Stop the render loop entirely once the hero has scrolled off-screen.
  const inView = useInView(box, "100px", gl);

  useEffect(() => {
    const t = detectTier();
    setTier(t);
    setDpr(t === "high" ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 1.25));
    setGl(hasWebGL());
  }, []);

  if (gl === false)
    return <img src={images.villa} alt="Contemporary villa at dusk" className="absolute inset-0 h-full w-full object-cover opacity-70" />;
  if (gl === null) return null;

  return (
    <div ref={box} className="absolute inset-0 animate-fade">
      <Canvas shadows frameloop={inView ? "always" : "never"} dpr={dpr} camera={{ position: START.toArray(), fov: 28, near: 0.5, far: 220 }} gl={{ antialias: false, powerPreference: "high-performance" }}>
        {/* Drops resolution automatically if the device can't hold its frame rate. */}
        <PerformanceMonitor onDecline={() => setDpr(1)} />
        <color attach="background" args={["#141b18"]} />
        <fog attach="fog" args={["#141b18", 45, 110]} />
        <ambientLight intensity={0.18} />
        <hemisphereLight args={["#f6dcb4", "#16201c", 0.45]} />
        <directionalLight
          position={[-22, 16, 14]}
          intensity={2.4}
          color="#ffcf98"
          castShadow
          shadow-mapSize={tier === "high" ? [2048, 2048] : [1024, 1024]}
          shadow-bias={-0.0004}
          shadow-normalBias={0.03}
          shadow-camera-left={-26}
          shadow-camera-right={26}
          shadow-camera-top={22}
          shadow-camera-bottom={-22}
        />
        <pointLight position={[3, 2.2, 1]} intensity={22} color="#ffb766" distance={16} decay={1.6} />
        <pointLight position={[3, 5.8, 0]} intensity={14} color="#ffb766" distance={14} decay={1.6} />
        <Environment resolution={256}>
          <Lightformer intensity={2.2} color="#ffcf98" position={[-20, 6, 10]} scale={[30, 6, 1]} rotation-y={Math.PI / 3} />
          <Lightformer intensity={1} color="#7f9a93" position={[10, 10, -14]} scale={[30, 10, 1]} />
          <Lightformer intensity={0.5} color="#ffffff" position={[0, 20, 0]} rotation-x={Math.PI / 2} scale={[40, 40, 1]} />
        </Environment>
        <Director build={build} controls={controls} tier={tier} onReady={() => setReady(true)} />
        <Hotspots show={ready && typeof window !== "undefined" && window.innerWidth >= 700} />
        <OrbitControls
          ref={controls}
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3.4}
          maxPolarAngle={Math.PI / 2.1}
          minAzimuthAngle={-0.2}
          maxAzimuthAngle={1.5}
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.5}
          onStart={() => setMoved(true)}
        />
        {tier === "high" ? (
          <EffectComposer multisampling={2}>
            <N8AO halfRes aoRadius={1.6} intensity={2.2} distanceFalloff={1} />
            <Bloom intensity={0.55} luminanceThreshold={0.85} luminanceSmoothing={0.2} mipmapBlur />
            <Vignette offset={0.25} darkness={0.65} />
          </EffectComposer>
        ) : (
          <EffectComposer multisampling={0}>
            <Vignette offset={0.25} darkness={0.65} />
          </EffectComposer>
        )}
      </Canvas>
      <div className="pointer-events-auto absolute bottom-8 right-6 z-20 flex items-center gap-3 md:right-10">
        <span className={`hidden items-center gap-2 text-xs text-ivory/60 transition-opacity duration-700 md:flex ${ready ? "opacity-100" : "opacity-0"}`}>
          <Hand className="h-3.5 w-3.5" /> Drag to explore
        </span>
        <button
          onClick={() => {
            controls.current?.reset();
            setMoved(false);
          }}
          disabled={!moved}
          className="flex items-center gap-2 border border-ivory/30 px-3 py-2 text-xs uppercase tracking-[0.2em] text-ivory transition hover:bg-ivory hover:text-charcoal disabled:opacity-40"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset view
        </button>
      </div>
    </div>
  );
}
