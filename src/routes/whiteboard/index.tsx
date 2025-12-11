import { api } from "@convex/api";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import throttle from "lodash/throttle";
import { MousePointer2 } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/whiteboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const cursors = useQuery(api.cursor.get);
  const updateCursor = useMutation(api.cursor.update);

  useEffect(() => {
    const throttledMove = throttle((e: MouseEvent) => {
      updateCursor({ pos: { x: e.clientX, y: e.clientY } });
    }, 100);

    window.addEventListener("mousemove", throttledMove);

    return () => {
      window.removeEventListener("mousemove", throttledMove);
    };
  }, []);

  return (
    <main className="w-screen h-screen -mt-[48px] relative overflow-hidden">
      {cursors
        ?.filter((cursor) => cursor.pos !== undefined)
        .map((cursor) => (
          <MotionCursor
            key={cursor._id.toString()}
            x={cursor.pos!.x}
            y={cursor.pos!.y}
          />
        ))}
    </main>
  );
}

function MotionCursor({ x, y }: { x: number; y: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      animate={{ left: x, top: y }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 28,
        mass: 0.5,
      }}
      style={{
        position: "absolute",
        transform: "translate(-50%, -50%)",
      }}
    >
      <MousePointer2 />
    </motion.div>
  );
}
