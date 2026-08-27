import { Canvas } from "@react-three/fiber";
import type { PlayerState } from "../../types";
import { SonyTapeModel3D } from "./SonyTapeModel3D";
import { useTapeNoteTexture } from "./useTapeNoteTexture";

type CassetteCanvas3DProps = {
  title: string;
  artist: string;
  senderName: string;
  message: string;
  playerState: PlayerState;
};

export function CassetteCanvas3D({ title, artist, senderName, message, playerState }: CassetteCanvas3DProps) {
  const labelTexture = useTapeNoteTexture({ title, artist, senderName, message });

  return (
    <Canvas
      aria-hidden="true"
      shadows="basic"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.15, 9.25], fov: 28, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.72} />
      <hemisphereLight args={["#fff8e7", "#6d6254", 1.15]} />
      <directionalLight position={[-4.5, 6, 7]} intensity={2.7} color="#fff8e8" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[5, 1.5, 5]} intensity={1.1} color="#d8e5eb" />
      <pointLight position={[-4, -1.2, 3]} intensity={0.55} color="#d6986f" />
      <SonyTapeModel3D playerState={playerState} labelTexture={labelTexture} />
    </Canvas>
  );
}
