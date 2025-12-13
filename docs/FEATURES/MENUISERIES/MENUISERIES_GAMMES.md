# Système de Gammes et Formulaires Dynamiques

## Vue d'ensemble

L'application utilise un système de **détection automatique** pour assigner chaque menuiserie au bon formulaire selon 3 critères :

1. **Matériau** : ALU ou PVC (déduit de la gamme)
2. **Neuf ou Rénovation** : si pose en applique = neuf
3. **Type de produit** : FENETRE, PORTE_ENTREE ou COULISSANT (déduit de gamme + intitulé)

---

## 1. Gammes disponibles

### Gamme ALUMINIUM

| Gamme         | Type produit  | Description                         |
| ------------- | ------------- | ----------------------------------- |
| **OPTIMAX**   | Fenêtre/Porte | Gamme standard ALU                  |
| **INNOVAX**   | Fenêtre/Porte | Gamme ALU avec options avancées     |
| **PERFORMAX** | Coulissant    | **Coulissant ALUMINIUM uniquement** |

### Gamme PVC

| Gamme          | Type produit  | Description                   |
| -------------- | ------------- | ----------------------------- |
| **SOFTLINE**   | Fenêtre/Porte | Gamme standard PVC            |
| **KIETISLINE** | Fenêtre/Porte | Gamme PVC spécifique          |
| **WISIO**      | Coulissant    | **Coulissant PVC uniquement** |

---

## 2. Détection automatique du type de pose Neuf ou Rénovation

### Règles de détection

Si pose en applique -> forcément un formulaire de produit neuf

## 3. Table de mapping complète (7 formulaires)

| #   | Matériau | Type Pose  | Type Produit | Fichier Enum                                     | Gammes concernées    |
| --- | -------- | ---------- | ------------ | ------------------------------------------------ | -------------------- |
| 1   | ALU      | RENOVATION | FENETRE      | `MENUISERIES_GAMME_ALU_FORM.md`                  | OPTIMAX, INNOVAX     |
| 2   | ALU      | NEUF       | FENETRE      | `MENUISERIES_GAMME_ALU_FORM_NEUF.md`             | OPTIMAX, INNOVAX     |
| 3   | ALU      | **\***     | PORTE_ENTREE | `MENUISERIES_GAMME_ALU_FORM_PORTE_ENTREE.md`     | OPTIMAX, INNOVAX     |
| 4   | PVC      | RENOVATION | FENETRE      | `MENUISERIES_GAMME_PVC_FORM_RENO.md`             | SOFTLINE, KIETISLINE |
| 5   | PVC      | NEUF       | FENETRE      | `MENUISERIES_GAMME_PVC_FORM_NEUF.md`             | SOFTLINE, KIETISLINE |
| 6   | PVC      | **\***     | COULISSANT   | `MENUISERIES_GAMME_PVC_FORM_COULISSANT_WISIO.md` | WISIO                |
| 7   | PVC      | **\***     | PORTE_ENTREE | `MENUISERIES_GAMME_PVC_FORM_PE.md`               | SOFTLINE, KIETISLINE |

**Note** : `*` signifie que le type de pose (NEUF/RENOVATION) n'affecte pas le choix du formulaire pour ce cas.

---
