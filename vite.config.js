import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANTE: substitua "xadrez-com-carinho" pelo nome EXATO do seu repositório no GitHub
// Exemplo: se seu repo for github.com/victor/curso-xadrez, mude para "/curso-xadrez/"
export default defineConfig({
  plugins: [react()],
  base: "/xadrez-com-carinho/",
});
