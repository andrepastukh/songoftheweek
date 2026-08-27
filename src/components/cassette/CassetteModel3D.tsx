import { ContactShadows, Edges, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, Group, MathUtils, MeshPhysicalMaterial, Shape, type CanvasTexture } from "three";
import type { PlayerState } from "../../types";

type CassetteModel3DProps = {
  shellColor: string;
  shellShadow: string;
  playerState: PlayerState;
  progress: number;
  labelTexture: CanvasTexture | null;
};

type PlasticMaterialProps = {
  color: string;
  roughness?: number;
  clearcoat?: number;
  opacity?: number;
};

function PlasticMaterial({ color, roughness = 0.42, clearcoat = 0.28, opacity = 1 }: PlasticMaterialProps) {
  const material = useRef<MeshPhysicalMaterial>(null);
  const target = useMemo(() => new Color(color), [color]);

  useFrame((_, delta) => {
    if (!material.current) return;
    material.current.color.lerp(target, 1 - Math.exp(-delta * 9));
  });

  return (
    <meshPhysicalMaterial
      ref={material}
      color={color}
      roughness={roughness}
      metalness={0.03}
      clearcoat={clearcoat}
      clearcoatRoughness={0.42}
      transparent={opacity < 1}
      opacity={opacity}
    />
  );
}

function Screw({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.095, 0.095, 0.075, 32]} />
        <meshStandardMaterial color="#171a18" metalness={0.72} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.046]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.13, 0.018, 0.014]} />
        <meshStandardMaterial color="#050606" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0, 0.047]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.13, 0.018, 0.014]} />
        <meshStandardMaterial color="#050606" roughness={0.75} />
      </mesh>
    </group>
  );
}

type ReelProps = {
  position: [number, number, number];
  direction: 1 | -1;
  tapeRadius: number;
  playerState: PlayerState;
};

function Reel({ position, direction, tapeRadius, playerState }: ReelProps) {
  const spinningGroup = useRef<Group>(null);
  const velocity = useRef(0);
  const spokes = useMemo(() => Array.from({ length: 8 }), []);

  useFrame((_, delta) => {
    const targetSpeed = playerState === "playing" ? direction * 2.45 : playerState === "starting" ? direction * 1.1 : 0;
    const response = playerState === "pausing" ? 12 : 7;
    velocity.current = MathUtils.damp(velocity.current, targetSpeed, response, delta);
    if (spinningGroup.current) spinningGroup.current.rotation.z += velocity.current * delta;
  });

  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.055]} castShadow>
        <cylinderGeometry args={[tapeRadius, tapeRadius, 0.15, 72]} />
        <meshStandardMaterial color="#080908" roughness={0.86} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <torusGeometry args={[tapeRadius - 0.035, 0.028, 12, 72]} />
        <meshStandardMaterial color="#2a2d2a" roughness={0.5} metalness={0.22} />
      </mesh>

      <group ref={spinningGroup} position={[0, 0, 0.1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.455, 0.455, 0.18, 64]} />
          <meshPhysicalMaterial color="#111412" roughness={0.28} metalness={0.5} clearcoat={0.35} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.08]}>
          <cylinderGeometry args={[0.345, 0.345, 0.06, 64]} />
          <meshStandardMaterial color="#292d29" roughness={0.34} metalness={0.58} />
        </mesh>
        {spokes.map((_, index) => {
          const angle = (index / spokes.length) * Math.PI * 2;
          return (
            <mesh
              key={index}
              position={[Math.cos(angle) * 0.245, Math.sin(angle) * 0.245, 0.145]}
              rotation={[0, 0, angle + Math.PI / 2]}
              castShadow
            >
              <boxGeometry args={[0.095, 0.27, 0.075]} />
              <meshStandardMaterial color="#070908" roughness={0.54} metalness={0.26} />
            </mesh>
          );
        })}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.17]}>
          <cylinderGeometry args={[0.13, 0.13, 0.065, 40]} />
          <meshStandardMaterial color="#81867e" roughness={0.27} metalness={0.78} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.205]}>
          <cylinderGeometry args={[0.052, 0.052, 0.025, 32]} />
          <meshStandardMaterial color="#090b0a" roughness={0.58} metalness={0.32} />
        </mesh>
      </group>
    </group>
  );
}

function LowerMechanism({ shellShadow }: { shellShadow: string }) {
  const shape = useMemo(() => {
    const result = new Shape();
    result.moveTo(-2.17, 0.31);
    result.lineTo(2.17, 0.31);
    result.lineTo(2.55, -0.34);
    result.lineTo(-2.55, -0.34);
    result.closePath();
    return result;
  }, []);

  return (
    <group position={[0, -1.59, 0.225]}>
      <mesh castShadow receiveShadow>
        <extrudeGeometry args={[shape, { depth: 0.075, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 2 }]} />
        <PlasticMaterial color={shellShadow} roughness={0.56} clearcoat={0.1} />
      </mesh>
      {[-1.56, 1.56].map((x) => (
        <mesh key={`round-${x}`} position={[x, -0.06, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.115, 0.115, 0.08, 32]} />
          <meshStandardMaterial color="#080a09" metalness={0.36} roughness={0.5} />
        </mesh>
      ))}
      {[-0.9, 0.9].map((x) => (
        <RoundedBox key={`square-${x}`} args={[0.2, 0.24, 0.08]} radius={0.045} smoothness={3} position={[x, -0.06, 0.13]}>
          <meshStandardMaterial color="#090b0a" roughness={0.58} metalness={0.18} />
        </RoundedBox>
      ))}
    </group>
  );
}

export function CassetteModel3D({ shellColor, shellShadow, playerState, progress, labelTexture }: CassetteModel3DProps) {
  const model = useRef<Group>(null);
  const reducedMotion = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const leftTapeRadius = 0.72 - progress * 0.17;
  const rightTapeRadius = 0.55 + progress * 0.17;

  useFrame(({ clock, pointer }, delta) => {
    if (!model.current) return;
    const tiltX = reducedMotion ? -0.015 : -0.025 - pointer.y * 0.028;
    const tiltY = reducedMotion ? 0 : pointer.x * 0.04;
    model.current.rotation.x = MathUtils.damp(model.current.rotation.x, tiltX, 5, delta);
    model.current.rotation.y = MathUtils.damp(model.current.rotation.y, tiltY, 5, delta);
    const vibration = playerState === "playing" && !reducedMotion ? Math.sin(clock.elapsedTime * 31) * 0.0022 : 0;
    const press = playerState === "starting" ? -0.018 : 0;
    model.current.position.y = MathUtils.damp(model.current.position.y, vibration + press, 12, delta);
  });

  return (
    <>
      <group ref={model} rotation={[-0.025, 0, 0]}>
        <RoundedBox args={[6.3, 3.95, 0.43]} radius={0.17} smoothness={7} castShadow receiveShadow>
          <PlasticMaterial color={shellColor} />
          <Edges threshold={20} color="#111411" scale={1.001} />
        </RoundedBox>

        <RoundedBox args={[6.05, 3.7, 0.035]} radius={0.125} smoothness={5} position={[0, 0, 0.232]}>
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.035} roughness={0.12} clearcoat={1} depthWrite={false} />
        </RoundedBox>
        <mesh position={[-1.94, 1.58, 0.256]} rotation={[0, 0, -0.015]}>
          <planeGeometry args={[1.75, 0.065]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.12} depthWrite={false} />
        </mesh>

        <mesh position={[0.03, 0.905, 0.272]} rotation={[0, 0, -0.008]} receiveShadow>
          <planeGeometry args={[5.26, 1.49]} />
          <meshBasicMaterial color="#080706" transparent opacity={0.18} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0.935, 0.292]} rotation={[0, 0, -0.008]} castShadow receiveShadow>
          <planeGeometry args={[5.28, 1.5]} />
          <meshPhysicalMaterial map={labelTexture ?? undefined} color="#eee6cf" roughness={0.88} metalness={0} clearcoat={0.02} />
        </mesh>

        <RoundedBox args={[5.15, 1.18, 0.105]} radius={0.09} smoothness={5} position={[0, -0.56, 0.255]} castShadow receiveShadow>
          <PlasticMaterial color={shellShadow} roughness={0.62} clearcoat={0.12} />
        </RoundedBox>

        <Reel position={[-1.67, -0.56, 0.34]} direction={1} tapeRadius={leftTapeRadius} playerState={playerState} />
        <Reel position={[1.67, -0.56, 0.34]} direction={-1} tapeRadius={rightTapeRadius} playerState={playerState} />

        <RoundedBox args={[1.28, 0.78, 0.16]} radius={0.075} smoothness={5} position={[0, -0.56, 0.39]} castShadow>
          <meshStandardMaterial color="#080a09" roughness={0.38} metalness={0.25} />
        </RoundedBox>
        <RoundedBox args={[1.02, 0.55, 0.035]} radius={0.035} smoothness={4} position={[0, -0.56, 0.485]}>
          <meshPhysicalMaterial color="#151917" roughness={0.08} metalness={0.16} transmission={0.18} transparent opacity={0.84} clearcoat={0.8} />
        </RoundedBox>
        <RoundedBox args={[0.64, 0.21, 0.035]} radius={0.025} smoothness={3} position={[0, -0.5, 0.51]}>
          <meshStandardMaterial color="#030403" roughness={0.8} />
        </RoundedBox>
        <mesh position={[-0.23, -0.48, 0.535]} rotation={[0, 0, -0.1]}>
          <planeGeometry args={[0.14, 0.46]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.075} depthWrite={false} />
        </mesh>
        <RoundedBox args={[0.32, 0.055, 0.025]} radius={0.025} smoothness={3} position={[0, -0.81, 0.52]}>
          <meshStandardMaterial color="#757970" roughness={0.42} metalness={0.42} />
        </RoundedBox>

        <mesh position={[0, -1.24, 0.245]}>
          <boxGeometry args={[6.0, 0.018, 0.025]} />
          <meshBasicMaterial color="#0a0b0a" transparent opacity={0.34} />
        </mesh>
        <LowerMechanism shellShadow={shellShadow} />

        <Screw position={[-2.82, 1.68, 0.29]} />
        <Screw position={[2.82, 1.68, 0.29]} />
        <Screw position={[-2.82, -1.69, 0.29]} />
        <Screw position={[2.82, -1.69, 0.29]} />
        <Screw position={[0, -1.52, 0.36]} />
      </group>

      <ContactShadows position={[0, -2.05, 0]} opacity={0.42} scale={7.6} blur={2.8} far={4.5} color="#2b241a" />
    </>
  );
}
