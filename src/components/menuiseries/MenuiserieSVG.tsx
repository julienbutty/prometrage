'use client';

import type { ReactElement } from 'react';
import type { MenuiserieSVGProps } from '@/lib/svg/types';
import {
  getFenetreSVG,
  getPorteFenetreSVG,
  getCoulissantSVG,
  getChassisFixeSVG,
  getChassissouffletSVG,
} from '@/lib/svg/menuiserie-templates';
import { cn } from '@/lib/utils';

/**
 * Composant SVG pour afficher le schéma d'une menuiserie
 *
 * @example
 * <MenuiserieSVG type="fenetre" nbVantaux={2} />
 * <MenuiserieSVG type="coulissant" nbVantaux={3} className="w-full max-w-md" />
 */
export function MenuiserieSVG({
  type,
  nbVantaux,
  width = 200,
  height = 150,
  className,
}: MenuiserieSVGProps) {
  // Sélectionner le template approprié
  const getSVGTemplate = (): ReactElement => {
    switch (type) {
      case 'fenetre':
        return getFenetreSVG(nbVantaux, width, height);
      case 'porte-fenetre':
        return getPorteFenetreSVG(nbVantaux, width, height);
      case 'coulissant':
        return getCoulissantSVG(nbVantaux, width, height);
      case 'chassis-fixe':
        return getChassisFixeSVG(width, height);
      case 'chassis-soufflet':
        return getChassissouffletSVG(width, height);
      default: {
        // Fallback sur fenêtre
        const _exhaustiveCheck: never = type;
        return getFenetreSVG(nbVantaux, width, height);
      }
    }
  };

  const svgElement = getSVGTemplate();

  // Cloner le SVG pour ajouter la className
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-auto', className)}
      role="img"
      aria-label={`Schéma ${type} ${nbVantaux > 0 ? `${nbVantaux} vantaux` : ''}`}
    >
      {(svgElement.props as { children: React.ReactNode }).children}
    </svg>
  );
}

export default MenuiserieSVG;
