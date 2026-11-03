import React from "react";
import { Composition } from "remotion";

import { Holo } from "./Holo";
import { dureeProjet, FPS_PAR_DEFAUT, type Projet } from "./projet";

/** Un projet vide : le vrai projet arrive par --props=projets/<nom>.json (scripts/rendu.mjs). */
const VIDE: Projet = { video: "", segments: [] };

export const Root: React.FC = () => (
  <Composition
    id="Holo"
    component={Holo}
    width={1080}
    height={1920}
    fps={FPS_PAR_DEFAUT}
    durationInFrames={FPS_PAR_DEFAUT}
    defaultProps={VIDE}
    calculateMetadata={({ props }) => {
      const fps = props.fps ?? FPS_PAR_DEFAUT;
      return { fps, durationInFrames: Math.max(1, Math.round(dureeProjet(props) * fps)) };
    }}
  />
);
