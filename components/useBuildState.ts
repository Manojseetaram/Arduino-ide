import { useState } from "react";

export function useBuildState() {
  const [isBuilding, setIsBuilding] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "building" | "success" | "error"
  >("idle");

  return {
    isBuilding,
    status,
    startBuild: () => {
      setIsBuilding(true);
      setStatus("building");
    },
    finishSuccess: () => {
      setIsBuilding(false);
      setStatus("success");
    },
    finishError: () => {
      setIsBuilding(false);
      setStatus("error");
    },
    reset: () => setStatus("idle"),
  };
}
