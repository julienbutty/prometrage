'use client';

/**
 * Zone SVG interactive avec dimensions et habillages positionnés
 *
 * Affiche:
 * - SVG central de la menuiserie
 * - Dimension Hauteur à gauche
 * - Dimension Largeur en bas
 * - Labels habillages (Int/Ext) sur chaque côté
 * - Légende des couleurs
 */

import { MenuiserieSVG } from './MenuiserieSVG';
import type { MenuiserieType, TypeOuvrant, OpeningDirection } from '@/lib/svg/types';
import type { HabillageValue } from '@/lib/validations/habillage';

interface HabillageValues {
  haut: HabillageValue | null;
  bas: HabillageValue | null;
  gauche: HabillageValue | null;
  droite: HabillageValue | null;
}

export interface InteractiveSVGZoneProps {
  /** Type de menuiserie */
  type: MenuiserieType;
  /** Nombre de vantaux */
  nbVantaux: number;
  /** Type d'ouverture (battant, soufflet, oscillo-battant, fixe, coulissant) */
  typeOuvrant?: TypeOuvrant;
  /** Sens d'ouverture pour le triangle SVG (gauche/droite) - null = pas de triangle */
  sensOuverture?: OpeningDirection | null;
  /** Largeur en mm */
  largeur: string | number;
  /** Hauteur en mm */
  hauteur: string | number;
  /** Habillages intérieurs par côté */
  habillagesInt?: HabillageValues;
  /** Habillages extérieurs par côté */
  habillagesExt?: HabillageValues;
  /** Afficher les labels d'habillage */
  showHabillageLabels?: boolean;
}

/**
 * Label d'habillage compact affichant Int et Ext
 */
function HabillageLabel({
  int,
  ext,
  vertical = false,
}: {
  int: HabillageValue | null;
  ext: HabillageValue | null;
  vertical?: boolean;
}) {
  const intLabel = int || '—';
  const extLabel = ext || '—';

  if (vertical) {
    return (
      <div className="text-[9px] leading-tight text-center bg-white/80 backdrop-blur-sm rounded px-0.5 py-1 shadow-sm [writing-mode:vertical-rl] rotate-180">
        <div className="text-blue-600 font-medium">Int: {intLabel}</div>
        <div className="text-orange-500 font-medium">Ext: {extLabel}</div>
      </div>
    );
  }

  return (
    <div className="text-[10px] leading-tight text-center bg-white/80 backdrop-blur-sm rounded px-1.5 py-0.5 shadow-sm">
      <div className="text-blue-600 font-medium">Int: {intLabel}</div>
      <div className="text-orange-500 font-medium">Ext: {extLabel}</div>
    </div>
  );
}

export function InteractiveSVGZone({
  type,
  nbVantaux,
  typeOuvrant = 'battant',
  sensOuverture,
  largeur,
  hauteur,
  habillagesInt,
  habillagesExt,
  showHabillageLabels = true,
}: InteractiveSVGZoneProps) {
  const largeurValue = typeof largeur === 'string' ? largeur : String(largeur);
  const hauteurValue = typeof hauteur === 'string' ? hauteur : String(hauteur);

  // Calculer les proportions du SVG basées sur les dimensions réelles
  const largeurNum = typeof largeur === 'number' ? largeur : parseInt(largeur) || 200;
  const hauteurNum = typeof hauteur === 'number' ? hauteur : parseInt(hauteur) || 150;

  // Dimensions du conteneur SVG (agrandies pour meilleure visibilité)
  const maxWidth = 340;
  const maxHeight = 280;
  const minWidth = 180; // Largeur minimum pour garder le dessin lisible

  // Calculer les dimensions proportionnelles
  const ratio = largeurNum / hauteurNum;
  let svgWidth: number;
  let svgHeight: number;

  if (ratio > maxWidth / maxHeight) {
    // Plus large que haut - limiter par la largeur
    svgWidth = maxWidth;
    svgHeight = Math.round(maxWidth / ratio);
  } else {
    // Plus haut que large - limiter par la hauteur
    svgHeight = maxHeight;
    svgWidth = Math.round(maxHeight * ratio);
  }

  // Appliquer la largeur minimum pour éviter les dessins trop étroits
  if (svgWidth < minWidth) {
    svgWidth = minWidth;
    // Ajuster la hauteur pour garder une proportion acceptable (max 1:1.8)
    const maxRatioHeight = svgWidth * 1.8;
    svgHeight = Math.min(svgHeight, maxRatioHeight);
  }

  // Valeurs par défaut pour les habillages
  const defaultHabillages: HabillageValues = {
    haut: null,
    bas: null,
    gauche: null,
    droite: null,
  };

  const habInt = habillagesInt || defaultHabillages;
  const habExt = habillagesExt || defaultHabillages;

  return (
    <div className="relative flex items-center justify-center py-6 px-2 sm:px-20">
      <div className="relative">
        {/* === Habillage Haut === */}
        {showHabillageLabels && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full">
            <HabillageLabel int={habInt.haut} ext={habExt.haut} />
          </div>
        )}

        {/* === Côté Gauche Mobile: Vertical === */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 -translate-x-full flex flex-col items-center gap-1 sm:hidden">
          <span className="text-[9px] font-medium text-gray-600 [writing-mode:vertical-rl] rotate-180">
            {hauteurValue || '—'} mm
          </span>
          {showHabillageLabels && (
            <HabillageLabel int={habInt.gauche} ext={habExt.gauche} vertical />
          )}
        </div>

        {/* === Côté Gauche Desktop: [Hauteur + Habillage] | Ligne verticale === */}
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 -translate-x-full hidden sm:flex items-center gap-2">
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
              {hauteurValue || '—'} mm
            </span>
            {showHabillageLabels && (
              <HabillageLabel int={habInt.gauche} ext={habExt.gauche} />
            )}
          </div>
          <div className="flex flex-col items-center h-48">
            <div className="w-2 h-px bg-gray-400" />
            <div className="w-px flex-1 bg-gray-400" />
            <div className="w-2 h-px bg-gray-400" />
          </div>
        </div>

        {/* === SVG Menuiserie === */}
        <div
          className="relative border-2 border-blue-400 rounded bg-white shadow-sm"
          style={{ width: svgWidth, height: svgHeight }}
        >
          <MenuiserieSVG
            type={type}
            nbVantaux={nbVantaux}
            typeOuvrant={typeOuvrant}
            sensOuverture={sensOuverture ?? undefined}
            width={svgWidth}
            height={svgHeight}
            className="w-full h-full"
          />
        </div>

        {/* === Habillage Droite Mobile: Vertical === */}
        {showHabillageLabels && (
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 translate-x-full sm:hidden">
            <HabillageLabel int={habInt.droite} ext={habExt.droite} vertical />
          </div>
        )}

        {/* === Habillage Droite Desktop === */}
        {showHabillageLabels && (
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full hidden sm:block">
            <HabillageLabel int={habInt.droite} ext={habExt.droite} />
          </div>
        )}

        {/* === Zone Bas: Largeur + Habillage Bas + Légende === */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full flex flex-col items-center gap-2">
          {/* Dimension Largeur */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <div className="h-2 w-px bg-gray-400" />
              <div className="h-px w-6 bg-gray-400" />
            </div>
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
              {largeurValue || '—'} mm
            </span>
            <div className="flex items-center">
              <div className="h-px w-6 bg-gray-400" />
              <div className="h-2 w-px bg-gray-400" />
            </div>
          </div>

          {/* Habillage Bas */}
          {showHabillageLabels && (
            <HabillageLabel int={habInt.bas} ext={habExt.bas} />
          )}

          {/* Légende Int/Ext */}
          {showHabillageLabels && (
            <div className="flex items-center gap-4 text-[10px] mt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-500">Intérieur</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-gray-500">Extérieur</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InteractiveSVGZone;
