import type { ReactElement } from 'react';

/**
 * Couleurs et dimensions constantes pour les SVG
 * Design inspiré du projet prometrage-rw
 */
const COLORS = {
  frame: '#374151', // gray-700 (darker for better contrast)
  glass: 'rgba(200, 220, 240, 0.3)', // Semi-transparent light blue
  stroke: '#374151', // gray-700
  handle: '#9CA3AF', // gray-400
  arrow: '#6B7280', // gray-500
  panelStroke: '#6B7280', // gray-500
  glassStroke: '#D1D5DB', // gray-300
  oscilloSoufflet: '#F59E0B', // amber-500 pour indicateur soufflet en oscillo-battant
};

const STROKE_WIDTH = 4; // Thicker frame stroke
const FRAME_WIDTH = 12; // Wider dormant
const PADDING = 10;
const PANEL_STROKE = 2;
const PANEL_GAP = 6;

/**
 * Type d'ouverture pour les indicateurs
 */
type OpeningDirection = 'gauche' | 'droite';
type TypeOuvrant = 'battant' | 'soufflet' | 'oscillo-battant' | 'fixe' | 'coulissant';

/**
 * Calcule les points du triangle pour l'indicateur battant
 * Convention fiche metreur: base sur toute la hauteur du côté paumelles,
 * pointe au centre du côté opposé (côté qui s'ouvre)
 * Triangle pleine-taille couvrant toute la zone vitrée
 */
function getBattantTrianglePoints(
  x: number,
  y: number,
  width: number,
  height: number,
  direction: OpeningDirection
): string {
  if (direction === 'droite') {
    // Paumelles à GAUCHE, ouvre vers la DROITE
    // Base: bord gauche complet (haut-gauche au bas-gauche)
    // Pointe: centre du bord droit
    return `${x},${y} ${x + width},${y + height / 2} ${x},${y + height}`;
  }
  // Paumelles à DROITE, ouvre vers la GAUCHE
  // Base: bord droit complet (haut-droit au bas-droit)
  // Pointe: centre du bord gauche
  return `${x + width},${y} ${x},${y + height / 2} ${x + width},${y + height}`;
}

/**
 * Calcule les points du triangle pour l'indicateur soufflet
 * Convention fiche metreur: base sur toute la largeur du bas,
 * pointe au centre du bord supérieur
 * Triangle pleine-taille couvrant toute la zone vitrée
 */
function getSouffletTrianglePoints(
  x: number,
  y: number,
  width: number,
  height: number
): string {
  // Base: bord inférieur complet (bas-gauche au bas-droit)
  // Pointe: centre du bord supérieur
  return `${x},${y + height} ${x + width / 2},${y} ${x + width},${y + height}`;
}

/**
 * Génère l'indicateur d'ouverture SVG
 * Triangles pleine-taille suivant la convention technique des fiches metreur
 */
function getOpeningIndicator(
  x: number,
  y: number,
  width: number,
  height: number,
  typeOuvrant: TypeOuvrant,
  direction: OpeningDirection = 'droite'
): ReactElement | null {
  if (typeOuvrant === 'fixe' || typeOuvrant === 'coulissant') {
    return null;
  }

  const battantPoints = getBattantTrianglePoints(x, y, width, height, direction);
  const souffletPoints = getSouffletTrianglePoints(x, y, width, height);

  return (
    <g className="opening-indicator">
      {/* Triangle battant - traits gris fins */}
      {(typeOuvrant === 'battant' || typeOuvrant === 'oscillo-battant') && (
        <polygon
          points={battantPoints}
          fill="none"
          stroke={COLORS.panelStroke}
          strokeWidth={1}
          opacity={0.6}
        />
      )}
      {/* Triangle soufflet - orange en mode oscillo-battant */}
      {(typeOuvrant === 'soufflet' || typeOuvrant === 'oscillo-battant') && (
        <polygon
          points={souffletPoints}
          fill="none"
          stroke={typeOuvrant === 'oscillo-battant' ? COLORS.oscilloSoufflet : COLORS.panelStroke}
          strokeWidth={1}
          strokeDasharray={typeOuvrant === 'oscillo-battant' ? '6 3' : undefined}
          opacity={0.7}
        />
      )}
    </g>
  );
}

/**
 * Template SVG pour une fenêtre
 * Design inspiré de prometrage-rw avec cadre arrondi, vitrage semi-transparent
 * et indicateurs d'ouverture triangulaires
 * @param nbVantaux - Nombre de vantaux (1, 2, 3)
 * @param width - Largeur du viewBox (défaut: 200)
 * @param height - Hauteur du viewBox (défaut: 150)
 * @param typeOuvrant - Type d'ouverture (battant, soufflet, oscillo-battant, fixe)
 * @param sensOuverture - Sens d'ouverture pour le premier vantail (gauche, droite)
 */
export function getFenetreSVG(
  nbVantaux: number,
  width = 200,
  height = 150,
  typeOuvrant: TypeOuvrant = 'battant',
  sensOuverture: OpeningDirection = 'droite'
): ReactElement {
  const innerWidth = width - 2 * PADDING;
  const innerHeight = height - 2 * PADDING;
  const frameX = PADDING;
  const frameY = PADDING;

  // Calcul des dimensions des panneaux
  const panelInnerX = frameX + FRAME_WIDTH;
  const panelInnerY = frameY + FRAME_WIDTH;
  const panelInnerWidth = innerWidth - 2 * FRAME_WIDTH;
  const panelInnerHeight = innerHeight - 2 * FRAME_WIDTH;

  // Largeur de chaque vantail avec espacement
  const totalGaps = (Math.max(nbVantaux, 1) - 1) * PANEL_GAP;
  const panelWidth = (panelInnerWidth - totalGaps) / Math.max(nbVantaux, 1);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cadre extérieur (dormant) avec coins arrondis */}
      <rect
        x={frameX}
        y={frameY}
        width={innerWidth}
        height={innerHeight}
        fill="none"
        stroke={COLORS.stroke}
        strokeWidth={STROKE_WIDTH}
        rx={2}
      />

      {/* Panneaux (vantaux) */}
      {Array.from({ length: Math.max(nbVantaux, 1) }).map((_, i) => {
        const panelX = panelInnerX + i * (panelWidth + PANEL_GAP);
        const panelY = panelInnerY;

        // Déterminer la direction d'ouverture pour ce vantail
        // Vantail 0: utilise sensOuverture, autres: alternent
        const isLeftOpening = i === 0 ? sensOuverture === 'gauche' : i % 2 === 0;
        const direction: OpeningDirection = isLeftOpening ? 'gauche' : 'droite';

        return (
          <g key={`panel-${i}`}>
            {/* Cadre du panneau */}
            <rect
              x={panelX}
              y={panelY}
              width={panelWidth}
              height={panelInnerHeight}
              fill="none"
              stroke={COLORS.panelStroke}
              strokeWidth={PANEL_STROKE}
            />

            {/* Zone vitrée */}
            <rect
              x={panelX + 6}
              y={panelY + 6}
              width={panelWidth - 12}
              height={panelInnerHeight - 12}
              fill={COLORS.glass}
              stroke={COLORS.glassStroke}
              strokeWidth={1}
            />

            {/* Indicateur d'ouverture */}
            {getOpeningIndicator(
              panelX + 6,
              panelY + 6,
              panelWidth - 12,
              panelInnerHeight - 12,
              typeOuvrant,
              direction
            )}

            {/* Poignée */}
            {typeOuvrant !== 'fixe' && (
              <rect
                x={isLeftOpening ? panelX + 8 : panelX + panelWidth - 14}
                y={panelY + panelInnerHeight / 2 - 12}
                width={6}
                height={24}
                fill={COLORS.handle}
                rx={2}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Template SVG pour une porte-fenêtre
 * Design inspiré de prometrage-rw avec les mêmes améliorations que fenêtre
 * Plus haute que fenêtre (proportions porte) avec panneau bas décoratif
 * @param nbVantaux - Nombre de vantaux (1, 2, 3)
 * @param width - Largeur du viewBox (défaut: 200)
 * @param height - Hauteur du viewBox (défaut: 150)
 * @param typeOuvrant - Type d'ouverture (battant, soufflet, oscillo-battant, fixe)
 * @param sensOuverture - Sens d'ouverture pour le premier vantail (gauche, droite)
 */
export function getPorteFenetreSVG(
  nbVantaux: number,
  width = 200,
  height = 150,
  typeOuvrant: TypeOuvrant = 'battant',
  sensOuverture: OpeningDirection = 'droite'
): ReactElement {
  const innerWidth = width - 2 * PADDING;
  const innerHeight = height - 2 * PADDING;
  const frameX = PADDING;
  const frameY = PADDING;

  // Calcul des dimensions des panneaux
  const panelInnerX = frameX + FRAME_WIDTH;
  const panelInnerY = frameY + FRAME_WIDTH;
  const panelInnerWidth = innerWidth - 2 * FRAME_WIDTH;
  const panelInnerHeight = innerHeight - 2 * FRAME_WIDTH;

  // Largeur de chaque vantail avec espacement
  const totalGaps = (Math.max(nbVantaux, 1) - 1) * PANEL_GAP;
  const panelWidth = (panelInnerWidth - totalGaps) / Math.max(nbVantaux, 1);

  // Hauteur du panneau bas décoratif (proportion porte)
  const bottomPanelHeight = Math.min(panelInnerHeight * 0.15, 25);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cadre extérieur (dormant) avec coins arrondis */}
      <rect
        x={frameX}
        y={frameY}
        width={innerWidth}
        height={innerHeight}
        fill="none"
        stroke={COLORS.stroke}
        strokeWidth={STROKE_WIDTH}
        rx={2}
      />

      {/* Panneaux (vantaux) */}
      {Array.from({ length: Math.max(nbVantaux, 1) }).map((_, i) => {
        const panelX = panelInnerX + i * (panelWidth + PANEL_GAP);
        const panelY = panelInnerY;

        // Déterminer la direction d'ouverture pour ce vantail
        const isLeftOpening = i === 0 ? sensOuverture === 'gauche' : i % 2 === 0;
        const direction: OpeningDirection = isLeftOpening ? 'gauche' : 'droite';

        return (
          <g key={`panel-${i}`}>
            {/* Cadre du panneau */}
            <rect
              x={panelX}
              y={panelY}
              width={panelWidth}
              height={panelInnerHeight}
              fill="none"
              stroke={COLORS.panelStroke}
              strokeWidth={PANEL_STROKE}
            />

            {/* Zone vitrée (partie haute) */}
            <rect
              x={panelX + 6}
              y={panelY + 6}
              width={panelWidth - 12}
              height={panelInnerHeight - 12 - bottomPanelHeight}
              fill={COLORS.glass}
              stroke={COLORS.glassStroke}
              strokeWidth={1}
            />

            {/* Panneau bas décoratif (soubassement) */}
            <rect
              x={panelX + 6}
              y={panelY + panelInnerHeight - 6 - bottomPanelHeight}
              width={panelWidth - 12}
              height={bottomPanelHeight}
              fill="none"
              stroke={COLORS.glassStroke}
              strokeWidth={1}
            />

            {/* Indicateur d'ouverture */}
            {getOpeningIndicator(
              panelX + 6,
              panelY + 6,
              panelWidth - 12,
              panelInnerHeight - 12 - bottomPanelHeight,
              typeOuvrant,
              direction
            )}

            {/* Poignée (plus basse que fenêtre, adaptée à la porte) */}
            {typeOuvrant !== 'fixe' && (
              <rect
                x={isLeftOpening ? panelX + 8 : panelX + panelWidth - 14}
                y={panelY + panelInnerHeight * 0.55}
                width={6}
                height={28}
                fill={COLORS.handle}
                rx={2}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Template SVG pour un coulissant
 * Design inspiré de prometrage-rw avec rails solides et flèches avec markers
 * @param nbVantaux - Nombre de vantaux (2, 3, 4)
 * @param width - Largeur du viewBox (défaut: 200)
 * @param height - Hauteur du viewBox (défaut: 150)
 * @param sensOuverture - Direction principale d'ouverture (gauche, droite)
 */
export function getCoulissantSVG(
  nbVantaux: number,
  width = 200,
  height = 150,
  sensOuverture: OpeningDirection = 'droite'
): ReactElement {
  const innerWidth = width - 2 * PADDING;
  const innerHeight = height - 2 * PADDING;
  const frameX = PADDING;
  const frameY = PADDING;

  // Dimensions intérieures
  const panelInnerX = frameX + FRAME_WIDTH;
  const panelInnerY = frameY + FRAME_WIDTH;
  const panelInnerWidth = innerWidth - 2 * FRAME_WIDTH;
  const panelInnerHeight = innerHeight - 2 * FRAME_WIDTH;

  // Rails en bas
  const railHeight = 8;
  const panelHeight = panelInnerHeight - railHeight;

  // Largeur des panneaux avec léger chevauchement pour effet coulissant
  const panelOverlap = 4;
  const effectiveWidth = panelInnerWidth + panelOverlap * (Math.max(nbVantaux, 2) - 1);
  const panelWidth = effectiveWidth / Math.max(nbVantaux, 2);

  // ID unique pour le marker de flèche
  const arrowMarkerId = `arrow-${Math.random().toString(36).slice(2, 11)}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Définition du marker de flèche */}
      <defs>
        <marker
          id={arrowMarkerId}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon
            points="0 0, 8 3, 0 6"
            fill={COLORS.arrow}
          />
        </marker>
      </defs>

      {/* Cadre extérieur (dormant) avec coins arrondis */}
      <rect
        x={frameX}
        y={frameY}
        width={innerWidth}
        height={innerHeight}
        fill="none"
        stroke={COLORS.stroke}
        strokeWidth={STROKE_WIDTH}
        rx={2}
      />

      {/* Panneaux coulissants */}
      {Array.from({ length: Math.max(nbVantaux, 2) }).map((_, i) => {
        const panelX = panelInnerX + i * (panelWidth - panelOverlap);
        const panelY = panelInnerY;

        // Déterminer si ce panneau est mobile et sa direction
        // Pour 2 vantaux: un coulisse vers l'autre
        // Pour 3 vantaux: les panneaux extérieurs coulissent vers le centre
        let isMovable = true;
        let slideDirection: OpeningDirection;

        if (nbVantaux === 2) {
          if (sensOuverture === 'droite') {
            isMovable = i === 1;
            slideDirection = 'gauche';
          } else {
            isMovable = i === 0;
            slideDirection = 'droite';
          }
        } else if (nbVantaux >= 3) {
          // Centre fixe, extérieurs mobiles
          isMovable = i !== Math.floor(nbVantaux / 2);
          slideDirection = i < nbVantaux / 2 ? 'droite' : 'gauche';
        } else {
          slideDirection = sensOuverture;
        }

        return (
          <g key={`panel-${i}`}>
            {/* Cadre du panneau */}
            <rect
              x={panelX}
              y={panelY}
              width={panelWidth}
              height={panelHeight}
              fill="none"
              stroke={COLORS.panelStroke}
              strokeWidth={PANEL_STROKE}
            />

            {/* Zone vitrée */}
            <rect
              x={panelX + 6}
              y={panelY + 6}
              width={panelWidth - 12}
              height={panelHeight - 12}
              fill={COLORS.glass}
              stroke={COLORS.glassStroke}
              strokeWidth={1}
            />

            {/* Flèche de direction (uniquement pour panneaux mobiles) */}
            {isMovable && (
              <line
                x1={slideDirection === 'droite' ? panelX + 15 : panelX + panelWidth - 15}
                y1={panelY + panelHeight / 2}
                x2={slideDirection === 'droite' ? panelX + panelWidth - 15 : panelX + 15}
                y2={panelY + panelHeight / 2}
                stroke={COLORS.arrow}
                strokeWidth={2}
                markerEnd={`url(#${arrowMarkerId})`}
              />
            )}

            {/* Poignée verticale au centre */}
            <rect
              x={panelX + panelWidth / 2 - 3}
              y={panelY + panelHeight / 2 - 18}
              width={6}
              height={36}
              fill={COLORS.handle}
              rx={2}
            />
          </g>
        );
      })}

      {/* Rails en bas */}
      <g className="rails">
        {/* Base du rail */}
        <rect
          x={panelInnerX}
          y={panelInnerY + panelHeight}
          width={panelInnerWidth}
          height={railHeight}
          fill={COLORS.glassStroke}
        />
        {/* Lignes de rail */}
        {Array.from({ length: Math.min(nbVantaux, 3) }).map((_, i) => (
          <line
            key={`rail-${i}`}
            x1={panelInnerX}
            y1={panelInnerY + panelHeight + 2 + i * 3}
            x2={panelInnerX + panelInnerWidth}
            y2={panelInnerY + panelHeight + 2 + i * 3}
            stroke={COLORS.handle}
            strokeWidth={1}
          />
        ))}
      </g>
    </svg>
  );
}

/**
 * Template SVG pour un châssis fixe
 * Design inspiré de prometrage-rw: cadre arrondi, vitrage semi-transparent
 * Pas d'indicateur d'ouverture (panneau fixe)
 * @param width - Largeur du viewBox (défaut: 200)
 * @param height - Hauteur du viewBox (défaut: 150)
 */
export function getChassisFixeSVG(width = 200, height = 150): ReactElement {
  const innerWidth = width - 2 * PADDING;
  const innerHeight = height - 2 * PADDING;
  const frameX = PADDING;
  const frameY = PADDING;

  // Dimensions du panneau intérieur
  const panelX = frameX + FRAME_WIDTH;
  const panelY = frameY + FRAME_WIDTH;
  const panelWidth = innerWidth - 2 * FRAME_WIDTH;
  const panelHeight = innerHeight - 2 * FRAME_WIDTH;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cadre extérieur (dormant) avec coins arrondis */}
      <rect
        x={frameX}
        y={frameY}
        width={innerWidth}
        height={innerHeight}
        fill="none"
        stroke={COLORS.stroke}
        strokeWidth={STROKE_WIDTH}
        rx={2}
      />

      {/* Cadre du panneau */}
      <rect
        x={panelX}
        y={panelY}
        width={panelWidth}
        height={panelHeight}
        fill="none"
        stroke={COLORS.panelStroke}
        strokeWidth={PANEL_STROKE}
      />

      {/* Zone vitrée */}
      <rect
        x={panelX + 6}
        y={panelY + 6}
        width={panelWidth - 12}
        height={panelHeight - 12}
        fill={COLORS.glass}
        stroke={COLORS.glassStroke}
        strokeWidth={1}
      />

      {/* Croix subtile pour indiquer "fixe" (optionnelle, très légère) */}
      <line
        x1={panelX + 10}
        y1={panelY + 10}
        x2={panelX + panelWidth - 10}
        y2={panelY + panelHeight - 10}
        stroke={COLORS.glassStroke}
        strokeWidth={1}
        opacity={0.4}
      />
      <line
        x1={panelX + panelWidth - 10}
        y1={panelY + 10}
        x2={panelX + 10}
        y2={panelY + panelHeight - 10}
        stroke={COLORS.glassStroke}
        strokeWidth={1}
        opacity={0.4}
      />
    </svg>
  );
}

/**
 * Template SVG pour un châssis à soufflet
 * Design inspiré de prometrage-rw avec triangle soufflet (convention fiche metreur)
 * Le triangle pointe vers le haut avec la base en bas
 * @param width - Largeur du viewBox (défaut: 200)
 * @param height - Hauteur du viewBox (défaut: 150)
 */
export function getChassissouffletSVG(width = 200, height = 150): ReactElement {
  const innerWidth = width - 2 * PADDING;
  const innerHeight = height - 2 * PADDING;
  const frameX = PADDING;
  const frameY = PADDING;

  // Dimensions du panneau intérieur
  const panelX = frameX + FRAME_WIDTH;
  const panelY = frameY + FRAME_WIDTH;
  const panelWidth = innerWidth - 2 * FRAME_WIDTH;
  const panelHeight = innerHeight - 2 * FRAME_WIDTH;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cadre extérieur (dormant) avec coins arrondis */}
      <rect
        x={frameX}
        y={frameY}
        width={innerWidth}
        height={innerHeight}
        fill="none"
        stroke={COLORS.stroke}
        strokeWidth={STROKE_WIDTH}
        rx={2}
      />

      {/* Cadre du panneau */}
      <rect
        x={panelX}
        y={panelY}
        width={panelWidth}
        height={panelHeight}
        fill="none"
        stroke={COLORS.panelStroke}
        strokeWidth={PANEL_STROKE}
      />

      {/* Zone vitrée */}
      <rect
        x={panelX + 6}
        y={panelY + 6}
        width={panelWidth - 12}
        height={panelHeight - 12}
        fill={COLORS.glass}
        stroke={COLORS.glassStroke}
        strokeWidth={1}
      />

      {/* Indicateur d'ouverture soufflet (triangle) */}
      {getOpeningIndicator(
        panelX + 6,
        panelY + 6,
        panelWidth - 12,
        panelHeight - 12,
        'soufflet'
      )}

      {/* Poignée en bas au centre */}
      <rect
        x={panelX + panelWidth / 2 - 3}
        y={panelY + panelHeight - 20}
        width={6}
        height={14}
        fill={COLORS.handle}
        rx={2}
      />
    </svg>
  );
}
