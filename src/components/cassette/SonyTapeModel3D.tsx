import { Center, ContactShadows, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, MathUtils, Mesh, Object3D, type CanvasTexture, type Material } from "three";
import type { PlayerState } from "../../types";

type SonyTapeModel3DProps = {
  playerState: PlayerState;
  labelTexture: CanvasTexture | null;
};

const MODEL_URL = "/models/sony-tape/sony-tape.glb";

function replaceLabelMaterial(material: Material, labelTexture: CanvasTexture | null) {
  const clone = material.clone();
  if (clone.name === "TapeLabel" && "map" in clone && labelTexture) {
    clone.map = labelTexture;
    clone.needsUpdate = true;
  }
  return clone;
}

export function SonyTapeModel3D({ playerState, labelTexture }: SonyTapeModel3DProps) {
  const model = useRef<Group>(null);
  const { scene } = useGLTF(MODEL_URL);
  const reducedMotion = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const reelSpeed = useRef(0);
  const reelParts = useRef<{ left: Object3D[]; right: Object3D[] }>({ left: [], right: [] });

  const cassette = useMemo(() => {
    const clone = scene.clone(true);
    const left: Object3D[] = [];
    const right: Object3D[] = [];

    clone.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        object.material = Array.isArray(object.material)
          ? object.material.map((material) => replaceLabelMaterial(material, labelTexture))
          : replaceLabelMaterial(object.material, labelTexture);
      }

      if (["Cylinder.108", "Cylinder.109", "Cylinder.113"].includes(object.name)) left.push(object);
      if (["Cylinder.106", "Cylinder.111"].includes(object.name)) right.push(object);
    });

    reelParts.current = { left, right };
    return clone;
  }, [labelTexture, scene]);

  useFrame(({ clock, pointer }, delta) => {
    if (!model.current) return;
    const tiltX = reducedMotion ? -0.018 : -0.025 - pointer.y * 0.035;
    const tiltY = reducedMotion ? 0 : pointer.x * 0.055;
    model.current.rotation.x = MathUtils.damp(model.current.rotation.x, tiltX, 5, delta);
    model.current.rotation.y = MathUtils.damp(model.current.rotation.y, tiltY, 5, delta);

    const vibration = playerState === "playing" && !reducedMotion ? Math.sin(clock.elapsedTime * 28) * 0.002 : 0;
    const press = playerState === "starting" ? -0.016 : 0;
    model.current.position.y = MathUtils.damp(model.current.position.y, vibration + press, 12, delta);

    const targetSpeed = playerState === "playing" ? 2.55 : playerState === "starting" ? 1.25 : 0;
    const response = playerState === "pausing" ? 12 : 7;
    reelSpeed.current = MathUtils.damp(reelSpeed.current, targetSpeed, response, delta);
    reelParts.current.left.forEach((part) => { part.rotation.y += reelSpeed.current * delta; });
    reelParts.current.right.forEach((part) => { part.rotation.y += reelSpeed.current * delta; });
  });

  return (
    <>
      <group ref={model} rotation={[-0.025, 0, 0]}>
        <Center>
          <group rotation={[Math.PI / 2, 0, 0]} scale={2.25}>
            <primitive object={cassette} dispose={null} />
          </group>
        </Center>
      </group>
      <ContactShadows position={[0, -2.08, 0]} opacity={0.38} scale={7.4} blur={2.8} far={4.5} color="#29231b" />
    </>
  );
}

useGLTF.preload(MODEL_URL);
