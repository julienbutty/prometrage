'use client';

/**
 * PROTOTYPE UX - Menuiserie Editor
 *
 * Version 7 : Respect de la charte graphique /menuiserie/[id]
 * - Header sticky avec navigation retour et position
 * - Footer fixed avec NavigationBar + boutons Save/Valider
 * - Formulaires avec icônes colorées
 * - Style shadcn cohérent
 *
 * URL: /prototype/menuiserie-ux
 */

import { useState } from 'react';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Upload,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Données mockées
const MOCK_DATA = {
  repere: 'Salon',
  intitule: 'Coulissant 2 vantaux - ALU PERFORMAX',
  position: 2,
  total: 5,
  largeur: 3000,
  hauteur: 2250,
  hauteurAllege: '',
  habillagesInt: { haut: '', bas: '', gauche: '', droite: '' },
  habillagesExt: { haut: '', bas: '', gauche: '', droite: '' },
  detectedType: {
    materiau: 'ALU',
    pose: 'NEUF',
    typeProduit: 'Coulissant',
    configKey: 'alu-neuf-coulissant',
  },
  caracteristiques: {
    gamme: 'PERFORMAX',
    pack: '',
    teinteRalInt: 'Ral 7039',
    teinteRalExt: 'Idem intérieure',
  },
  details: {
    typePose: 'Tunnel',
    dimensionsType: 'Clair de bois',
    dormant: 'Sans aile',
    doubleVitrage: '',
    intercalaire: 'Noir',
    ouvrantPrincipal: 'Droite',
    fermeture: '',
    poignee: '',
    rails: 'Inox',
    couleurJoints: 'Gris',
    couleurQuincaillerie: '',
    couleurPareTempete: '9016',
    intitule: '',
  },
  observations: '',
};

const HABILLAGE_OPTIONS = ['Aucun', 'Standard', 'PVC 70mm', 'Alu 30mm', 'Bois'];

export default function PrototypeMenuiserieUX() {
  // États des données
  const [largeur, setLargeur] = useState(String(MOCK_DATA.largeur));
  const [hauteur, setHauteur] = useState(String(MOCK_DATA.hauteur));
  const [hauteurAllege, setHauteurAllege] = useState(MOCK_DATA.hauteurAllege);
  const [habillagesInt, setHabillagesInt] = useState(MOCK_DATA.habillagesInt);
  const [habillagesExt, setHabillagesExt] = useState(MOCK_DATA.habillagesExt);
  const [repere, setRepere] = useState(MOCK_DATA.repere);
  const [observations, setObservations] = useState(MOCK_DATA.observations);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50 pb-64 lg:pb-40">
      {/* Header Sticky - Identique à /menuiserie/[id] */}
      <div className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4 p-4 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 lg:h-12 lg:w-12"
            >
              <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6" />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 lg:gap-3">
                <h1 className="truncate text-lg font-bold lg:text-2xl">
                  {MOCK_DATA.repere || 'Menuiserie'}
                </h1>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium whitespace-nowrap text-gray-500 lg:px-3 lg:py-1.5 lg:text-sm">
                  {MOCK_DATA.position}/{MOCK_DATA.total}
                </span>
              </div>
              <p className="truncate text-sm text-gray-600 lg:text-base lg:mt-1">
                {MOCK_DATA.intitule}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 text-red-500 hover:bg-red-50 hover:text-red-600 lg:h-12 lg:w-12"
            >
              <Trash2 className="h-5 w-5 lg:h-6 lg:w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="mx-auto max-w-7xl p-4 lg:px-8 lg:py-6 space-y-4">

        {/* === CARD: SVG + DIMENSIONS & SCHÉMA === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              📏 Dimensions & Schéma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* SVG ZONE */}
            <div className="relative flex items-center justify-center pt-4 pb-24">
              <div className="relative">
                {/* Dimension Hauteur (gauche) - horizontal */}
                <div className="absolute -left-20 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                    {hauteur} mm
                  </span>
                  <div className="flex flex-col items-center">
                    <div className="w-px h-3 bg-gray-400" />
                    <div className="w-2 h-px bg-gray-400" />
                  </div>
                </div>

                {/* Flèche hauteur gauche */}
                <div className="absolute -left-3 top-0 bottom-0 flex flex-col items-center justify-between py-1">
                  <div className="w-px flex-1 bg-gray-400" />
                </div>

                {/* SVG Menuiserie */}
                <div className="relative border-2 border-blue-400 rounded bg-white" style={{ width: 260, height: 180 }}>
                  {/* Habillage labels sur le SVG */}
                  {/* Habillage Haut */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full pb-1">
                    <HabillageLabel int={habillagesInt.haut} ext={habillagesExt.haut} />
                  </div>
                  <div className="absolute left-2 top-1/2 -translate-y-1/2">
                    <HabillageLabel int={habillagesInt.gauche} ext={habillagesExt.gauche} />
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <HabillageLabel int={habillagesInt.droite} ext={habillagesExt.droite} />
                  </div>

                  {/* Vantaux */}
                  <div className="absolute inset-3 grid grid-cols-2 gap-1">
                    <div className="border border-gray-300 bg-blue-50/30" />
                    <div className="border border-gray-300 bg-blue-50/30" />
                  </div>

                  {/* Poignées */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
                    <div className="w-1 h-5 bg-gray-400 rounded" />
                    <div className="w-1 h-5 bg-gray-400 rounded" />
                  </div>
                </div>

                {/* Bas: Largeur + Habillage Bas + Légende */}
                <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                  {/* Largeur */}
                  <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-gray-400" />
                    <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                      {largeur} mm
                    </span>
                    <div className="h-px w-8 bg-gray-400" />
                  </div>
                  {/* Habillage Bas */}
                  <HabillageLabel int={habillagesInt.bas} ext={habillagesExt.bas} />
                  {/* Légende Int/Ext */}
                  <div className="flex items-center gap-3 text-xs mt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Int
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      Ext
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Largeur (mm)">
                  <Input
                    type="number"
                    value={largeur}
                    onChange={(e) => setLargeur(e.target.value)}
                    className="h-11"
                  />
                </FormField>
                <FormField label="Hauteur (mm)">
                  <Input
                    type="number"
                    value={hauteur}
                    onChange={(e) => setHauteur(e.target.value)}
                    className="h-11"
                  />
                </FormField>
                <FormField label="Hauteur d'allège (mm)">
                  <Input
                    type="number"
                    value={hauteurAllege}
                    onChange={(e) => setHauteurAllege(e.target.value)}
                    className="h-11"
                  />
                </FormField>
            </div>

            {/* Habillages intérieurs */}
            <SubSection title="Habillages intérieurs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(['haut', 'bas', 'gauche', 'droite'] as const).map((side) => (
                  <FormField key={side} label={capitalize(side)}>
                    <Select
                      value={habillagesInt[side]}
                      onValueChange={(v) => setHabillagesInt(prev => ({ ...prev, [side]: v }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {HABILLAGE_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                ))}
              </div>
            </SubSection>

            {/* Habillages extérieurs */}
            <SubSection title="Habillages extérieurs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(['haut', 'bas', 'gauche', 'droite'] as const).map((side) => (
                  <FormField key={side} label={capitalize(side)}>
                    <Select
                      value={habillagesExt[side]}
                      onValueChange={(v) => setHabillagesExt(prev => ({ ...prev, [side]: v }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {HABILLAGE_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                ))}
              </div>
            </SubSection>
          </CardContent>
        </Card>

        {/* === CARD: REPÈRE === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              🏷️ Repère
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField label="Identifiant de la menuiserie">
              <Input
                value={repere}
                onChange={(e) => setRepere(e.target.value)}
                placeholder="Ex: Salon, R1, Fenêtre cuisine..."
                className="h-11"
              />
            </FormField>
          </CardContent>
        </Card>

        {/* === CARD: TYPE DÉTECTÉ === */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <span className="text-lg">🔍</span> Type détecté
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-sm">
                {MOCK_DATA.detectedType.materiau}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {MOCK_DATA.detectedType.pose}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {MOCK_DATA.detectedType.typeProduit}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Config: {MOCK_DATA.detectedType.configKey}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Type de formulaire chargé automatiquement selon les données du PDF
            </p>
          </CardContent>
        </Card>

        {/* === CARD: CARACTÉRISTIQUES PRODUIT === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              🎨 Caractéristiques produit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Gamme">
                  <Select defaultValue={MOCK_DATA.caracteristiques.gamme}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERFORMAX">PERFORMAX</SelectItem>
                      <SelectItem value="PREMIUM">PREMIUM</SelectItem>
                      <SelectItem value="STANDARD">STANDARD</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Pack">
                  <Select>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Teinte RAL intérieure">
                  <Select defaultValue={MOCK_DATA.caracteristiques.teinteRalInt}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ral 7039">Ral 7039</SelectItem>
                      <SelectItem value="Ral 9016">Ral 9016</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Teinte RAL extérieure">
                  <Select defaultValue={MOCK_DATA.caracteristiques.teinteRalExt}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Idem intérieure">Idem intérieure</SelectItem>
                      <SelectItem value="Ral 7039">Ral 7039</SelectItem>
                      <SelectItem value="Ral 9016">Ral 9016</SelectItem>
                    </SelectContent>
                  </Select>
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* === CARD: DÉTAILS ADDITIONNELS === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              📋 Détails additionnels
            </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Type de pose">
                  <Select defaultValue={MOCK_DATA.details.typePose}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tunnel">Tunnel</SelectItem>
                      <SelectItem value="Applique">Applique</SelectItem>
                      <SelectItem value="Feuillure">Feuillure</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Dimensions / Type">
                  <Select defaultValue={MOCK_DATA.details.dimensionsType}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Clair de bois">Clair de bois</SelectItem>
                      <SelectItem value="Tableau">Tableau</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Dormant">
                  <Select defaultValue={MOCK_DATA.details.dormant}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sans aile">Sans aile</SelectItem>
                      <SelectItem value="Avec aile">Avec aile</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Double vitrage">
                  <Select>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4/16/4 standard">4/16/4 standard</SelectItem>
                      <SelectItem value="4/20/4 ITR">4/20/4 ITR</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Intercalaire">
                  <Select defaultValue={MOCK_DATA.details.intercalaire}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Noir">Noir</SelectItem>
                      <SelectItem value="Gris">Gris</SelectItem>
                      <SelectItem value="Blanc">Blanc</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Ouvrant principal">
                  <Select defaultValue={MOCK_DATA.details.ouvrantPrincipal}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Droite">Droite</SelectItem>
                      <SelectItem value="Gauche">Gauche</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Fermeture">
                  <Select>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Crémone">Crémone</SelectItem>
                      <SelectItem value="Serrure">Serrure</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Poignée">
                  <Select>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Secustik">Secustik</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Rails">
                  <Select defaultValue={MOCK_DATA.details.rails}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inox">Inox</SelectItem>
                      <SelectItem value="Alu">Alu</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Couleur des joints">
                  <Select defaultValue={MOCK_DATA.details.couleurJoints}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gris">Gris</SelectItem>
                      <SelectItem value="Noir">Noir</SelectItem>
                      <SelectItem value="Blanc">Blanc</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Couleur quincaillerie">
                  <Select>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Noir">Noir</SelectItem>
                      <SelectItem value="Blanc">Blanc</SelectItem>
                      <SelectItem value="Inox">Inox</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Couleur pare-tempête">
                  <Select defaultValue={MOCK_DATA.details.couleurPareTempete}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9016">9016</SelectItem>
                      <SelectItem value="7016">7016</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <div className="mt-4">
                <FormField label="Intitulé">
                  <Input
                    placeholder=""
                    className="h-11"
                  />
                </FormField>
            </div>
          </CardContent>
        </Card>

        {/* === CARD: OBSERVATIONS === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              💬 Observations
              <span className="text-sm font-normal text-gray-500">(optionnel)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Remarques écrites">
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Ajoutez vos observations..."
                className="w-full h-28 px-3 py-2 text-sm border border-input rounded-md resize-none shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
              />
            </FormField>

            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Photos d&apos;observation</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">
                  Cliquez pour ajouter des photos
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  ou glissez-déposez vos fichiers ici
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Fixed Bottom Navigation + Save - Identique à /menuiserie/[id] */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t bg-white shadow-lg"
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8 lg:py-6">
          {/* Mobile : Stack vertical */}
          <div className="flex flex-col gap-3 lg:hidden">
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-2.5 h-2.5 rounded-full',
                      i === MOCK_DATA.position
                        ? 'bg-blue-600'
                        : i < MOCK_DATA.position
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    )}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            {/* Boutons */}
            <div className="flex gap-2">
              <Button
                className="h-14 flex-1 text-lg"
                variant="outline"
              >
                <Save className="mr-2 h-5 w-5" />
                Enregistrer
              </Button>
              <Button
                className="h-14 flex-1 bg-green-600 text-lg hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Valider
              </Button>
            </div>
          </div>

          {/* Desktop : Layout horizontal aligné */}
          <div className="hidden lg:flex lg:items-end lg:gap-6">
            <div className="flex-1">
              {/* Navigation Desktop */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-3 h-3 rounded-full transition-colors',
                        i === MOCK_DATA.position
                          ? 'bg-blue-600'
                          : i < MOCK_DATA.position
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      )}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <span className="text-sm text-gray-500">
                  {MOCK_DATA.position} / {MOCK_DATA.total}
                </span>
              </div>
            </div>
            <Button
              className="h-14 whitespace-nowrap px-8 text-lg"
              variant="outline"
            >
              <Save className="mr-2 h-5 w-5" />
              Enregistrer
            </Button>
            <Button
              className="h-14 whitespace-nowrap bg-green-600 px-8 text-lg hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Valider
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANTS
// ============================================================

interface SubSectionProps {
  title: string;
  children: React.ReactNode;
}

function SubSection({ title, children }: SubSectionProps) {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

function FormField({ label, children }: FormFieldProps) {
  return (
    <div className="min-w-0">
      <Label className="text-xs text-gray-500 mb-1.5 block">{label}</Label>
      <div className="w-full [&>*]:w-full">
        {children}
      </div>
    </div>
  );
}

interface HabillageLabelProps {
  int: string;
  ext: string;
}

function HabillageLabel({ int, ext }: HabillageLabelProps) {
  return (
    <div className="text-[9px] leading-tight text-center">
      <div className="text-blue-600">Int: {int || 'Aucun'}</div>
      <div className="text-orange-600">Ext: {ext || 'Aucun'}</div>
    </div>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
