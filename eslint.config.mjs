import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "src/generated/**",
    ],
    rules: {
      // Mobile-first development rules
      "@typescript-eslint/no-unused-vars": [
        "warn", // Changé de "error" à "warn" pour déploiement POC
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn", // Changé de "error" à "warn" pour déploiement POC
      "@typescript-eslint/no-require-imports": "off", // Désactivé (Prisma généré)
      "react-hooks/exhaustive-deps": "warn",
      "react/self-closing-comp": "error",
      "react/no-unescaped-entities": "warn", // Changé de "error" à "warn"
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];

export default eslintConfig;
