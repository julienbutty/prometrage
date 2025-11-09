"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

export interface ComboboxFieldProps {
  /** ID unique du champ */
  id: string;
  /** Label affiché au-dessus du champ */
  label: string;
  /** Valeur actuelle (modifiée) */
  value: string;
  /** Valeur originale du PDF (optionnel) */
  originalValue?: string;
  /** Liste des options disponibles */
  options: string[];
  /** Callback appelé lors du changement de valeur */
  onChange: (value: string) => void;
  /** Permet la saisie libre en plus des options */
  allowCustom?: boolean;
  /** Texte de placeholder */
  placeholder?: string;
}

/**
 * Composant Combobox responsive avec recherche et saisie libre optionnelle
 *
 * - **Desktop** (≥768px): Popover dropdown
 * - **Mobile** (<768px): Drawer bottom sheet
 *
 * Permet de :
 * - Rechercher dans une liste d'options
 * - Sélectionner une option
 * - Saisir une valeur personnalisée si allowCustom=true
 * - Afficher la différence avec la valeur PDF originale
 *
 * @example
 * ```tsx
 * <ComboboxField
 *   id="couleurInt"
 *   label="Couleur intérieure"
 *   value={formData.couleurInt}
 *   originalValue={donneesOriginales.couleurInt}
 *   options={["Blanc", "Noir", "F9"]}
 *   onChange={(value) => handleChange("couleurInt", value)}
 *   allowCustom
 *   placeholder="Ex: RAL 7016"
 * />
 * ```
 */
export function ComboboxField({
  id,
  label,
  value,
  originalValue,
  options,
  onChange,
  allowCustom = false,
  placeholder = "Sélectionner...",
}: ComboboxFieldProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Détecte si la valeur a été modifiée par rapport au PDF
  const isModified = value !== originalValue && value !== "";

  // Filtre les options selon la recherche (insensible à la casse)
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  // Détermine si on doit afficher l'option de saisie libre
  const showCustomOption =
    allowCustom &&
    search.trim() !== "" &&
    !filteredOptions.some((opt) => opt.toLowerCase() === search.toLowerCase());

  // Handler pour sélection (commun aux 2 versions)
  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
    setSearch("");
  };

  // Render du contenu Command (commun aux 2 versions)
  const renderCommandContent = () => (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Rechercher..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Aucune option trouvée.</CommandEmpty>
        <CommandGroup>
          {/* Options filtrées */}
          {filteredOptions.map((option) => (
            <CommandItem
              key={option}
              value={option}
              onSelect={handleSelect}
              className="h-12"
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === option ? "opacity-100" : "opacity-0"
                )}
              />
              {option}
            </CommandItem>
          ))}

          {/* Option de saisie libre */}
          {showCustomOption && (
            <CommandItem
              value={search}
              onSelect={handleSelect}
              className="text-primary h-12"
            >
              <Check className="mr-2 h-4 w-4 opacity-0" />
              Utiliser &quot;{search}&quot;
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  // Render du trigger button (commun aux 2 versions)
  const renderTrigger = () => (
    <Button
      id={id}
      variant="outline"
      role="button"
      aria-expanded={open}
      className={cn(
        "h-14 w-full justify-between text-left font-normal",
        !value && "text-muted-foreground"
      )}
    >
      <span className="min-w-0 flex-1 truncate">
        {value || placeholder}
      </span>
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  return (
    <div className="min-w-0 space-y-2">
      {/* Label et badge "Modifié" */}
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        {isModified && (
          <Badge variant="default" className="text-xs">
            Modifié
          </Badge>
        )}
      </div>

      {/* Valeur PDF originale */}
      {originalValue && (
        <div className="text-muted-foreground text-xs">
          PDF: <span className="font-medium">{originalValue}</span>
        </div>
      )}

      {/* Desktop: Popover */}
      {isDesktop ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{renderTrigger()}</PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            {renderCommandContent()}
          </PopoverContent>
        </Popover>
      ) : (
        /* Mobile: Drawer */
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>{renderTrigger()}</DrawerTrigger>
          <DrawerContent>
            {/* Titre caché pour accessibilité */}
            <DrawerTitle className="sr-only">{label}</DrawerTitle>
            <div className="mt-4 border-t">
              {renderCommandContent()}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
