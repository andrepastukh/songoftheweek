import { motion } from "motion/react";
import { lazy, Suspense } from "react";
import { useTapeStore } from "../../state/tapeStore";

const CassetteCanvas3D = lazy(() => import("./CassetteCanvas3D").then((module) => ({ default: module.CassetteCanvas3D })));

export function Cassette() {
  const track = useTapeStore((state) => state.track);
  const senderName = useTapeStore((state) => state.senderName);
  const message = useTapeStore((state) => state.message);
  const playerState = useTapeStore((state) => state.playerState);
  const active = playerState === "starting" || playerState === "playing";

  return (
    <motion.div
      className={`cassette-stage cassette-stage--3d state-${playerState}`}
      initial={{ opacity: 0, y: 22, rotate: -1.2 }}
      animate={{ opacity: 1, y: active ? 2 : 0, rotate: active ? -0.2 : 0 }}
      transition={{ opacity: { duration: 0.7 }, y: { duration: 0.35 }, rotate: { duration: 0.45 } }}
    >
      <div className="cassette-perspective cassette-perspective--3d">
        <div className="cassette-canvas" role="img" aria-label={`${track.title} von ${track.artist}, realistische 3D-Kassette`}>
          <Suspense fallback={<div className="cassette-canvas-loading" aria-hidden="true" />}>
            <CassetteCanvas3D
              title={track.title}
              artist={track.artist}
              senderName={senderName}
              message={message}
              playerState={playerState}
            />
          </Suspense>
        </div>
      </div>
      <div className="cassette-table-shadow cassette-table-shadow--3d" aria-hidden="true" />
    </motion.div>
  );
}
