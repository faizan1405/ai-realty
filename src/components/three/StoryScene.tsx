import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { detectTier, useInView } from "./quality";
import * as THREE from "three";
import { Villa } from "./Villa";

function Rig({ progress }: { progress: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const build = useRef(0);
  const smooth = useRef(0);
  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    smooth.current += (progress.current - smooth.current) * (1 - Math.exp(-6 * dt));
    const p = smooth.current;
    build.current = p;
    if (group.current) group.current.rotation.y = -0.9 + p * 1.25;
    // camera: high plan view → eye-level
    const cam = state.camera;
    const r = 52 - p * 14;
    const elev = THREE.MathUtils.lerp(1.25, 0.32, p);
    cam.position.set(Math.cos(elev) * r * 0.6, Math.sin(elev) * r, Math.cos(elev) * r * 0.8);
    cam.lookAt(0, 1.6, 0);
  });
  return (
    <group ref={group} position={[0, -1, 0]}>
      <Villa build={build} lineColor="#183c34" ground="#ece6db" />
    </group>
  );
}

export default function StoryScene({ progress }: { progress: MutableRefObject<number> }) {
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, "50px");
  const [low, setLow] = useState(false);
  useEffect(() => setLow(detectTier() === "low"), []);
  return (
    <div ref={box} className="absolute inset-0">
    <Canvas shadows frameloop={inView ? "always" : "never"} dpr={low ? 1 : [1, 1.5]} camera={{ position: [10, 28, 14], fov: 30 }}>
      <color attach="background" args={["#f2ede4"]} />
      <fog attach="fog" args={["#f2ede4", 40, 80]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[-12, 20, 8]} intensity={1.6} color="#fff1dc" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={18} shadow-camera-bottom={-18} />
      <Environment resolution={128}>
        <Lightformer intensity={1.4} position={[0, 6, -8]} scale={[24, 4, 1]} />
        <Lightformer intensity={0.6} color="#c6ad83" position={[-8, 3, 6]} rotation-y={Math.PI / 2} scale={[16, 3, 1]} />
      </Environment>
      <Rig progress={progress} />
      <ContactShadows position={[0, -0.99, 0]} opacity={0.35} scale={40} blur={2.4} far={10} resolution={256} />
    </Canvas>
    </div>
  );
}
