import type { ReactElement } from 'react';

/**
 * Couleurs et dimensions constantes pour les SVG
 */
const COLORS = {
  frame: '#4B5563', // gray-600
  glass: '#DBEAFE', // blue-100
  stroke: '#1F2937', // gray-800
  handle: '#6B7280', // gray-500
  arrow: '#374151', // gray-700
};

const STROKE_WIDTH = 2;
const FRAME_WIDTH = 8;
const PADDING = 10;

/**
 * Template SVG pour une fenêtre
 * @param nbVantaux - Nombre de vantaux (1, 2, 3)
 * @param width - Largeur du viewBox (défaut: 200)
 * @param height - Hauteur du viewBox (défaut: 150)
 */
export function getFenetreSVG(
  nbVantaux: number,
  width = 200,
  height = 150
): ReactElement {
  const innerWidth = width - 2 * PADDING;
  const innerHeight = height - 2 * PADDING;
  const vantauxWidth = innerWidth / Math.max(nbVantaux, 1);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cadre extérieur (dormant) */}
      <rect
        x={PADDING}
        y={PADDING}
        width={innerWidth}
        height={innerHeight}
        fill={COLORS.frame}
        stroke={COLORS.stroke}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Zone vitrée intérieure */}
      <rect
        x={PADDING + FRAME_WIDTH}
        y={PADDING + FRAME_WIDTH}
        width={innerWidth - 2 * FRAME_WIDTH}
        height={innerHeight - 2 * FRAME_WIDTH}
        fill={COLORS.glass}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />

      {/* Divisions verticales pour les vantaux */}
      {Array.from({ length: nbVantaux - 1 }).map((_, i) => (
        <line
          key={`div-${i}`}
          x1={PADDING + vantauxWidth * (i + 1)}
          y1={PADDING + FRAME_WIDTH}
          x2={PADDING + vantauxWidth * (i + 1)}
          y2={PADDING + innerHeight - FRAME_WIDTH}
          stroke={COLORS.frame}
          strokeWidth={3}
        />
      ))}

      {/* Poignées pour chaque vantail (petits rectangles) */}
      {Array.from({ length: nbVantaux }).map((_, i) => {
        const handleX =
          PADDING + vantauxWidth * i + vantauxWidth / 2 + (i === 0 ? 15 : -20);
        const handleY = PADDING + innerHeight / 2 - 8;
        return (
          <rect
            key={`handle-${i}`}
            x={handleX}
            y={handleY}
            width={5}
            height={16}
            fill={COLORS.handle}
            rx={1}
          />
        );
      })}
    </svg>
  );
}

/**
 * Template SVG pour une porte-fenêtre
 * Similaire à fenêtre mais plus haute (proportions différentes)
 */
export function getPorteFenetreSVG(
  nbVantaux: number,
  width = 200,
  height = 150
): ReactElement {
  const innerWidth = width - 2 * PADDING;
  const innerHeight = height - 2 * PADDING;
  const vantauxWidth = innerWidth / Math.max(nbVantaux, 1);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cadre extérieur (dormant) */}
      <rect
        x={PADDING}
        y={PADDING}
        width={innerWidth}
        height={innerHeight}
        fill={COLORS.frame}
        stroke={COLORS.stroke}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Zone vitrée intérieure */}
      <rect
        x={PADDING + FRAME_WIDTH}
        y={PADDING + FRAME_WIDTH}
        width={innerWidth - 2 * FRAME_WIDTH}
        height={innerHeight - 2 * FRAME_WIDTH}
        fill={COLORS.glass}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />

      {/* Petit carreaux en bas pour représenter la porte */}
      <line
        x1={PADDING + FRAME_WIDTH}
        y1={PADDING + innerHeight - FRAME_WIDTH - 20}
        x2={PADDING + innerWidth - FRAME_WIDTH}
        y2={PADDING + innerHeight - FRAME_WIDTH - 20}
        stroke={COLORS.frame}
        strokeWidth={2}
      />

      {/* Divisions verticales */}
      {Array.from({ length: nbVantaux - 1 }).map((_, i) => (
        <line
          key={`div-${i}`}
          x1={PADDING + vantauxWidth * (i + 1)}
          y1={PADDING + FRAME_WIDTH}
          x2={PADDING + vantauxWidth * (i + 1)}
          y2={PADDING + innerHeight - FRAME_WIDTH}
          stroke={COLORS.frame}
          strokeWidth={3}
        />
      ))}

      {/* Poignées */}
      {Array.from({ length: nbVantaux }).map((_, i) => {
        const handleX =
          PADDING + vantauxWidth * i + vantauxWidth / 2 + (i === 0 ? 15 : -20);
        const handleY = PADDING + innerHeight / 2 + 10;
        return (
          <rect
            key={`handle-${i}`}
            x={handleX}
            y={handleY}
            width={5}
            height={20}
            fill={COLORS.handle}
            rx={1}
          />
        );
      })}
    </svg>
  );
}

/**
 * Template SVG pour un coulissant
 * Affiche les vantaux avec des flèches de direction
 */
export function getCoulissantSVG(
  nbVantaux: number,
  width = 200,
  height = 150
): ReactElement {
  const innerWidth = width - 2 * PADDING;
  const innerHeight = height - 2 * PADDING;
  const vantauxWidth = innerWidth / Math.max(nbVantaux, 2);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cadre extérieur */}
      <rect
        x={PADDING}
        y={PADDING}
        width={innerWidth}
        height={innerHeight}
        fill={COLORS.frame}
        stroke={COLORS.stroke}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Rails en haut et en bas */}
      <line
        x1={PADDING + FRAME_WIDTH}
        y1={PADDING + FRAME_WIDTH + 5}
        x2={PADDING + innerWidth - FRAME_WIDTH}
        y2={PADDING + FRAME_WIDTH + 5}
        stroke={COLORS.handle}
        strokeWidth={1}
        strokeDasharray="4 2"
      />
      <line
        x1={PADDING + FRAME_WIDTH}
        y1={PADDING + innerHeight - FRAME_WIDTH - 5}
        x2={PADDING + innerWidth - FRAME_WIDTH}
        y2={PADDING + innerHeight - FRAME_WIDTH - 5}
        stroke={COLORS.handle}
        strokeWidth={1}
        strokeDasharray="4 2"
      />

      {/* Panneaux coulissants */}
      {Array.from({ length: nbVantaux }).map((_, i) => {
        const panelX = PADDING + FRAME_WIDTH + vantauxWidth * i + 2;
        const panelY = PADDING + FRAME_WIDTH + 8;
        const panelWidth = vantauxWidth - 6;
        const panelHeight = innerHeight - 2 * FRAME_WIDTH - 16;

        return (
          <g key={`panel-${i}`}>
            {/* Panneau vitré */}
            <rect
              x={panelX}
              y={panelY}
              width={panelWidth}
              height={panelHeight}
              fill={COLORS.glass}
              stroke={COLORS.stroke}
              strokeWidth={1}
            />
            {/* Flèche de direction (alternée) */}
            <path
              d={
                i % 2 === 0
                  ? `M${panelX + panelWidth / 2 - 8},${panelY + panelHeight / 2} l16,0 m-4,-4 l4,4 l-4,4`
                  : `M${panelX + panelWidth / 2 + 8},${panelY + panelHeight / 2} l-16,0 m4,-4 l-4,4 l4,4`
              }
              stroke={COLORS.arrow}
              strokeWidth={2}
              fill="none"
            />
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Template SVG pour un châssis fixe
 * Simple rectangle avec croix de vitrage
 */
export function getChassisFixeSVG(width = 200, height = 150): ReactElement {
  const innerWidth = width - 2 * PADDING;
  const innerHeight = height - 2 * PADDING;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cadre extérieur */}
      <rect
        x={PADDING}
        y={PADDING}
        width={innerWidth}
        height={innerHeight}
        fill={COLORS.frame}
        stroke={COLORS.stroke}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Zone vitrée */}
      <rect
        x={PADDING + FRAME_WIDTH}
        y={PADDING + FRAME_WIDTH}
        width={innerWidth - 2 * FRAME_WIDTH}
        height={innerHeight - 2 * FRAME_WIDTH}
        fill={COLORS.glass}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />

      {/* Croix de renfort (symbolise fixe) */}
      <line
        x1={PADDING + FRAME_WIDTH}
        y1={PADDING + FRAME_WIDTH}
        x2={PADDING + innerWidth - FRAME_WIDTH}
        y2={PADDING + innerHeight - FRAME_WIDTH}
        stroke={COLORS.handle}
        strokeWidth={1}
        opacity={0.5}
      />
      <line
        x1={PADDING + innerWidth - FRAME_WIDTH}
        y1={PADDING + FRAME_WIDTH}
        x2={PADDING + FRAME_WIDTH}
        y2={PADDING + innerHeight - FRAME_WIDTH}
        stroke={COLORS.handle}
        strokeWidth={1}
        opacity={0.5}
      />
    </svg>
  );
}

/**
 * Template SVG pour un châssis à soufflet
 * Rectangle avec indication d'ouverture vers l'intérieur (en haut)
 */
export function getChassissouffletSVG(width = 200, height = 150): ReactElement {
  const innerWidth = width - 2 * PADDING;
  const innerHeight = height - 2 * PADDING;
  const centerX = width / 2;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cadre extérieur */}
      <rect
        x={PADDING}
        y={PADDING}
        width={innerWidth}
        height={innerHeight}
        fill={COLORS.frame}
        stroke={COLORS.stroke}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Zone vitrée */}
      <rect
        x={PADDING + FRAME_WIDTH}
        y={PADDING + FRAME_WIDTH}
        width={innerWidth - 2 * FRAME_WIDTH}
        height={innerHeight - 2 * FRAME_WIDTH}
        fill={COLORS.glass}
        stroke={COLORS.stroke}
        strokeWidth={1}
      />

      {/* Indication d'ouverture soufflet (flèche vers le haut) */}
      <path
        d={`M${centerX},${PADDING + innerHeight - 20} L${centerX - 10},${PADDING + innerHeight - 35} L${centerX + 10},${PADDING + innerHeight - 35} Z`}
        fill={COLORS.arrow}
        opacity={0.7}
      />

      {/* Lignes de perspective pour montrer l'ouverture */}
      <line
        x1={PADDING + FRAME_WIDTH + 5}
        y1={PADDING + innerHeight - FRAME_WIDTH}
        x2={PADDING + FRAME_WIDTH + 15}
        y2={PADDING + FRAME_WIDTH + 20}
        stroke={COLORS.handle}
        strokeWidth={1}
        strokeDasharray="4 2"
      />
      <line
        x1={PADDING + innerWidth - FRAME_WIDTH - 5}
        y1={PADDING + innerHeight - FRAME_WIDTH}
        x2={PADDING + innerWidth - FRAME_WIDTH - 15}
        y2={PADDING + FRAME_WIDTH + 20}
        stroke={COLORS.handle}
        strokeWidth={1}
        strokeDasharray="4 2"
      />
    </svg>
  );
}
