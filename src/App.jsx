import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Volume2, VolumeX, RotateCcw, Check, Lock, Home, BookOpen, Award, HelpCircle, Play, Pause } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   XADREZ COM CARINHO — Curso completo em 20 aulas
   Desenhado para uma estudante de 72 anos: ritmo calmo, contraste alto,
   tipografia generosa, sem pressa, com voz opcional.
   Estética: manuscrito iluminado moderno — creme, sépia, verde-musgo, dourado.
   ═══════════════════════════════════════════════════════════════════════════ */

// ───────────────────────── DESIGN TOKENS ─────────────────────────
const C = {
  // Paleta "manuscrito iluminado" — calma e legível
  cream: "#F5EFE0",        // fundo principal
  creamDark: "#EBE3CE",    // fundo de cards
  parchment: "#FAF6EA",    // tabuleiro casas claras
  sepia: "#8B6F47",        // texto principal
  sepiaDeep: "#5C4A33",    // texto importante
  ink: "#2C1F0F",          // títulos
  moss: "#5C7548",         // verde-musgo (acento principal)
  mossLight: "#8FA876",    // hover/destaque suave
  gold: "#B8945A",          // dourado (highlights)
  goldBright: "#D4AF6B",    // dourado claro
  rose: "#A8625C",          // vermelho-tijolo (perigo/captura)
  sky: "#6B8CA8",           // azul-cinza (informação)
  // Tabuleiro
  lightSquare: "#F0E4C8",
  darkSquare: "#A88A5C",
  // Highlights de movimento
  validMove: "rgba(92,117,72,0.45)",
  selectedSquare: "rgba(184,148,90,0.65)",
  captureSquare: "rgba(168,98,92,0.55)",
  hintSquare: "rgba(212,175,107,0.5)",
};

// ───────────────────────── PEÇAS SVG ─────────────────────────
// Desenhadas à mão, estilo silhueta clássica, com sombra leve.
// Cores: brancas (creme com contorno escuro) e pretas (escuro com contorno dourado).

function PieceSvg({ type, color, size = 64 }) {
  const fill = color === "w" ? "#FAF6EA" : "#2C1F0F";
  const stroke = color === "w" ? "#2C1F0F" : "#B8945A";
  const sw = 2.5;

  const paths = {
    K: ( // Rei
      <g>
        <path d={`M 22.5 11.63 V 6 M 20 8 H 25`} stroke={stroke} strokeWidth={sw} strokeLinejoin="miter"/>
        <path d={`M 22.5 25 C 22.5 25 27 17.5 25.5 14.5 C 25.5 14.5 24.5 12 22.5 12 C 20.5 12 19.5 14.5 19.5 14.5 C 18 17.5 22.5 25 22.5 25`} fill={fill} stroke={stroke} strokeWidth={sw}/>
        <path d={`M 11.5 37 C 17 40.5 27 40.5 32.5 37 L 32.5 30 C 32.5 30 41.5 25.5 38.5 19.5 C 34.5 13 25 16 22.5 23.5 L 22.5 27 L 22.5 23.5 C 19 16 9.5 13 6.5 19.5 C 3.5 25.5 11.5 29.5 11.5 29.5 Z`} fill={fill} stroke={stroke} strokeWidth={sw}/>
        <path d={`M 11.5 30 C 17 27 27 27 32.5 30`} fill="none" stroke={stroke} strokeWidth={sw}/>
        <path d={`M 11.5 33.5 C 17 30.5 27 30.5 32.5 33.5`} fill="none" stroke={stroke} strokeWidth={sw}/>
        <path d={`M 11.5 37 C 17 34 27 34 32.5 37`} fill="none" stroke={stroke} strokeWidth={sw}/>
      </g>
    ),
    Q: ( // Dama
      <g>
        <path d={`M 9 26 C 17.5 24.5 30 24.5 36 26 L 38.5 13.5 L 31 25 L 30.7 10.9 L 25.5 24.5 L 22.5 10 L 19.5 24.5 L 14.3 10.9 L 14 25 L 6.5 13.5 L 9 26 Z`} fill={fill} stroke={stroke} strokeWidth={sw}/>
        <path d={`M 9 26 C 9 28 10.5 28 11.5 30 C 12.5 31.5 12.5 31 12 33.5 C 10.5 34.5 11 36 11 36 C 9.5 37.5 11 38.5 11 38.5 C 17.5 39.5 27.5 39.5 34 38.5 C 34 38.5 35.5 37.5 34 36 C 34 36 34.5 34.5 33 33.5 C 32.5 31 32.5 31.5 33.5 30 C 34.5 28 36 28 36 26 C 27.5 24.5 17.5 24.5 9 26 Z`} fill={fill} stroke={stroke} strokeWidth={sw}/>
        <circle cx="6" cy="12" r="2" fill={fill} stroke={stroke} strokeWidth={sw}/>
        <circle cx="14" cy="9" r="2" fill={fill} stroke={stroke} strokeWidth={sw}/>
        <circle cx="22.5" cy="8" r="2" fill={fill} stroke={stroke} strokeWidth={sw}/>
        <circle cx="31" cy="9" r="2" fill={fill} stroke={stroke} strokeWidth={sw}/>
        <circle cx="39" cy="12" r="2" fill={fill} stroke={stroke} strokeWidth={sw}/>
      </g>
    ),
    R: ( // Torre
      <g>
        <path d={`M 9 39 L 36 39 L 36 36 L 9 36 Z`} fill={fill} stroke={stroke} strokeWidth={sw}/>
        <path d={`M 12.5 32 L 14 29.5 L 31 29.5 L 32.5 32 Z`} fill={fill} stroke={stroke} strokeWidth={sw}/>
        <path d={`M 12 36 L 12 32 L 33 32 L 33 36 Z`} fill={fill} stroke={stroke} strokeWidth={sw}/>
        <path d={`M 14 29.5 L 14 16.5 L 31 16.5 L 31 29.5 Z`} fill={fill} stroke={stroke} strokeWidth={sw}/>
        <path d={`M 14 16.5 L 11 14 L 11 9 L 15 9 L 15 11 L 20 11 L 20 9 L 25 9 L 25 11 L 30 11 L 30 9 L 34 9 L 34 14 L 31 16.5 Z`} fill={fill} stroke={stroke} strokeWidth={sw}/>
      </g>
    ),
    B: ( // Bispo
      <g>
        <g fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="butt">
          <path d={`M 9 36 C 12.39 35.03 19.11 36.43 22.5 34 C 25.89 36.43 32.61 35.03 36 36 C 36 36 37.65 36.54 39 38 C 38.32 38.97 37.35 38.99 36 38.5 C 32.61 37.53 25.89 38.96 22.5 37.5 C 19.11 38.96 12.39 37.53 9 38.5 C 7.65 38.99 6.68 38.97 6 38 C 7.35 36.54 9 36 9 36 Z`}/>
          <path d={`M 15 32 C 17.5 34.5 27.5 34.5 30 32 C 30.5 30.5 30 30 30 30 C 30 27.5 27.5 26 27.5 26 C 33 24.5 33.5 14.5 22.5 10.5 C 11.5 14.5 12 24.5 17.5 26 C 17.5 26 15 27.5 15 30 C 15 30 14.5 30.5 15 32 Z`}/>
          <path d={`M 25 8 A 2.5 2.5 0 1 1 20 8 A 2.5 2.5 0 1 1 25 8 Z`}/>
        </g>
        <path d={`M 17.5 26 L 27.5 26 M 15 30 L 30 30 M 22.5 15.5 L 22.5 20.5 M 20 18 L 25 18`} fill="none" stroke={stroke} strokeWidth={sw} strokeLinejoin="miter"/>
      </g>
    ),
    N: ( // Cavalo
      <g fill={fill} stroke={stroke} strokeWidth={sw}>
        <path d={`M 22 10 C 32.5 11 38.5 18 38 39 L 15 39 C 15 30 25 32.5 23 18`}/>
        <path d={`M 24 18 C 24.38 20.91 18.45 25.37 16 27 C 13 29 13.18 31.34 11 31 C 9.958 30.06 12.41 27.96 11 28 C 10 28 11.19 29.23 10 30 C 9 30 5.997 31 6 26 C 6 24 12 14 12 14 C 12 14 13.89 12.1 14 10.5 C 13.27 9.506 13.5 8.5 13.5 7.5 C 14.5 5.5 16.5 4.5 16.5 4.5 L 18 8 C 18 8 20.5 5 22 5 C 22 5 24 6 23 8 C 22 9 22 9 22 9`}/>
        <path d={`M 9.5 25.5 A 0.5 0.5 0 1 1 8.5 25.5 A 0.5 0.5 0 1 1 9.5 25.5 Z`} fill={stroke}/>
        <path d={`M 14.5 15.5 A 0.5 1.5 0 1 1 13.5 15.5 A 0.5 1.5 0 1 1 14.5 15.5 Z`} fill={stroke} transform="matrix(0.866 0.5 -0.5 0.866 9.693 -5.173)"/>
      </g>
    ),
    P: ( // Peão
      <path d={`M 22.5 9 C 20.29 9 18.5 10.79 18.5 13 C 18.5 13.89 18.79 14.71 19.28 15.38 C 17.33 16.5 16 18.59 16 21 C 16 23.03 16.94 24.84 18.41 26.03 C 15.41 27.09 11 31.58 11 39.5 L 34 39.5 C 34 31.58 29.59 27.09 26.59 26.03 C 28.06 24.84 29 23.03 29 21 C 29 18.59 27.67 16.5 25.72 15.38 C 26.21 14.71 26.5 13.89 26.5 13 C 26.5 10.79 24.71 9 22.5 9 Z`} fill={fill} stroke={stroke} strokeWidth={sw}/>
    ),
  };

  return (
    <svg viewBox="0 0 45 45" width={size} height={size} style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))" }}>
      {paths[type]}
    </svg>
  );
}

// ───────────────────────── HOOK: VOZ ─────────────────────────
function useVoice() {
  const [speaking, setSpeaking] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const utterRef = useRef(null);

  const speak = useCallback((text) => {
    if (!enabled || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    u.rate = 0.92;
    u.pitch = 1.0;
    // Tenta achar voz feminina pt-BR
    const voices = window.speechSynthesis.getVoices();
    const pt = voices.find(v => v.lang.startsWith("pt") && v.name.toLowerCase().includes("female")) ||
               voices.find(v => v.lang.startsWith("pt"));
    if (pt) u.voice = pt;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utterRef.current = u;
    window.speechSynthesis.speak(u);
  }, [enabled]);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, []);

  return { speak, stop, speaking, enabled, setEnabled };
}

// ───────────────────────── HOOK: PROGRESSO ─────────────────────────
// Usa state em memória (localStorage não funciona em artifacts)
function useProgress() {
  const [completed, setCompleted] = useState(new Set());

  const markComplete = useCallback((lessonNum) => {
    setCompleted(prev => new Set([...prev, lessonNum]));
  }, []);

  const isComplete = useCallback((n) => completed.has(n), [completed]);
  const isUnlocked = useCallback((n) => n === 1 || completed.has(n - 1), [completed]);

  return { completed, markComplete, isComplete, isUnlocked };
}

// ───────────────────────── COMPONENTE: BOTÃO PRINCIPAL ─────────────────────────
function BigButton({ children, onClick, variant = "primary", icon, disabled }) {
  const styles = {
    primary: { bg: C.moss, hover: C.mossLight, text: C.cream, border: C.sepiaDeep },
    secondary: { bg: C.creamDark, hover: C.cream, text: C.sepiaDeep, border: C.sepia },
    gold: { bg: C.gold, hover: C.goldBright, text: C.ink, border: C.sepiaDeep },
  };
  const s = styles[variant];
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.03, backgroundColor: s.hover } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{
        backgroundColor: disabled ? C.creamDark : s.bg,
        color: disabled ? C.sepia : s.text,
        border: `2px solid ${disabled ? C.sepia : s.border}`,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      className="px-8 py-4 text-xl rounded-2xl shadow-lg flex items-center gap-3 font-medium tracking-wide"
    >
      {icon}
      {children}
    </motion.button>
  );
}
// ───────────────────────── TABULEIRO ─────────────────────────
// Posições representadas como [linha, coluna] onde [0,0] é a8 (canto superior esquerdo)
// Peças: { type: 'K'|'Q'|'R'|'B'|'N'|'P', color: 'w'|'b' }

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

function squareName(r, c) { return FILES[c] + RANKS[r]; }
function parseSquare(name) {
  const c = FILES.indexOf(name[0]);
  const r = RANKS.indexOf(name[1]);
  return [r, c];
}

function emptyBoard() {
  return Array.from({ length: 8 }, () => Array(8).fill(null));
}

function startingBoard() {
  const b = emptyBoard();
  const back = ["R","N","B","Q","K","B","N","R"];
  for (let c = 0; c < 8; c++) {
    b[0][c] = { type: back[c], color: "b" };
    b[1][c] = { type: "P", color: "b" };
    b[6][c] = { type: "P", color: "w" };
    b[7][c] = { type: back[c], color: "w" };
  }
  return b;
}

// Cálculo de movimentos válidos (simplificado para fins didáticos — sem en passant/roque/cravadas)
function getValidMoves(board, r, c) {
  const piece = board[r]?.[c];
  if (!piece) return [];
  const { type, color } = piece;
  const moves = [];
  const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  const isEnemy = (r, c) => board[r]?.[c] && board[r][c].color !== color;
  const isEmpty = (r, c) => inBounds(r, c) && !board[r][c];

  const ray = (dr, dc) => {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc)) {
      if (!board[nr][nc]) moves.push([nr, nc]);
      else { if (board[nr][nc].color !== color) moves.push([nr, nc]); break; }
      nr += dr; nc += dc;
    }
  };

  if (type === "P") {
    const dir = color === "w" ? -1 : 1;
    const startRow = color === "w" ? 6 : 1;
    if (isEmpty(r + dir, c)) {
      moves.push([r + dir, c]);
      if (r === startRow && isEmpty(r + 2*dir, c)) moves.push([r + 2*dir, c]);
    }
    for (const dc of [-1, 1]) {
      if (inBounds(r + dir, c + dc) && isEnemy(r + dir, c + dc)) moves.push([r + dir, c + dc]);
    }
  }
  if (type === "R" || type === "Q") {
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc]) => ray(dr, dc));
  }
  if (type === "B" || type === "Q") {
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc]) => ray(dr, dc));
  }
  if (type === "N") {
    [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(([dr,dc]) => {
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && (!board[nr][nc] || isEnemy(nr, nc))) moves.push([nr, nc]);
    });
  }
  if (type === "K") {
    [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc]) => {
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && (!board[nr][nc] || isEnemy(nr, nc))) moves.push([nr, nc]);
    });
  }
  return moves;
}

// ───────────────────────── COMPONENTE: TABULEIRO INTERATIVO ─────────────────────────
function ChessBoard({
  board,
  onMove,
  highlights = [],          // [[r,c], ...] casas marcadas em verde (movimentos válidos hint)
  arrows = [],              // [{from:[r,c], to:[r,c], color}] setas didáticas
  showCoordinates = true,
  size = 480,
  interactive = true,
  highlightedPiece = null,  // [r,c] peça em foco (anel dourado)
  showLastMove = null,      // {from, to}
  pieceLabels = false,      // mostrar nome da peça em texto sob ela
}) {
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const sq = size / 8;

  function handleSquareClick(r, c) {
    if (!interactive) return;
    if (selected) {
      const [sr, sc] = selected;
      const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c);
      if (isValid) {
        onMove?.({ from: [sr, sc], to: [r, c], piece: board[sr][sc] });
        setSelected(null);
        setValidMoves([]);
        return;
      }
      if (board[r][c] && board[r][c].color === board[sr][sc].color) {
        setSelected([r, c]);
        setValidMoves(getValidMoves(board, r, c));
        return;
      }
      setSelected(null);
      setValidMoves([]);
      return;
    }
    if (board[r][c]) {
      setSelected([r, c]);
      setValidMoves(getValidMoves(board, r, c));
    }
  }

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* Moldura sépia */}
      <div style={{
        position: "absolute", inset: -14,
        background: `linear-gradient(135deg, ${C.sepiaDeep}, ${C.sepia})`,
        borderRadius: 12,
        boxShadow: "0 12px 40px rgba(44,31,15,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
      }}/>

      {/* Tabuleiro */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 4, overflow: "hidden",
        boxShadow: "inset 0 0 20px rgba(44,31,15,0.4)",
      }}>
        {Array.from({ length: 8 }).map((_, r) => (
          <div key={r} style={{ display: "flex" }}>
            {Array.from({ length: 8 }).map((_, c) => {
              const isLight = (r + c) % 2 === 0;
              const piece = board[r]?.[c];
              const isSelected = selected && selected[0] === r && selected[1] === c;
              const isValidMove = validMoves.some(([vr, vc]) => vr === r && vc === c);
              const isCapture = isValidMove && piece;
              const isHighlight = highlights.some(([hr, hc]) => hr === r && hc === c);
              const isHighlightedPiece = highlightedPiece && highlightedPiece[0] === r && highlightedPiece[1] === c;
              const isLastMove = showLastMove && (
                (showLastMove.from[0] === r && showLastMove.from[1] === c) ||
                (showLastMove.to[0] === r && showLastMove.to[1] === c)
              );

              return (
                <motion.div
                  key={c}
                  onClick={() => handleSquareClick(r, c)}
                  whileHover={interactive ? { filter: "brightness(1.08)" } : {}}
                  style={{
                    width: sq, height: sq, position: "relative",
                    backgroundColor: isLight ? C.lightSquare : C.darkSquare,
                    cursor: interactive ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {/* Highlight de seleção */}
                  {isSelected && (
                    <div style={{ position: "absolute", inset: 0, backgroundColor: C.selectedSquare }}/>
                  )}
                  {/* Highlight didático (verde-musgo) */}
                  {isHighlight && !isSelected && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ position: "absolute", inset: 0, backgroundColor: C.validMove }}
                    />
                  )}
                  {/* Última jogada */}
                  {isLastMove && !isSelected && !isHighlight && (
                    <div style={{ position: "absolute", inset: 0, backgroundColor: C.hintSquare }}/>
                  )}
                  {/* Coordenadas */}
                  {showCoordinates && c === 0 && (
                    <span style={{
                      position: "absolute", left: 4, top: 2,
                      fontSize: 11, fontWeight: 700,
                      color: isLight ? C.darkSquare : C.lightSquare,
                      fontFamily: "Crimson Text, serif",
                    }}>{RANKS[r]}</span>
                  )}
                  {showCoordinates && r === 7 && (
                    <span style={{
                      position: "absolute", right: 4, bottom: 2,
                      fontSize: 11, fontWeight: 700,
                      color: isLight ? C.darkSquare : C.lightSquare,
                      fontFamily: "Crimson Text, serif",
                    }}>{FILES[c]}</span>
                  )}
                  {/* Indicador de movimento válido */}
                  {isValidMove && !isCapture && (
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      style={{
                        position: "absolute", width: sq * 0.32, height: sq * 0.32,
                        borderRadius: "50%", backgroundColor: C.validMove,
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  {isCapture && (
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      style={{
                        position: "absolute", inset: 4,
                        borderRadius: "50%", border: `4px solid ${C.captureSquare}`,
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  {/* Anel dourado em peça em foco */}
                  {isHighlightedPiece && (
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        position: "absolute", inset: 4,
                        borderRadius: "50%", border: `3px solid ${C.gold}`,
                        boxShadow: `0 0 20px ${C.goldBright}`,
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  {/* Peça */}
                  <AnimatePresence>
                    {piece && (
                      <motion.div
                        key={`${piece.color}${piece.type}-${r}-${c}`}
                        layout
                        layoutId={`piece-${r}-${c}-${piece.color}${piece.type}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        style={{ position: "relative", zIndex: 2 }}
                      >
                        <PieceSvg type={piece.type} color={piece.color} size={sq * 0.85} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Setas didáticas SVG sobreposta */}
      {arrows.length > 0 && (
        <svg width={size} height={size} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={C.gold}/>
            </marker>
          </defs>
          {arrows.map((arrow, i) => {
            const x1 = arrow.from[1] * sq + sq/2;
            const y1 = arrow.from[0] * sq + sq/2;
            const x2 = arrow.to[1] * sq + sq/2;
            const y2 = arrow.to[0] * sq + sq/2;
            return (
              <motion.line
                key={i}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={arrow.color || C.gold}
                strokeWidth={5}
                strokeLinecap="round"
                markerEnd="url(#arrowhead)"
                style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}
              />
            );
          })}
        </svg>
      )}
    </div>
  );
}
// ───────────────────────── CONTEÚDO DAS AULAS ─────────────────────────
// Cada aula tem: slides[] com type: "intro"|"explain"|"practice"|"quiz"|"freestyle"
// Cada slide tem texto, opcionalmente um tabuleiro, setas, destaques.

// Helpers para construir tabuleiros rápido
function bd(setup) {
  // setup = { e4: 'wK', d5: 'bP' }
  const b = emptyBoard();
  for (const [sq, p] of Object.entries(setup)) {
    const [r, c] = parseSquare(sq);
    b[r][c] = { color: p[0], type: p[1] };
  }
  return b;
}
function hl(...squares) { return squares.map(s => parseSquare(s)); }
function arrow(from, to, color) { return { from: parseSquare(from), to: parseSquare(to), color }; }

const AULAS = [
  // ═══════════════════════ AULA 1: O TABULEIRO ═══════════════════════
  {
    n: 1, titulo: "O Tabuleiro", subtitulo: "Conhecendo o palco do jogo",
    capitulo: "Fundamentos",
    slides: [
      {
        type: "intro",
        titulo: "Bem-vinda ao xadrez!",
        texto: "Vamos começar devagar, sem pressa nenhuma. O xadrez é um jogo de mais de 1.500 anos — todo mundo que joga começou exatamente onde você está agora. Nesta primeira aula, vamos só conhecer o tabuleiro. Sem peças, sem regras complicadas. Só o lugar onde tudo acontece.",
      },
      {
        type: "explain",
        titulo: "O tabuleiro tem 64 casas",
        texto: "Olhe com calma. O tabuleiro é um quadrado com 8 fileiras e 8 colunas. Total: 64 casas, alternando entre claras e escuras. Como um piso de cozinha xadrez.",
        board: emptyBoard(),
        showCoordinates: false,
      },
      {
        type: "explain",
        titulo: "Casas claras e casas escuras",
        texto: "As casas claras são as 'casas brancas'. As escuras são as 'casas pretas'. Cada peça do jogo se move por essas casas — algumas só por um tipo, outras por todas.",
        board: emptyBoard(),
        showCoordinates: false,
      },
      {
        type: "explain",
        titulo: "Uma regra importante",
        texto: "Na hora de armar o jogo, lembre-se: a casa do canto direito de cada jogador deve ser CLARA. Esta é uma regra de ouro: 'casa clara à direita'. Olhe o tabuleiro — o canto inferior direito é claro, certo?",
        board: emptyBoard(),
        highlights: hl("h1"),
        showCoordinates: false,
      },
      {
        type: "explain",
        titulo: "As fileiras (linhas horizontais)",
        texto: "As linhas horizontais se chamam 'fileiras'. São numeradas de 1 a 8. A fileira 1 fica na sua frente quando você joga de brancas. A fileira 8 fica do lado do adversário.",
        board: emptyBoard(),
        highlights: hl("a1","b1","c1","d1","e1","f1","g1","h1"),
        showCoordinates: true,
      },
      {
        type: "explain",
        titulo: "As colunas (linhas verticais)",
        texto: "As colunas são as linhas verticais, da sua frente até o adversário. Elas têm letras: a, b, c, d, e, f, g, h. Da esquerda para a direita.",
        board: emptyBoard(),
        highlights: hl("d1","d2","d3","d4","d5","d6","d7","d8"),
        showCoordinates: true,
      },
      {
        type: "explain",
        titulo: "As diagonais",
        texto: "As linhas inclinadas são as 'diagonais'. Toda diagonal é de uma só cor — ou só casas claras, ou só casas escuras. Algumas peças andam só pelas diagonais.",
        board: emptyBoard(),
        highlights: hl("a1","b2","c3","d4","e5","f6","g7","h8"),
        showCoordinates: true,
      },
      {
        type: "explain",
        titulo: "Endereço de cada casa",
        texto: "Cada casa tem um 'endereço' formado por uma letra (coluna) e um número (fileira). Por exemplo: a casa marcada é a 'e4' — coluna 'e', fileira 4. É como o número de uma rua. Não precisa decorar agora — vamos usar pouco a pouco.",
        board: emptyBoard(),
        highlights: hl("e4"),
        showCoordinates: true,
      },
      {
        type: "quiz",
        titulo: "Vamos praticar!",
        pergunta: "A casa do canto direito do jogador deve ser de qual cor?",
        opcoes: ["Clara (branca)", "Escura (preta)", "Tanto faz"],
        correta: 0,
        explicacao: "Isso mesmo! 'Casa clara à direita' — é assim que se monta o tabuleiro corretamente.",
      },
      {
        type: "quiz",
        titulo: "Mais uma!",
        pergunta: "Quantas casas tem o tabuleiro?",
        opcoes: ["32 casas", "64 casas", "100 casas"],
        correta: 1,
        explicacao: "Exato! 8 fileiras × 8 colunas = 64 casas no total.",
      },
      {
        type: "complete",
        titulo: "Aula 1 concluída! 🎉",
        texto: "Você já conhece o tabuleiro. Isso é mais do que muita gente sabe! Na próxima aula, vamos conhecer a primeira peça: o Peão. Pequeno, mas com muita personalidade.",
      },
    ]
  },

  // ═══════════════════════ AULA 2: O PEÃO ═══════════════════════
  {
    n: 2, titulo: "O Peão", subtitulo: "O soldado pequeno e corajoso",
    capitulo: "Fundamentos",
    slides: [
      {
        type: "intro",
        titulo: "Conheça o Peão",
        texto: "O peão é a peça mais numerosa: cada jogador tem 8. É também a peça mais fraca individualmente — mas em grupo, os peões fazem maravilhas. E o peão tem um segredo: se chegar até o final do tabuleiro, ele se transforma em outra peça! Vamos ver.",
        bigPiece: { type: "P", color: "w" },
      },
      {
        type: "explain",
        titulo: "Como o peão se move",
        texto: "O peão anda apenas para FRENTE — uma casa de cada vez. Ele nunca volta. Olhe: o peão está em e2 e pode andar para e3.",
        board: bd({ e2: "wP" }),
        highlights: hl("e3"),
        highlightedPiece: parseSquare("e2"),
      },
      {
        type: "explain",
        titulo: "O salto inicial",
        texto: "Tem uma exceção! Na PRIMEIRA jogada, o peão pode andar UMA ou DUAS casas para frente, à sua escolha. Depois disso, é sempre uma casa só.",
        board: bd({ e2: "wP" }),
        highlights: hl("e3", "e4"),
        highlightedPiece: parseSquare("e2"),
      },
      {
        type: "explain",
        titulo: "Como o peão CAPTURA",
        texto: "Aqui está a parte mais curiosa: o peão captura DIFERENTE de como ele anda. Ele captura na DIAGONAL, uma casa à frente. Olhe: o peão branco em e4 pode capturar as peças pretas em d5 e f5.",
        board: bd({ e4: "wP", d5: "bP", f5: "bP" }),
        highlights: hl("d5", "f5"),
        highlightedPiece: parseSquare("e4"),
      },
      {
        type: "explain",
        titulo: "Atenção: peão não captura para frente",
        texto: "Se houver uma peça bem na frente do peão, ele FICA TRAVADO. Não pode capturar quem está bloqueando. Olhe: o peão branco em e4 não consegue passar.",
        board: bd({ e4: "wP", e5: "bP" }),
        highlightedPiece: parseSquare("e4"),
      },
      {
        type: "practice",
        titulo: "Sua vez! Mova o peão",
        texto: "Clique no peão branco e depois clique em uma das casas marcadas para movê-lo. Tente mover para e4 (duas casas).",
        board: bd({ e2: "wP" }),
        objetivo: { from: "e2", to: "e4" },
      },
      {
        type: "explain",
        titulo: "A promoção: o sonho do peão",
        texto: "Se um peão conseguir atravessar o tabuleiro inteiro e chegar à última fileira, acontece um milagre: ele vira QUALQUER peça que você quiser (menos rei). Geralmente vira Dama, a peça mais forte! É por isso que cada peão é precioso.",
        board: bd({ e7: "wP" }),
        highlights: hl("e8"),
        highlightedPiece: parseSquare("e7"),
      },
      {
        type: "quiz",
        titulo: "Vamos ver se você lembra",
        pergunta: "Quantas casas o peão pode andar na primeira jogada?",
        opcoes: ["Sempre 1 casa", "1 ou 2 casas, à escolha", "Sempre 2 casas"],
        correta: 1,
        explicacao: "Isso! Na primeira jogada do peão, você decide: 1 ou 2 casas. Depois disso, sempre 1.",
      },
      {
        type: "quiz",
        titulo: "Outra rapidinha",
        pergunta: "Como o peão captura uma peça do adversário?",
        opcoes: ["Andando uma casa para frente", "Pulando por cima", "Na diagonal, uma casa à frente"],
        correta: 2,
        explicacao: "Exato! Anda reto, mas captura na diagonal. É a peculiaridade do peão.",
      },
      {
        type: "complete",
        titulo: "Aula 2 concluída! 🎉",
        texto: "O peão pode parecer simples, mas você acabou de aprender 4 coisas sobre ele: anda para frente, salta na primeira jogada, captura na diagonal, e promove na última fileira. Próxima aula: a Torre — direta, forte, sem rodeios!",
      },
    ]
  },

  // ═══════════════════════ AULA 3: A TORRE ═══════════════════════
  {
    n: 3, titulo: "A Torre", subtitulo: "Forte e direta",
    capitulo: "Fundamentos",
    slides: [
      {
        type: "intro",
        titulo: "Conheça a Torre",
        texto: "A Torre parece um castelinho, e age como tal: forte, sólida, e gosta de linhas retas. Cada jogador tem 2 torres, posicionadas nos cantos do tabuleiro. É uma peça muito poderosa — vale 5 pontos (o peão vale só 1).",
        bigPiece: { type: "R", color: "w" },
      },
      {
        type: "explain",
        titulo: "Como a Torre se move",
        texto: "A Torre anda em LINHA RETA: para frente, para trás, ou para os lados. Quantas casas ela quiser, desde que não tenha nada no caminho. Olhe todas as casas que ela pode alcançar.",
        board: bd({ d4: "wR" }),
        highlights: hl("d1","d2","d3","d5","d6","d7","d8","a4","b4","c4","e4","f4","g4","h4"),
        highlightedPiece: parseSquare("d4"),
      },
      {
        type: "explain",
        titulo: "A Torre não pula peças",
        texto: "Se houver uma peça no caminho, a Torre PARA. Olhe: a torre branca está em d4, mas tem um peão branco em d6. Então ela só anda até d5. Não consegue passar.",
        board: bd({ d4: "wR", d6: "wP" }),
        highlights: hl("d1","d2","d3","d5","a4","b4","c4","e4","f4","g4","h4"),
        highlightedPiece: parseSquare("d4"),
      },
      {
        type: "explain",
        titulo: "Capturando com a Torre",
        texto: "Se a peça no caminho for do ADVERSÁRIO, a Torre pode capturar! Olhe: agora há um peão preto em d6 — a Torre pode capturá-lo.",
        board: bd({ d4: "wR", d6: "bP" }),
        highlights: hl("d1","d2","d3","d5","d6","a4","b4","c4","e4","f4","g4","h4"),
        highlightedPiece: parseSquare("d4"),
      },
      {
        type: "practice",
        titulo: "Sua vez! Capture o peão",
        texto: "Mova a Torre branca para capturar o peão preto. Clique na Torre, depois na casa do peão.",
        board: bd({ a1: "wR", a7: "bP" }),
        objetivo: { from: "a1", to: "a7" },
      },
      {
        type: "explain",
        titulo: "Por que a Torre é tão valiosa",
        texto: "Pense no número: a Torre alcança até 14 casas em campo aberto! Por isso ela vale 5 pontos. Mas no começo do jogo, a Torre fica meio presa nos cantos. Ela brilha mesmo é nos finais, quando o tabuleiro esvazia.",
        board: bd({ d4: "wR" }),
        highlights: hl("d1","d2","d3","d5","d6","d7","d8","a4","b4","c4","e4","f4","g4","h4"),
      },
      {
        type: "quiz",
        titulo: "Teste!",
        pergunta: "A Torre se move...",
        opcoes: ["Em diagonais", "Em linhas retas (horizontal e vertical)", "Em forma de L"],
        correta: 1,
        explicacao: "Perfeito! A Torre adora linhas retas. Diagonal não é com ela.",
      },
      {
        type: "complete",
        titulo: "Aula 3 concluída! 🎉",
        texto: "Você já sabe mover dois tipos de peças. A próxima é elegante e deslizante: o Bispo!",
      },
    ]
  },

  // ═══════════════════════ AULA 4: O BISPO ═══════════════════════
  {
    n: 4, titulo: "O Bispo", subtitulo: "Elegante na diagonal",
    capitulo: "Fundamentos",
    slides: [
      {
        type: "intro",
        titulo: "Conheça o Bispo",
        texto: "O Bispo é o complemento perfeito da Torre: enquanto a Torre adora linhas retas, o Bispo só anda em DIAGONAIS. Cada jogador tem 2 bispos. Vale 3 pontos. E tem uma característica única: cada bispo fica preso à sua cor de casa para sempre!",
        bigPiece: { type: "B", color: "w" },
      },
      {
        type: "explain",
        titulo: "Como o Bispo se move",
        texto: "O Bispo anda APENAS nas diagonais. Para qualquer direção diagonal, quantas casas quiser, desde que o caminho esteja livre.",
        board: bd({ d4: "wB" }),
        highlights: hl("a1","b2","c3","e5","f6","g7","h8","a7","b6","c5","e3","f2","g1"),
        highlightedPiece: parseSquare("d4"),
      },
      {
        type: "explain",
        titulo: "O bispo de casas claras e o de casas escuras",
        texto: "Repare: cada bispo só anda em casas de UMA COR. Esse bispo está em d4 (casa escura) — ele só vai pisar em casas escuras pelo resto do jogo. Por isso falamos 'bispo de casas claras' e 'bispo de casas escuras'.",
        board: bd({ d4: "wB", f1: "wB" }),
        highlightedPiece: parseSquare("d4"),
      },
      {
        type: "explain",
        titulo: "O Bispo não pula peças",
        texto: "Como a Torre, o Bispo também não pula. Ele para se houver uma peça no caminho. Se for inimiga, pode capturar.",
        board: bd({ d4: "wB", g7: "bP", b2: "wP" }),
        highlights: hl("c3","e5","f6","g7","a7","b6","c5","e3","f2","g1"),
        highlightedPiece: parseSquare("d4"),
      },
      {
        type: "practice",
        titulo: "Sua vez! Mova o Bispo",
        texto: "Clique no Bispo branco e mova-o para qualquer casa válida.",
        board: bd({ c1: "wB" }),
        objetivo: "any",
      },
      {
        type: "explain",
        titulo: "Dois bispos juntos: muito fortes!",
        texto: "Quando você ainda tem os DOIS bispos (um de cada cor), eles se complementam e podem alcançar TODAS as casas do tabuleiro. Por isso, em xadrez, falamos da 'vantagem dos dois bispos' — é uma vantagem real!",
      },
      {
        type: "quiz",
        titulo: "Vamos lá",
        pergunta: "Um bispo que está numa casa clara pode alcançar uma casa escura?",
        opcoes: ["Sim, sempre", "Não, nunca", "Só capturando"],
        correta: 1,
        explicacao: "Isso! Cada bispo é prisioneiro da sua cor. Esse é seu charme — e sua limitação.",
      },
      {
        type: "complete",
        titulo: "Aula 4 concluída! 🎉",
        texto: "Torre = linha reta. Bispo = diagonal. Próxima peça: o Cavalo, com seu movimento mais peculiar de todos!",
      },
    ]
  },

  // ═══════════════════════ AULA 5: O CAVALO ═══════════════════════
  {
    n: 5, titulo: "O Cavalo", subtitulo: "O salto especial",
    capitulo: "Fundamentos",
    slides: [
      {
        type: "intro",
        titulo: "Conheça o Cavalo",
        texto: "O Cavalo é a peça mais surpreendente. Ele se move em forma de 'L' — e é a ÚNICA peça que pula sobre outras! Pense num cavalo de verdade saltando uma cerca. Vale 3 pontos, igual ao bispo.",
        bigPiece: { type: "N", color: "w" },
      },
      {
        type: "explain",
        titulo: "O movimento em L",
        texto: "O Cavalo anda em formato de 'L': 2 casas em uma direção (horizontal ou vertical), depois 1 casa na perpendicular. Olhe todas as casas que ele alcança a partir do centro.",
        board: bd({ d4: "wN" }),
        highlights: hl("b3","b5","c2","c6","e2","e6","f3","f5"),
        highlightedPiece: parseSquare("d4"),
      },
      {
        type: "explain",
        titulo: "O cavalo PULA outras peças!",
        texto: "Aqui está o segredo do Cavalo: ele é o único que pula! Mesmo cercado de peças, ele consegue saltar para sua casa de destino. Veja: o Cavalo está cercado, mas ainda assim alcança 8 casas.",
        board: bd({
          d4: "wN",
          c3: "wP", c4: "wP", c5: "wP",
          d3: "wP", d5: "wP",
          e3: "wP", e4: "wP", e5: "wP",
        }),
        highlights: hl("b3","b5","c2","c6","e2","e6","f3","f5"),
        highlightedPiece: parseSquare("d4"),
      },
      {
        type: "explain",
        titulo: "Cavalo no canto: mais fraco",
        texto: "Quando o Cavalo está perto da borda, ele alcança MENOS casas. Olhe: do canto, ele só vai a 2 lugares. Por isso há um ditado no xadrez: 'cavalo na borda é cavalo fraco'.",
        board: bd({ a1: "wN" }),
        highlights: hl("b3","c2"),
        highlightedPiece: parseSquare("a1"),
      },
      {
        type: "explain",
        titulo: "Truque para lembrar o L",
        texto: "Pense assim: 'duas casas para um lado, uma casa virando'. Ou então: o cavalo sempre muda de COR de casa. Se está em casa clara, vai parar em casa escura — sempre.",
      },
      {
        type: "practice",
        titulo: "Sua vez! Mova o Cavalo",
        texto: "Clique no Cavalo e veja todas as casas em verde — todas em formato de L.",
        board: bd({ d4: "wN" }),
        objetivo: "any",
      },
      {
        type: "quiz",
        titulo: "Teste de cavalo",
        pergunta: "O Cavalo é a única peça que...",
        opcoes: ["Anda em diagonal", "Pula sobre outras peças", "Captura de lado"],
        correta: 1,
        explicacao: "Isso! Ninguém mais pula. É o ginasta do tabuleiro.",
      },
      {
        type: "complete",
        titulo: "Aula 5 concluída! 🎉",
        texto: "Você já conhece 5 peças: peão, torre, bispo, cavalo... só faltam as duas mais importantes! Próxima: a Dama, a peça mais poderosa do jogo.",
      },
    ]
  },
];
// Continuação de AULAS — aulas 6 a 15

const AULAS_6_15 = [
  // ═══════════════════════ AULA 6: A DAMA ═══════════════════════
  {
    n: 6, titulo: "A Dama", subtitulo: "A peça mais poderosa",
    capitulo: "As Peças",
    slides: [
      {
        type: "intro",
        titulo: "Conheça a Dama",
        texto: "A Dama é a peça mais forte do tabuleiro! Vale 9 pontos — quase tanto quanto duas torres. Ela combina os movimentos da Torre E do Bispo: anda em linhas retas E em diagonais, em qualquer direção, quantas casas quiser.",
        bigPiece: { type: "Q", color: "w" },
      },
      {
        type: "explain",
        titulo: "Olhe o poder da Dama",
        texto: "Do centro do tabuleiro, a Dama alcança 27 casas! Quase metade do tabuleiro. Por isso ela é a peça mais valiosa (depois do Rei, que é insubstituível).",
        board: bd({ d4: "wQ" }),
        highlights: hl(
          "d1","d2","d3","d5","d6","d7","d8",
          "a4","b4","c4","e4","f4","g4","h4",
          "a1","b2","c3","e5","f6","g7","h8",
          "a7","b6","c5","e3","f2","g1"
        ),
        highlightedPiece: parseSquare("d4"),
      },
      {
        type: "explain",
        titulo: "Cuidado com a Dama!",
        texto: "Justamente porque ela vale tanto, é um ERRO trazer a Dama para o jogo cedo demais. Se ela for atacada, você precisa correr com ela, e isso te faz perder tempo. A Dama gosta de entrar em jogo depois que as outras peças prepararam o terreno.",
      },
      {
        type: "practice",
        titulo: "Mova a Dama",
        texto: "Clique na Dama e veja todas as casas que ela alcança. Mova para onde quiser.",
        board: bd({ d1: "wQ" }),
        objetivo: "any",
      },
      {
        type: "quiz",
        titulo: "Teste",
        pergunta: "A Dama combina os movimentos de quais peças?",
        opcoes: ["Torre e Cavalo", "Torre e Bispo", "Bispo e Cavalo"],
        correta: 1,
        explicacao: "Isso! A Dama é Torre + Bispo. O movimento mais completo do jogo.",
      },
      {
        type: "complete",
        titulo: "Aula 6 concluída! 🎉",
        texto: "A Dama é poderosíssima. Mas tem alguém ainda mais importante no tabuleiro — não pelo poder, mas porque o jogo INTEIRO gira em torno dele. Próxima aula: o Rei.",
      },
    ]
  },

  // ═══════════════════════ AULA 7: O REI ═══════════════════════
  {
    n: 7, titulo: "O Rei", subtitulo: "O coração do jogo",
    capitulo: "As Peças",
    slides: [
      {
        type: "intro",
        titulo: "Conheça o Rei",
        texto: "O Rei é a peça MAIS IMPORTANTE — não pelo poder, mas porque proteger o Rei é o objetivo do jogo inteiro. Se o Rei for capturado (na verdade, se ficar sem como fugir), o jogo acaba. Por isso ele anda devagar, com cuidado.",
        bigPiece: { type: "K", color: "w" },
      },
      {
        type: "explain",
        titulo: "Como o Rei se move",
        texto: "O Rei anda apenas UMA casa de cada vez — em qualquer direção: frente, trás, lados, ou diagonal. Olhe: do centro, ele alcança 8 casas (uma de cada lado).",
        board: bd({ d4: "wK" }),
        highlights: hl("c3","c4","c5","d3","d5","e3","e4","e5"),
        highlightedPiece: parseSquare("d4"),
      },
      {
        type: "explain",
        titulo: "O Rei nunca pode ir para o ataque",
        texto: "Diferente das outras peças, o Rei NÃO PODE ir para uma casa onde seria capturado. Ele tem que ficar sempre seguro. Olhe: o Rei branco não pode ir para e5, porque a Torre preta atacaria ele lá.",
        board: bd({ d4: "wK", e8: "bR" }),
        highlights: hl("c3","c4","c5","d3","d5","f4"),
        highlightedPiece: parseSquare("d4"),
      },
      {
        type: "explain",
        titulo: "Quanto vale o Rei?",
        texto: "O Rei é tão importante que NÃO TEM VALOR EM PONTOS. Ele é insubstituível. Você nunca 'troca' o Rei por nada. Proteger o Rei é regra de ouro.",
      },
      {
        type: "quiz",
        titulo: "Teste",
        pergunta: "Quantas casas o Rei pode andar de cada vez?",
        opcoes: ["Uma casa", "Duas casas", "Quantas quiser"],
        correta: 0,
        explicacao: "Isso! Sempre uma casa. O Rei é cuidadoso.",
      },
      {
        type: "complete",
        titulo: "Aula 7 concluída! 🎉",
        texto: "Agora você conhece TODAS as 6 peças: peão, torre, bispo, cavalo, dama e rei. Na próxima aula vamos ver como elas começam a partida — a famosa posição inicial!",
      },
    ]
  },

  // ═══════════════════════ AULA 8: POSIÇÃO INICIAL ═══════════════════════
  {
    n: 8, titulo: "Posição Inicial", subtitulo: "Cada peça em seu lugar",
    capitulo: "As Peças",
    slides: [
      {
        type: "intro",
        titulo: "A montagem do tabuleiro",
        texto: "Toda partida de xadrez começa com as peças exatamente nestas posições. Vamos olhar com calma e entender por que cada peça fica onde fica.",
        board: startingBoard(),
      },
      {
        type: "explain",
        titulo: "Os peões na frente",
        texto: "Cada jogador tem 8 peões formando uma linha à frente. As brancas na fileira 2, as pretas na fileira 7. Os peões são como os soldados que entram em batalha primeiro.",
        board: startingBoard(),
        highlights: hl("a2","b2","c2","d2","e2","f2","g2","h2","a7","b7","c7","d7","e7","f7","g7","h7"),
      },
      {
        type: "explain",
        titulo: "As Torres nos cantos",
        texto: "As 4 torres ficam nos cantos do tabuleiro: as brancas em a1 e h1, as pretas em a8 e h8. É como se cada torre fosse o canto de um castelo.",
        board: startingBoard(),
        highlights: hl("a1","h1","a8","h8"),
      },
      {
        type: "explain",
        titulo: "Cavalos ao lado das torres",
        texto: "Os Cavalos ficam ao lado das Torres. Eles são os primeiros a saltar para o jogo, pulando os peões.",
        board: startingBoard(),
        highlights: hl("b1","g1","b8","g8"),
      },
      {
        type: "explain",
        titulo: "Bispos ao lado dos cavalos",
        texto: "Os Bispos ficam ao lado dos Cavalos. Cada bispo numa cor diferente — um em casa clara, outro em escura.",
        board: startingBoard(),
        highlights: hl("c1","f1","c8","f8"),
      },
      {
        type: "explain",
        titulo: "Dama na sua cor!",
        texto: "Truque para lembrar: a Dama BRANCA fica em casa BRANCA (d1). A Dama PRETA fica em casa PRETA (d8). 'Dama na sua cor' — fácil de lembrar.",
        board: startingBoard(),
        highlights: hl("d1","d8"),
      },
      {
        type: "explain",
        titulo: "Rei ao lado da Dama",
        texto: "O Rei fica ao lado da Dama, na casa que sobrou (e1 e e8). Note: a Dama fica na coluna 'd', o Rei na coluna 'e'.",
        board: startingBoard(),
        highlights: hl("e1","e8"),
      },
      {
        type: "explain",
        titulo: "Brancas começam!",
        texto: "Por convenção, sempre as brancas fazem a primeira jogada. Depois alternam: pretas, brancas, pretas, brancas... e assim por diante.",
        board: startingBoard(),
      },
      {
        type: "quiz",
        titulo: "Teste",
        pergunta: "Onde fica a Dama branca no início?",
        opcoes: ["Em e1 (casa preta)", "Em d1 (casa branca)", "Em c1"],
        correta: 1,
        explicacao: "Isso! Dama branca em casa branca (d1). Dama na sua cor.",
      },
      {
        type: "complete",
        titulo: "Aula 8 concluída! 🎉",
        texto: "Agora você sabe armar o tabuleiro inteirinho. Próxima aula: como capturar peças e dar troca!",
      },
    ]
  },

  // ═══════════════════════ AULA 9: CAPTURANDO ═══════════════════════
  {
    n: 9, titulo: "Capturando", subtitulo: "Como tirar peças do adversário",
    capitulo: "Básico",
    slides: [
      {
        type: "intro",
        titulo: "A captura no xadrez",
        texto: "Capturar significa tirar uma peça do adversário do tabuleiro. Para capturar, você simplesmente move sua peça para a casa onde está a peça inimiga. Ela sai, a sua entra. Simples assim.",
      },
      {
        type: "explain",
        titulo: "O valor das peças",
        texto: "Cada peça tem um valor em pontos. Lembrar dos valores ajuda a decidir se uma troca é boa ou ruim:\n\n• Peão = 1 ponto\n• Cavalo = 3 pontos\n• Bispo = 3 pontos\n• Torre = 5 pontos\n• Dama = 9 pontos\n• Rei = sem valor (não pode ser capturado)",
      },
      {
        type: "explain",
        titulo: "Trocas: boas e ruins",
        texto: "Se você captura uma peça que vale mais que a sua, é uma BOA TROCA. Se captura uma que vale menos, perdeu material. Por exemplo: capturar a Dama com um peão = ótimo! Capturar um peão com a Dama (e perder a dama no processo) = péssimo.",
      },
      {
        type: "practice",
        titulo: "Capture a Dama!",
        texto: "Tem uma Dama preta exposta. Use sua Torre para capturá-la — esta é a melhor jogada possível. Clique na Torre, depois na Dama.",
        board: bd({ a1: "wR", a8: "bQ", h8: "bK", e1: "wK" }),
        objetivo: { from: "a1", to: "a8" },
      },
      {
        type: "explain",
        titulo: "Cuidado: trocas em sequência",
        texto: "Às vezes a captura é só o começo de uma sequência de trocas. Antes de capturar, sempre pergunte: 'minha peça pode ser capturada de volta?'. Olhe sempre os dois lados antes de jogar.",
      },
      {
        type: "quiz",
        titulo: "Teste",
        pergunta: "Você pode capturar uma Dama (9) com um peão (1). Devo fazer essa troca?",
        opcoes: ["Sim, sempre!", "Não, vai perder material", "Depende do caso"],
        correta: 0,
        explicacao: "Sim! Trocar 1 ponto pelos 9 da Dama é um dos melhores lances que pode acontecer. Você ganhou 8 pontos de material!",
      },
      {
        type: "complete",
        titulo: "Aula 9 concluída! 🎉",
        texto: "Capturar é parte essencial do jogo. Sempre pense no valor antes de trocar! Próxima aula: o XEQUE, quando o Rei está em perigo!",
      },
    ]
  },

  // ═══════════════════════ AULA 10: XEQUE ═══════════════════════
  {
    n: 10, titulo: "Xeque", subtitulo: "Ameaçando o rei",
    capitulo: "Básico",
    slides: [
      {
        type: "intro",
        titulo: "O que é Xeque?",
        texto: "'Xeque' é quando uma peça AMEAÇA o Rei — ou seja, na próxima jogada poderia capturá-lo, se ele não fizer nada. Quando isso acontece, o jogador em xeque é OBRIGADO a se defender. Não pode ignorar.",
      },
      {
        type: "explain",
        titulo: "Exemplo de xeque",
        texto: "Olhe: a Torre branca em a8 está atacando o Rei preto em h8 pela 8ª fileira. O Rei está em XEQUE!",
        board: bd({ a8: "wR", h8: "bK", e1: "wK" }),
        arrows: [arrow("a8", "h8", C.rose)],
      },
      {
        type: "explain",
        titulo: "Três formas de defender o xeque",
        texto: "Quando seu Rei está em xeque, você tem 3 opções:\n\n1️⃣ MOVER o Rei para uma casa segura\n2️⃣ BLOQUEAR o ataque com outra peça no caminho\n3️⃣ CAPTURAR a peça que está dando xeque",
      },
      {
        type: "explain",
        titulo: "Defesa 1: mover o Rei",
        texto: "Aqui o Rei pode fugir do xeque indo para g7 ou h7 — sair da fileira 8 onde a Torre ataca.",
        board: bd({ a8: "wR", h8: "bK", e1: "wK" }),
        highlights: hl("g7","h7"),
        highlightedPiece: parseSquare("h8"),
      },
      {
        type: "explain",
        titulo: "Defesa 2: bloquear",
        texto: "Aqui as pretas podem bloquear o xeque colocando o Bispo em c8, entre a Torre branca e o Rei preto.",
        board: bd({ a8: "wR", h8: "bK", f5: "bB", e1: "wK" }),
        arrows: [arrow("f5", "c8", C.moss)],
      },
      {
        type: "explain",
        titulo: "Defesa 3: capturar a peça atacante",
        texto: "Se for possível, capturar a peça que dá xeque é ótimo! Aqui a Torre preta em a4 pode capturar a Torre branca atacante.",
        board: bd({ a8: "wR", h8: "bK", a4: "bR", e1: "wK" }),
        arrows: [arrow("a4", "a8", C.moss)],
      },
      {
        type: "explain",
        titulo: "Importante: você NÃO PODE deixar seu Rei em xeque",
        texto: "Aqui está uma regra crucial: você nunca pode fazer um lance que DEIXE seu próprio Rei em xeque. Se sua única peça defensora estiver protegendo o Rei, ela está 'cravada' — não pode sair.",
      },
      {
        type: "quiz",
        titulo: "Teste",
        pergunta: "Quando seu Rei está em xeque, o que você DEVE fazer?",
        opcoes: ["Defender de alguma forma — não dá pra ignorar", "Pode ignorar se quiser", "Tem que entregar a partida"],
        correta: 0,
        explicacao: "Exato! Xeque obriga uma reação. Mover, bloquear ou capturar.",
      },
      {
        type: "complete",
        titulo: "Aula 10 concluída! 🎉",
        texto: "Xeque é o aviso. Mas tem algo pior que xeque... o XEQUE-MATE! Próxima aula!",
      },
    ]
  },

  // ═══════════════════════ AULA 11: XEQUE-MATE ═══════════════════════
  {
    n: 11, titulo: "Xeque-mate", subtitulo: "O fim do jogo",
    capitulo: "Básico",
    slides: [
      {
        type: "intro",
        titulo: "Xeque-mate: a vitória",
        texto: "Xeque-mate acontece quando o Rei está em XEQUE e NÃO TEM nenhuma das 3 defesas: não pode mover, não pode bloquear, não pode capturar. Quando isso acontece, o jogo ACABOU. Quem deu o xeque-mate venceu.",
      },
      {
        type: "explain",
        titulo: "O famoso 'Mate do Pastor'",
        texto: "Este é um xeque-mate clássico em apenas 4 jogadas! A Dama branca em h5 dá xeque ao Rei preto em e8. O Rei não pode fugir, não pode bloquear (Bispo em c4 protege a Dama), e não pode capturar a Dama. Mate!",
        board: bd({
          e1: "wK", c4: "wB", h5: "wQ",
          e8: "bK", f8: "bB", g8: "bN", h8: "bR", a8: "bR", b8: "bN", c8: "bB", d8: "bQ",
          a7: "bP", b7: "bP", c7: "bP", d7: "bP", e7: "bP", g7: "bP", h7: "bP", f7: "bP",
        }),
        arrows: [arrow("h5", "f7", C.rose)],
      },
      {
        type: "explain",
        titulo: "Mate da Escada (com 2 torres)",
        texto: "Um mate fácil de entender: duas torres se alternando, expulsando o Rei até a borda do tabuleiro. Olhe: a Torre em a7 atira pela 7ª fileira, e a outra em h8 dá o mate na 8ª. O Rei não tem para onde fugir.",
        board: bd({
          a7: "wR", h8: "wR",
          e8: "bK",
          e1: "wK",
        }),
        arrows: [arrow("h8", "e8", C.rose)],
      },
      {
        type: "explain",
        titulo: "O que significa para o jogo",
        texto: "Se você der xeque-mate: VOCÊ VENCEU! Se receber xeque-mate: você perdeu. Não há reação possível ao mate — é o fim. Por isso todo o jogo é uma luta para tentar dar mate ou evitar receber mate.",
      },
      {
        type: "explain",
        titulo: "Cuidado: xeque ≠ xeque-mate",
        texto: "Iniciantes às vezes confundem. XEQUE é só um aviso — você defende e continua jogando. XEQUE-MATE é o fim. A diferença é se há saída ou não.",
      },
      {
        type: "quiz",
        titulo: "Teste",
        pergunta: "O xeque-mate acontece quando...",
        opcoes: ["O Rei está em xeque", "O Rei está em xeque e não pode escapar de jeito nenhum", "Você captura a Dama do adversário"],
        correta: 1,
        explicacao: "Isso! Xeque sem saída = xeque-mate. Fim da partida.",
      },
      {
        type: "complete",
        titulo: "Aula 11 concluída! 🎉",
        texto: "Você já sabe o objetivo do jogo: dar xeque-mate. Mas tem um lance especial que pode salvar seu Rei: o ROQUE! Próxima aula!",
      },
    ]
  },

  // ═══════════════════════ AULA 12: ROQUE ═══════════════════════
  {
    n: 12, titulo: "Roque", subtitulo: "Protegendo o rei",
    capitulo: "Básico",
    slides: [
      {
        type: "intro",
        titulo: "O Roque: lance especial!",
        texto: "O Roque é o ÚNICO lance no xadrez onde você move DUAS peças ao mesmo tempo: o Rei e uma Torre. Serve para colocar o Rei em segurança e ativar a Torre. É um dos lances mais úteis do jogo.",
      },
      {
        type: "explain",
        titulo: "Como fazer o Roque pequeno",
        texto: "Roque pequeno (lado do Rei): o Rei pula 2 casas para a direita, e a Torre da direita 'salta por cima' e fica do outro lado dele. Olhe a posição ANTES.",
        board: bd({ e1: "wK", h1: "wR" }),
      },
      {
        type: "explain",
        titulo: "Roque pequeno: depois",
        texto: "Agora veja o resultado: o Rei está em g1 e a Torre em f1. Duas peças se movimentaram em um único lance. O Rei agora está bem protegido no canto.",
        board: bd({ g1: "wK", f1: "wR" }),
      },
      {
        type: "explain",
        titulo: "Roque grande (do lado da Dama)",
        texto: "Também existe o Roque grande, do outro lado. O Rei vai 2 casas para a esquerda, e a Torre da esquerda salta para o outro lado dele. ANTES:",
        board: bd({ e1: "wK", a1: "wR" }),
      },
      {
        type: "explain",
        titulo: "Roque grande: depois",
        texto: "Resultado: Rei em c1, Torre em d1. É chamado 'grande' porque a Torre andou mais casas.",
        board: bd({ c1: "wK", d1: "wR" }),
      },
      {
        type: "explain",
        titulo: "Regras do Roque (importante!)",
        texto: "O Roque só pode ser feito SE:\n\n• O Rei e a Torre nunca se moveram\n• Não há peças entre o Rei e a Torre\n• O Rei não está em xeque\n• O Rei não passa por nenhuma casa atacada pelo adversário",
      },
      {
        type: "explain",
        titulo: "Quando fazer o Roque?",
        texto: "Em geral, o Roque deve ser feito CEDO — nas primeiras 10 jogadas. Quanto antes seu Rei estiver protegido, melhor. É um dos princípios mais importantes da abertura.",
      },
      {
        type: "quiz",
        titulo: "Teste",
        pergunta: "Por que fazer o Roque?",
        opcoes: ["Para atacar mais rápido", "Para colocar o Rei em segurança e ativar a Torre", "Só para mostrar que sabe"],
        correta: 1,
        explicacao: "Isso! Defesa do Rei + ativação da Torre. Dois benefícios em um lance.",
      },
      {
        type: "complete",
        titulo: "Aula 12 concluída! 🎉",
        texto: "Roque dominado! Próxima aula: empate, afogamento, e outras formas de o jogo terminar SEM vencedor.",
      },
    ]
  },

  // ═══════════════════════ AULA 13: EMPATE E AFOGAMENTO ═══════════════════════
  {
    n: 13, titulo: "Empate e Afogamento", subtitulo: "Quando ninguém vence",
    capitulo: "Intermediário",
    slides: [
      {
        type: "intro",
        titulo: "Nem todo jogo termina em vitória",
        texto: "No xadrez, nem sempre alguém ganha. Existem várias formas de o jogo terminar EMPATADO. Vou mostrar as mais comuns.",
      },
      {
        type: "explain",
        titulo: "Afogamento (Stalemate)",
        texto: "Acontece quando o jogador da vez NÃO está em xeque, MAS NÃO TEM NENHUM LANCE LEGAL para fazer. É empate! Olhe: pretas para jogar, mas o Rei preto não pode mover (todas casas atacadas) e não tem outras peças. Empate por afogamento.",
        board: bd({
          h8: "bK",
          f7: "wQ", h6: "wK",
        }),
      },
      {
        type: "explain",
        titulo: "Cuidado com o afogamento!",
        texto: "Iniciantes muitas vezes 'afogam' o adversário sem querer, achando que estão prestes a ganhar. Quando você tem MUITA vantagem, deixe SEMPRE o Rei adversário com pelo menos um lance disponível, para você poder dar o mate.",
      },
      {
        type: "explain",
        titulo: "Empate por acordo",
        texto: "Os dois jogadores podem simplesmente combinar de empatar. Isso acontece quando a posição está parecida e nenhum quer arriscar.",
      },
      {
        type: "explain",
        titulo: "Repetição de lances",
        texto: "Se a MESMA POSIÇÃO se repete 3 vezes na partida, é empate. Geralmente acontece quando os dois ficam dando o mesmo lance.",
      },
      {
        type: "explain",
        titulo: "Regra das 50 jogadas",
        texto: "Se passarem 50 jogadas sem nenhuma captura e sem peão se mover, é empate. Significa que ninguém está progredindo.",
      },
      {
        type: "explain",
        titulo: "Material insuficiente",
        texto: "Se ninguém tem peças suficientes para dar mate (por exemplo: só Rei contra Rei), é empate automático. Não dá para vencer mesmo querendo.",
      },
      {
        type: "quiz",
        titulo: "Teste",
        pergunta: "O que é afogamento?",
        opcoes: ["Quando o Rei é capturado", "Quando o jogador não está em xeque mas não tem lances legais — empate!", "Quando você fica sem peças"],
        correta: 1,
        explicacao: "Isso! Sem xeque, mas sem lances = empate por afogamento.",
      },
      {
        type: "complete",
        titulo: "Aula 13 concluída! 🎉",
        texto: "Você já sabe TODAS as regras do xadrez! Agora vamos para a parte estratégica. Próxima aula: princípios de abertura — como começar uma partida bem.",
      },
    ]
  },

  // ═══════════════════════ AULA 14: PRINCÍPIOS DE ABERTURA ═══════════════════════
  {
    n: 14, titulo: "Princípios de Abertura", subtitulo: "Os primeiros passos",
    capitulo: "Intermediário",
    slides: [
      {
        type: "intro",
        titulo: "Os primeiros lances importam muito",
        texto: "A abertura é a fase inicial da partida — geralmente os primeiros 10-15 lances. Se você fizer uma boa abertura, terá vantagem o jogo inteiro. Existem 3 princípios fundamentais.",
      },
      {
        type: "explain",
        titulo: "Princípio 1: Controle o CENTRO",
        texto: "As 4 casas centrais (e4, d4, e5, d5) são as mais importantes do tabuleiro. Quem controla o centro tem mais espaço e mobilidade. Sempre comece movendo um peão central!",
        board: bd({}),
        highlights: hl("e4","d4","e5","d5"),
      },
      {
        type: "explain",
        titulo: "Lance ideal de abertura",
        texto: "1. e4 (mover o peão de e2 para e4) é o lance mais popular do mundo. Ocupa o centro e abre caminho para o Bispo e a Dama saírem.",
        board: bd({ e4: "wP" }),
        highlightedPiece: parseSquare("e4"),
      },
      {
        type: "explain",
        titulo: "Princípio 2: DESENVOLVA suas peças",
        texto: "'Desenvolver' significa tirar Cavalos e Bispos da fileira inicial e colocá-los em casas ativas. Não fique só movendo peões. Tire cavalos primeiro, depois bispos.",
        board: bd({ e4: "wP", f3: "wN", c4: "wB" }),
      },
      {
        type: "explain",
        titulo: "Princípio 3: ROQUE cedo",
        texto: "Faça o Roque nos primeiros lances para colocar o Rei em segurança. Se você desenvolveu o Cavalo de g1 e o Bispo de f1, está pronto para rocar!",
        board: bd({ g1: "wK", f1: "wR" }),
      },
      {
        type: "explain",
        titulo: "O que NÃO fazer na abertura",
        texto: "Erros comuns:\n• Trazer a Dama cedo demais (vai ser perseguida)\n• Mover a mesma peça várias vezes (perde tempo)\n• Mover muitos peões (atrasa o desenvolvimento)\n• Esquecer do Rei (não rocar)",
      },
      {
        type: "explain",
        titulo: "Resumo: receita de abertura",
        texto: "1. Lance um peão central (1.e4 ou 1.d4)\n2. Desenvolva os cavalos\n3. Desenvolva os bispos\n4. Faça o roque\n5. Conecte as torres\n\nSe você fizer isso, sua abertura está ótima!",
      },
      {
        type: "quiz",
        titulo: "Teste",
        pergunta: "Qual é o melhor PRIMEIRO lance para uma abertura sólida?",
        opcoes: ["Mover um peão central (e4 ou d4)", "Trazer a Dama logo", "Mover a Torre"],
        correta: 0,
        explicacao: "Isso! Peão central primeiro — controla o centro e libera peças.",
      },
      {
        type: "complete",
        titulo: "Aula 14 concluída! 🎉",
        texto: "Você já joga melhor que muitos iniciantes! Próxima aula: TÁTICAS — truques que ganham material e partidas.",
      },
    ]
  },

  // ═══════════════════════ AULA 15: GARFO E CRAVADA ═══════════════════════
  {
    n: 15, titulo: "Garfo e Cravada", subtitulo: "Truques táticos",
    capitulo: "Intermediário",
    slides: [
      {
        type: "intro",
        titulo: "Táticas: ganhando material",
        texto: "Tática é uma combinação de lances que ganha material ou dá mate. Vou ensinar duas das táticas MAIS COMUNS: o Garfo e a Cravada. Você verá essas situações em quase toda partida.",
      },
      {
        type: "explain",
        titulo: "O Garfo (Fork)",
        texto: "Garfo é quando UMA peça sua ataca DUAS peças do adversário ao mesmo tempo. Ele só pode salvar uma — você captura a outra! O Cavalo é o rei do garfo.",
      },
      {
        type: "explain",
        titulo: "Garfo de Cavalo",
        texto: "Olhe: o Cavalo branco em e5 ataca a Dama preta em c6 E o Rei preto em g6 ao mesmo tempo. As pretas TÊM que mover o Rei (xeque), e perdem a Dama!",
        board: bd({ e5: "wN", c6: "bQ", g6: "bK", e1: "wK" }),
        arrows: [arrow("e5", "c6", C.rose), arrow("e5", "g6", C.rose)],
      },
      {
        type: "explain",
        titulo: "A Cravada (Pin)",
        texto: "Cravada é quando uma peça do adversário NÃO PODE SE MEXER porque atrás dela está uma peça mais valiosa. Se ela sair, a peça mais valiosa é capturada.",
      },
      {
        type: "explain",
        titulo: "Cravada absoluta (no Rei)",
        texto: "Olhe: o Bispo branco em a4 cravra o Cavalo preto em c6 contra o Rei em e8. Se o Cavalo se mover, o Rei fica em xeque! A peça preta não pode mexer — está CRAVADA. Você pode atacá-la sem dó.",
        board: bd({ a4: "wB", c6: "bN", e8: "bK", e1: "wK" }),
        arrows: [arrow("a4", "e8", C.rose)],
      },
      {
        type: "explain",
        titulo: "Como aproveitar a cravada",
        texto: "Quando você cravra uma peça, ataque ela de novo com outra peça! Como ela não pode fugir, você captura na próxima jogada. Cravar + atacar = ganhar a peça.",
      },
      {
        type: "explain",
        titulo: "Exercício: encontre o garfo!",
        texto: "Onde você poderia colocar um Cavalo para fazer um garfo no Rei e na Torre pretos? (Dica: pense em casas que atacam ambos)",
        board: bd({ e8: "bK", a8: "bR", e1: "wK", c5: "wN" }),
      },
      {
        type: "quiz",
        titulo: "Teste",
        pergunta: "O que é uma 'cravada'?",
        opcoes: ["Quando uma peça pode atacar várias", "Quando uma peça não pode mexer porque expõe uma peça mais valiosa", "Quando você dá xeque"],
        correta: 1,
        explicacao: "Isso! Cravada = peça presa porque atrás dela está alguém importante.",
      },
      {
        type: "complete",
        titulo: "Aula 15 concluída! 🎉",
        texto: "Garfo e cravada são duas das táticas mais comuns. Você vai usar essas armas a partida toda. Próxima aula: peões passados e a corrida de promoção!",
      },
    ]
  },
];
// Aulas 16 a 20

const AULAS_16_20 = [
  // ═══════════════════════ AULA 16: PEÃO PASSADO ═══════════════════════
  {
    n: 16, titulo: "Peão Passado", subtitulo: "Promovendo a peão",
    capitulo: "Intermediário",
    slides: [
      {
        type: "intro",
        titulo: "O peão pode virar Dama!",
        texto: "Lembra que falamos lá no início? Se um peão chegar até a última fileira, ele se transforma em outra peça — quase sempre em Dama. Esse é o sonho de todo peão. Hoje vamos ver como tornar esse sonho realidade.",
      },
      {
        type: "explain",
        titulo: "O que é um Peão Passado",
        texto: "Peão Passado é um peão que NÃO TEM mais nenhum peão adversário pela frente — nem na mesma coluna, nem nas colunas vizinhas — para impedir sua promoção. Ele tem caminho livre até virar Dama!",
        board: bd({ e5: "wP", a7: "bP", h7: "bP" }),
        highlightedPiece: parseSquare("e5"),
      },
      {
        type: "explain",
        titulo: "Por que o peão passado é forte",
        texto: "Um peão passado avançando força o adversário a usar peças VALIOSAS para detê-lo. Sua Torre tem que ficar atrás dele, sua Dama tem que vigiar... isso amarra peças importantes. Por isso peão passado vale muito mais que peão comum.",
      },
      {
        type: "explain",
        titulo: "Empurre o peão passado!",
        texto: "Tem um ditado: 'peões passados devem ser empurrados'. Quanto mais perto da promoção, mais forte ele fica. Se o adversário tiver que sacrificar uma peça pra parar, melhor pra você!",
      },
      {
        type: "explain",
        titulo: "A regra do quadrado (truque útil)",
        texto: "Como saber se o Rei adversário consegue alcançar seu peão passado? Imagine um quadrado entre o peão e a casa de promoção. Se o Rei adversário estiver DENTRO desse quadrado, ele alcança. Se estiver FORA, o peão promove!",
        board: bd({ b5: "wP", h6: "bK" }),
        highlights: hl("b5","b6","b7","b8","c8","d8","e8","f8","g8","h8","c7","d7","e7","f7","g7"),
      },
      {
        type: "practice",
        titulo: "Promova o peão!",
        texto: "Mova o peão branco até e8 para promover. Vai ser preciso 4 lances (clique e mova um por vez).",
        board: bd({ e4: "wP", h8: "bK", e1: "wK" }),
        objetivo: "promote",
      },
      {
        type: "quiz",
        titulo: "Teste",
        pergunta: "Quando o peão passa para a última fileira, ele vira:",
        opcoes: ["Outro peão", "Qualquer peça que você escolher (geralmente Dama)", "Volta para o início"],
        correta: 1,
        explicacao: "Isso! Promoção = qualquer peça (Dama, Torre, Bispo ou Cavalo). Quase sempre Dama.",
      },
      {
        type: "complete",
        titulo: "Aula 16 concluída! 🎉",
        texto: "Peão passado é uma força silenciosa. Próxima aula: finais — como ganhar quando o tabuleiro está vazio!",
      },
    ]
  },

  // ═══════════════════════ AULA 17: FINAL DE REI E DAMA ═══════════════════════
  {
    n: 17, titulo: "Final de Rei e Dama", subtitulo: "Acabando o jogo",
    capitulo: "Avançado",
    slides: [
      {
        type: "intro",
        titulo: "Você precisa SABER dar mate!",
        texto: "Já vai acontecer: você ganhou material, está com Rei + Dama contra Rei sozinho do adversário. Agora precisa dar o xeque-mate. Sem técnica, isso pode levar 50 jogadas! Com técnica, leva 10. Vou ensinar.",
      },
      {
        type: "explain",
        titulo: "A técnica: empurrar o Rei para a borda",
        texto: "Para dar mate com Dama, você precisa levar o Rei adversário até a BORDA do tabuleiro. Não consegue dar mate no centro. A Dama sozinha nunca dá mate — precisa do Rei dela ajudando.",
      },
      {
        type: "explain",
        titulo: "Passo 1: aproxime sua Dama",
        texto: "Comece colocando a Dama a UM PASSO DE CAVALO do Rei adversário (em forma de L). Veja: Dama em c3, Rei preto em e5. A Dama 'cerca' o Rei sem dar xeque, restringindo seus movimentos.",
        board: bd({ e5: "bK", c3: "wQ", e1: "wK" }),
      },
      {
        type: "explain",
        titulo: "Passo 2: persiga, mantendo a distância de Cavalo",
        texto: "Conforme o Rei foge, sua Dama o segue mantendo a distância de Cavalo. Aos poucos, ele é forçado para a borda. ATENÇÃO: nunca encurrale o Rei a ponto de afogá-lo (sem lances) — isso é empate!",
      },
      {
        type: "explain",
        titulo: "Passo 3: traga seu Rei para ajudar",
        texto: "Quando o Rei adversário estiver na borda, traga seu Rei para apoiar. Sua Dama sozinha não dá mate — o Rei precisa ficar perto.",
        board: bd({ a5: "bK", c3: "wQ", c5: "wK" }),
      },
      {
        type: "explain",
        titulo: "Passo 4: o mate!",
        texto: "Com seu Rei perto e o Rei adversário na borda, dê o mate. Olhe: o Rei branco em c6 cobre as casas de fuga, e a Dama em a3 dá o mate na borda!",
        board: bd({ a8: "bK", c6: "wK", a3: "wQ" }),
        arrows: [arrow("a3", "a8", C.rose)],
      },
      {
        type: "quiz",
        titulo: "Teste",
        pergunta: "Para dar mate de Rei + Dama contra Rei, você precisa:",
        opcoes: ["Capturar o Rei", "Empurrar o Rei adversário para a borda e usar sua Dama + Rei juntos", "Pegar mais peças"],
        correta: 1,
        explicacao: "Isso! Borda + Dama + Rei = mate.",
      },
      {
        type: "complete",
        titulo: "Aula 17 concluída! 🎉",
        texto: "Mate de Rei + Dama é fundamental! Próxima aula: o mate com Torre, um pouco mais difícil.",
      },
    ]
  },

  // ═══════════════════════ AULA 18: FINAL DE REI E TORRE ═══════════════════════
  {
    n: 18, titulo: "Final de Rei e Torre", subtitulo: "A técnica do mate",
    capitulo: "Avançado",
    slides: [
      {
        type: "intro",
        titulo: "Mate com Torre: técnica clássica",
        texto: "O mate com Rei + Torre contra Rei é mais difícil que com Dama, mas também é fundamental. Os dois Reis ficam frente a frente (com a Torre dando o mate). Vou mostrar a técnica.",
      },
      {
        type: "explain",
        titulo: "Os Reis em oposição",
        texto: "Conceito chave: 'oposição'. É quando os dois Reis ficam frente a frente, com UMA casa entre eles. O Rei que NÃO está na vez tem vantagem — chamamos isso 'ter a oposição'.",
        board: bd({ e3: "wK", e5: "bK" }),
      },
      {
        type: "explain",
        titulo: "Empurre o Rei para a borda",
        texto: "Como antes, leve o Rei adversário até uma borda. A Torre serve para 'cortar' o Rei — limitar suas casas de fuga. Aqui a Torre em h5 impede o Rei preto de descer.",
        board: bd({ e5: "bK", h5: "wR", e1: "wK" }),
      },
      {
        type: "explain",
        titulo: "A 'tesoura'",
        texto: "Use os dois Reis em oposição + a Torre dando xeque na borda. Esta é a posição final típica: Rei branco em e6 cobre, e a Torre em h8 dá o mate.",
        board: bd({ e8: "bK", e6: "wK", h8: "wR" }),
        arrows: [arrow("h8", "e8", C.rose)],
      },
      {
        type: "explain",
        titulo: "Cuidados",
        texto: "1) Não afogue o adversário (deixe sempre uma casa para o Rei se mexer ANTES do mate)\n2) Os Reis nunca podem ficar 'colados' — sempre uma casa entre eles\n3) A Torre dá o golpe final, não os Reis",
      },
      {
        type: "quiz",
        titulo: "Teste",
        pergunta: "Para dar mate de Rei + Torre, os dois Reis ficam:",
        opcoes: ["Bem longe um do outro", "Em oposição (frente a frente, uma casa entre)", "Colados"],
        correta: 1,
        explicacao: "Isso! Oposição é a chave do mate de Torre.",
      },
      {
        type: "complete",
        titulo: "Aula 18 concluída! 🎉",
        texto: "Você já consegue terminar partidas! Próxima aula: estratégia do meio-jogo — pensando à frente.",
      },
    ]
  },

  // ═══════════════════════ AULA 19: MEIO-JOGO ═══════════════════════
  {
    n: 19, titulo: "Estratégia de Meio-Jogo", subtitulo: "Pensando à frente",
    capitulo: "Avançado",
    slides: [
      {
        type: "intro",
        titulo: "O coração da partida",
        texto: "Depois da abertura (peças desenvolvidas, Rei rocado), começa o MEIO-JOGO. Aqui é onde os planos acontecem, peças manobram, ataques se preparam. Vou mostrar 5 conceitos importantes.",
      },
      {
        type: "explain",
        titulo: "1. Atividade das peças",
        texto: "Peças ATIVAS (com muitos lances disponíveis) são melhores que peças PASSIVAS (presas). Sempre prefira posicionar suas peças onde elas tenham máxima mobilidade. Cavalo no centro > cavalo no canto.",
      },
      {
        type: "explain",
        titulo: "2. Estrutura de peões",
        texto: "Os peões formam o 'esqueleto' da posição. Peões dobrados (na mesma coluna) ou isolados (sem peão amigo nas colunas vizinhas) são pontos fracos. Cuide bem dos seus peões — eles não voltam.",
      },
      {
        type: "explain",
        titulo: "3. Casas fracas",
        texto: "Uma 'casa fraca' é uma casa que seu adversário não consegue mais defender com peões. Coloque cavalos lá dentro — eles ficam imbatíveis. Procure casas fracas no campo do adversário.",
      },
      {
        type: "explain",
        titulo: "4. Colunas abertas para Torres",
        texto: "Torres adoram colunas SEM peões (chamadas 'abertas'). Coloque sua torre nelas e ela atira por toda a coluna. Duas torres dobradas na mesma coluna aberta = força tremenda.",
      },
      {
        type: "explain",
        titulo: "5. Ataque ao Rei",
        texto: "Se o adversário está com o Rei exposto, ATAQUE! Junte peças contra o Rei. Mas só ataque quando estiver melhor desenvolvido. Atacar sem peças prontas é suicídio.",
      },
      {
        type: "explain",
        titulo: "Resumo: como pensar no meio-jogo",
        texto: "A cada lance, pergunte:\n1. Meu Rei está seguro?\n2. Há alguma peça em perigo?\n3. Minhas peças estão ativas?\n4. Posso melhorar a peça pior?\n5. Há alguma tática (garfo, cravada)?\n\nResponda essas perguntas e seus lances vão melhorar muito.",
      },
      {
        type: "quiz",
        titulo: "Teste",
        pergunta: "No meio-jogo, qual peça é melhor: cavalo no centro ou cavalo no canto?",
        opcoes: ["No centro (mais ativo)", "No canto (mais protegido)", "Tanto faz"],
        correta: 0,
        explicacao: "Isso! Cavalo no centro alcança até 8 casas. No canto, só 2.",
      },
      {
        type: "complete",
        titulo: "Aula 19 concluída! 🎉",
        texto: "Última aula chegando! Vamos juntar tudo numa partida completa.",
      },
    ]
  },

  // ═══════════════════════ AULA 20: PRIMEIRA PARTIDA ═══════════════════════
  {
    n: 20, titulo: "Sua Primeira Partida", subtitulo: "Juntando tudo",
    capitulo: "Avançado",
    slides: [
      {
        type: "intro",
        titulo: "Você está pronta!",
        texto: "Em 19 aulas você aprendeu: o tabuleiro, todas as peças, capturas, xeque, mate, roque, empate, abertura, táticas, finais e estratégia. Agora vamos JOGAR uma partida juntas, comentada lance a lance, para você ver como tudo se conecta.",
      },
      {
        type: "explain",
        titulo: "Lance 1: 1.e4",
        texto: "As brancas começam com 1.e4 — ocupando o centro e abrindo caminho para Bispo e Dama. Lance clássico, recomendado para iniciantes.",
        board: bd({
          a1:"wR",b1:"wN",c1:"wB",d1:"wQ",e1:"wK",f1:"wB",g1:"wN",h1:"wR",
          a2:"wP",b2:"wP",c2:"wP",d2:"wP",e4:"wP",f2:"wP",g2:"wP",h2:"wP",
          a7:"bP",b7:"bP",c7:"bP",d7:"bP",e7:"bP",f7:"bP",g7:"bP",h7:"bP",
          a8:"bR",b8:"bN",c8:"bB",d8:"bQ",e8:"bK",f8:"bB",g8:"bN",h8:"bR",
        }),
        showLastMove: { from: parseSquare("e2"), to: parseSquare("e4") },
      },
      {
        type: "explain",
        titulo: "Lance 1...e5: pretas espelham",
        texto: "Pretas respondem 1...e5 — fazendo o mesmo, ocupando seu centro. Posição simétrica e equilibrada.",
        board: bd({
          a1:"wR",b1:"wN",c1:"wB",d1:"wQ",e1:"wK",f1:"wB",g1:"wN",h1:"wR",
          a2:"wP",b2:"wP",c2:"wP",d2:"wP",e4:"wP",f2:"wP",g2:"wP",h2:"wP",
          a7:"bP",b7:"bP",c7:"bP",d7:"bP",e5:"bP",f7:"bP",g7:"bP",h7:"bP",
          a8:"bR",b8:"bN",c8:"bB",d8:"bQ",e8:"bK",f8:"bB",g8:"bN",h8:"bR",
        }),
        showLastMove: { from: parseSquare("e7"), to: parseSquare("e5") },
      },
      {
        type: "explain",
        titulo: "Lance 2.Cf3: desenvolvendo cavalo",
        texto: "Brancas jogam 2.Cf3 — desenvolvem o cavalo E atacam o peão preto em e5. Princípio da abertura aplicado!",
        board: bd({
          a1:"wR",b1:"wN",c1:"wB",d1:"wQ",e1:"wK",f1:"wB",f3:"wN",h1:"wR",
          a2:"wP",b2:"wP",c2:"wP",d2:"wP",e4:"wP",f2:"wP",g2:"wP",h2:"wP",
          a7:"bP",b7:"bP",c7:"bP",d7:"bP",e5:"bP",f7:"bP",g7:"bP",h7:"bP",
          a8:"bR",b8:"bN",c8:"bB",d8:"bQ",e8:"bK",f8:"bB",g8:"bN",h8:"bR",
        }),
        showLastMove: { from: parseSquare("g1"), to: parseSquare("f3") },
        arrows: [arrow("f3", "e5", C.rose)],
      },
      {
        type: "explain",
        titulo: "2...Cc6: pretas defendem",
        texto: "Pretas defendem o peão jogando 2...Cc6 — desenvolvendo um cavalo E protegendo e5. Bom lance!",
        board: bd({
          a1:"wR",b1:"wN",c1:"wB",d1:"wQ",e1:"wK",f1:"wB",f3:"wN",h1:"wR",
          a2:"wP",b2:"wP",c2:"wP",d2:"wP",e4:"wP",f2:"wP",g2:"wP",h2:"wP",
          a7:"bP",b7:"bP",c7:"bP",d7:"bP",e5:"bP",f7:"bP",g7:"bP",h7:"bP",
          a8:"bR",c6:"bN",c8:"bB",d8:"bQ",e8:"bK",f8:"bB",g8:"bN",h8:"bR",
        }),
        showLastMove: { from: parseSquare("b8"), to: parseSquare("c6") },
      },
      {
        type: "explain",
        titulo: "3.Bc4: o Bispo Italiano",
        texto: "Brancas jogam 3.Bc4 — desenvolvem o bispo apontando para f7, ponto fraco preto. Esta abertura se chama 'Italiana' — uma das mais antigas e populares.",
        board: bd({
          a1:"wR",b1:"wN",c1:"wB",d1:"wQ",e1:"wK",c4:"wB",f3:"wN",h1:"wR",
          a2:"wP",b2:"wP",c2:"wP",d2:"wP",e4:"wP",f2:"wP",g2:"wP",h2:"wP",
          a7:"bP",b7:"bP",c7:"bP",d7:"bP",e5:"bP",f7:"bP",g7:"bP",h7:"bP",
          a8:"bR",c6:"bN",c8:"bB",d8:"bQ",e8:"bK",f8:"bB",g8:"bN",h8:"bR",
        }),
        showLastMove: { from: parseSquare("f1"), to: parseSquare("c4") },
        arrows: [arrow("c4", "f7", C.gold)],
      },
      {
        type: "explain",
        titulo: "Continuação: roque + meio-jogo",
        texto: "Em poucos lances, ambos os lados desenvolveriam mais peças e fariam o roque. Aí começa o meio-jogo, onde os planos estratégicos entram. Você já tem TODA a base para jogar isso!",
      },
      {
        type: "explain",
        titulo: "Dica final: jogue muito!",
        texto: "Xadrez se aprende JOGANDO. Aplicativos como Lichess.org (de graça!) e Chess.com permitem você jogar contra o computador no nível mais fácil. Comece pelos níveis bem baixos e suba devagar.",
      },
      {
        type: "explain",
        titulo: "Quando errar, sem culpa",
        texto: "Todo jogador, mesmo os campeões mundiais, perde partidas. O importante NÃO É vencer sempre, mas se divertir e ir aprendendo. Cada partida ensina algo. Seja paciente consigo mesma — você está construindo uma habilidade nova aos 72 anos. Isso é admirável!",
      },
      {
        type: "complete",
        titulo: "🏆 Curso concluído! 🏆",
        texto: "Você completou o curso inteiro! 20 aulas, do tabuleiro ao mate. Agora é só jogar com calma, sem pressa, e aproveitar este jogo lindíssimo de mais de 1.500 anos.\n\nUm beijo do Victor — espero que tenha gostado!",
      },
    ]
  },
];
// ───────────────────────── COMPONENTE: TELA INICIAL ─────────────────────────
function HomeScreen({ onStart, onContinue, hasProgress, completedCount, voice }) {
  useEffect(() => {
    voice.speak("Bem-vinda ao curso de xadrez! Toque em começar quando estiver pronta.");
    return () => voice.stop();
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.cream, position: "relative", overflow: "hidden" }}>
      {/* Textura decorativa */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle at 20% 30%, ${C.goldBright}15 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${C.moss}15 0%, transparent 50%)`,
        pointerEvents: "none",
      }}/>

      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "60px 32px",
        position: "relative", zIndex: 1,
        display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 60, alignItems: "center",
      }}>
        {/* Coluna texto */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div style={{
            fontSize: 14, letterSpacing: "0.3em", color: C.gold,
            fontFamily: "Crimson Text, serif", marginBottom: 12,
            textTransform: "uppercase",
          }}>
            ✦ Curso completo em 20 aulas ✦
          </div>
          <h1 style={{
            fontSize: 76, lineHeight: 0.95, color: C.ink,
            fontFamily: "Cormorant Garamond, serif", fontWeight: 600,
            marginBottom: 24, letterSpacing: "-0.02em",
          }}>
            Xadrez<br/>
            <span style={{ fontStyle: "italic", color: C.moss }}>com carinho</span>
          </h1>
          <p style={{
            fontSize: 22, lineHeight: 1.55, color: C.sepiaDeep,
            fontFamily: "Crimson Text, serif", marginBottom: 36,
            maxWidth: 480,
          }}>
            Um curso pensado com calma. Do tabuleiro ao xeque-mate, em 20 aulas curtas e visuais. Sem pressa, sem complicação.
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <BigButton variant="primary" onClick={onStart} icon={<Play size={22}/>}>
              Começar do início
            </BigButton>
            {hasProgress && (
              <BigButton variant="gold" onClick={onContinue} icon={<ChevronRight size={22}/>}>
                Continuar de onde parei
              </BigButton>
            )}
          </div>

          {hasProgress && (
            <div style={{
              marginTop: 32,
              fontSize: 16, color: C.sepia,
              fontFamily: "Crimson Text, serif",
              fontStyle: "italic",
            }}>
              ✓ Você já completou {completedCount} {completedCount === 1 ? "aula" : "aulas"}
            </div>
          )}
        </motion.div>

        {/* Coluna ilustração — mini tabuleiro decorativo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: -3 }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <div style={{ position: "relative" }}>
            <ChessBoard
              board={bd({ d4: "wQ", e5: "bK", h8: "bR", a1: "wK", c6: "wN", f3: "wB" })}
              size={400}
              interactive={false}
              showCoordinates={false}
              arrows={[arrow("c6", "e5", C.gold), arrow("c6", "d4", C.gold)]}
            />
            {/* Selo decorativo */}
            <div style={{
              position: "absolute", bottom: -20, right: -20,
              width: 100, height: 100, borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldBright})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 20px rgba(184,148,90,0.4)",
              transform: "rotate(15deg)",
              border: `3px solid ${C.cream}`,
            }}>
              <div style={{ textAlign: "center", color: C.ink, fontFamily: "Cormorant Garamond, serif" }}>
                <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>20</div>
                <div style={{ fontSize: 11, letterSpacing: "0.1em" }}>AULAS</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rodapé */}
      <div style={{
        position: "absolute", bottom: 24, left: 0, right: 0,
        textAlign: "center", color: C.sepia, fontSize: 13,
        fontFamily: "Crimson Text, serif", fontStyle: "italic",
        opacity: 0.7,
      }}>
        Feito com carinho pelo Victor • Para a melhor mãe do mundo
      </div>
    </div>
  );
}

// ───────────────────────── COMPONENTE: MAPA DE AULAS ─────────────────────────
function LessonMap({ aulas, progress, onSelectLesson, onHome }) {
  const capitulos = ["Fundamentos", "As Peças", "Básico", "Intermediário", "Avançado"];
  const aulasPorCapitulo = capitulos.map(cap => ({
    nome: cap,
    aulas: aulas.filter(a => a.capitulo === cap),
  }));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.cream, padding: "32px 32px 80px" }}>
      {/* Topbar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 40, maxWidth: 1100, margin: "0 auto 40px",
      }}>
        <button
          onClick={onHome}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
            color: C.sepia, fontSize: 16, fontFamily: "Crimson Text, serif",
          }}
        >
          <Home size={18}/> Início
        </button>
        <div style={{
          fontFamily: "Cormorant Garamond, serif", fontSize: 18, color: C.sepiaDeep,
          fontStyle: "italic",
        }}>
          {progress.completed.size} de {aulas.length} aulas concluídas
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{
          fontFamily: "Cormorant Garamond, serif", fontSize: 56, color: C.ink,
          marginBottom: 8, fontWeight: 600,
        }}>
          Suas <span style={{ fontStyle: "italic", color: C.moss }}>aulas</span>
        </h1>
        <p style={{ fontFamily: "Crimson Text, serif", fontSize: 18, color: C.sepia, marginBottom: 48 }}>
          Cada aula leva cerca de 30 minutos. Pode pausar e voltar quando quiser.
        </p>

        {aulasPorCapitulo.map((cap, ci) => (
          <div key={cap.nome} style={{ marginBottom: 48 }}>
            <div style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: 14, letterSpacing: "0.3em",
              color: C.gold, textTransform: "uppercase",
              marginBottom: 16, fontWeight: 600,
            }}>
              ✦ {cap.nome} ✦
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 20,
            }}>
              {cap.aulas.map(aula => {
                const completed = progress.isComplete(aula.n);
                const unlocked = progress.isUnlocked(aula.n);
                return (
                  <motion.div
                    key={aula.n}
                    whileHover={unlocked ? { y: -4, boxShadow: "0 12px 30px rgba(44,31,15,0.15)" } : {}}
                    onClick={() => unlocked && onSelectLesson(aula.n)}
                    style={{
                      backgroundColor: completed ? C.creamDark : C.parchment,
                      border: `2px solid ${completed ? C.moss : (unlocked ? C.sepia : C.creamDark)}`,
                      borderRadius: 16,
                      padding: 24,
                      cursor: unlocked ? "pointer" : "not-allowed",
                      opacity: unlocked ? 1 : 0.55,
                      position: "relative",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                      marginBottom: 8,
                    }}>
                      <div style={{
                        fontFamily: "Cormorant Garamond, serif", fontSize: 14,
                        color: C.gold, letterSpacing: "0.15em",
                      }}>
                        AULA {String(aula.n).padStart(2, "0")}
                      </div>
                      {completed && (
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%",
                          backgroundColor: C.moss, display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Check size={16} color={C.cream} strokeWidth={3}/>
                        </div>
                      )}
                      {!unlocked && (
                        <Lock size={20} color={C.sepia}/>
                      )}
                    </div>
                    <h3 style={{
                      fontFamily: "Cormorant Garamond, serif", fontSize: 24,
                      color: C.ink, fontWeight: 600, marginBottom: 4,
                    }}>
                      {aula.titulo}
                    </h3>
                    <p style={{
                      fontFamily: "Crimson Text, serif", fontSize: 15,
                      color: C.sepia, fontStyle: "italic",
                    }}>
                      {aula.subtitulo}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// ───────────────────────── COMPONENTE: PLAYER DE AULA ─────────────────────────
function LessonPlayer({ aula, onComplete, onExit, voice }) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState({});
  const [practiceCompleted, setPracticeCompleted] = useState({});
  const slide = aula.slides[slideIdx];
  const isLast = slideIdx === aula.slides.length - 1;

  // Auto-fala o texto principal ao entrar no slide
  useEffect(() => {
    if (slide.texto && voice.enabled) {
      voice.speak(slide.texto);
    }
    return () => voice.stop();
  }, [slideIdx]);

  const goNext = () => {
    if (slideIdx < aula.slides.length - 1) {
      setSlideIdx(slideIdx + 1);
    } else {
      onComplete();
    }
  };
  const goPrev = () => slideIdx > 0 && setSlideIdx(slideIdx - 1);

  const canAdvance = () => {
    if (slide.type === "quiz") return quizAnswered[slideIdx] === true;
    if (slide.type === "practice") return practiceCompleted[slideIdx] === true;
    return true;
  };

  const progress = ((slideIdx + 1) / aula.slides.length) * 100;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.cream, display: "flex", flexDirection: "column" }}>
      {/* Topbar */}
      <div style={{
        backgroundColor: C.parchment, borderBottom: `1px solid ${C.creamDark}`,
        padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button onClick={onExit} style={{
          background: "transparent", border: "none", cursor: "pointer",
          color: C.sepia, fontSize: 15, fontFamily: "Crimson Text, serif",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <ChevronLeft size={18}/> Sair da aula
        </button>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{
            fontFamily: "Cormorant Garamond, serif", fontSize: 13,
            color: C.gold, letterSpacing: "0.2em",
          }}>
            AULA {aula.n} · {aula.capitulo.toUpperCase()}
          </div>
          <div style={{
            fontFamily: "Cormorant Garamond, serif", fontSize: 22,
            color: C.ink, fontWeight: 600,
          }}>
            {aula.titulo}
          </div>
        </div>
        <button
          onClick={() => voice.setEnabled(!voice.enabled)}
          style={{
            background: voice.enabled ? C.moss : "transparent",
            color: voice.enabled ? C.cream : C.sepia,
            border: `2px solid ${voice.enabled ? C.moss : C.sepia}`,
            borderRadius: 24, padding: "8px 16px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            fontFamily: "Crimson Text, serif", fontSize: 14,
          }}
        >
          {voice.enabled ? <Volume2 size={16}/> : <VolumeX size={16}/>}
          {voice.enabled ? "Voz ligada" : "Voz desligada"}
        </button>
      </div>

      {/* Barra de progresso */}
      <div style={{ height: 4, backgroundColor: C.creamDark, position: "relative" }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            background: `linear-gradient(90deg, ${C.moss}, ${C.gold})`,
          }}
        />
      </div>

      {/* Slide */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 40,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            style={{
              maxWidth: 1100, width: "100%",
              display: "grid",
              gridTemplateColumns: slide.board ? "1fr 1fr" : "1fr",
              gap: 48, alignItems: "center",
            }}
          >
            {/* Coluna texto */}
            <div>
              {slide.type === "intro" && (
                <div style={{
                  fontSize: 14, letterSpacing: "0.3em", color: C.gold,
                  fontFamily: "Crimson Text, serif", marginBottom: 12,
                  textTransform: "uppercase",
                }}>
                  ✦ Início da aula
                </div>
              )}
              {slide.type === "complete" && (
                <div style={{
                  fontSize: 14, letterSpacing: "0.3em", color: C.moss,
                  fontFamily: "Crimson Text, serif", marginBottom: 12,
                  textTransform: "uppercase",
                }}>
                  ✦ Aula concluída
                </div>
              )}
              <h2 style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: 44, color: C.ink, lineHeight: 1.1,
                marginBottom: 20, fontWeight: 600,
              }}>
                {slide.titulo}
              </h2>

              {slide.bigPiece && (
                <div style={{
                  display: "inline-flex", marginBottom: 24,
                  padding: 24, backgroundColor: C.parchment,
                  borderRadius: 16, border: `2px solid ${C.gold}`,
                }}>
                  <PieceSvg type={slide.bigPiece.type} color={slide.bigPiece.color} size={120}/>
                </div>
              )}

              {slide.texto && (
                <p style={{
                  fontFamily: "Crimson Text, serif",
                  fontSize: 22, lineHeight: 1.6, color: C.sepiaDeep,
                  whiteSpace: "pre-wrap",
                }}>
                  {slide.texto}
                </p>
              )}

              {/* Quiz */}
              {slide.type === "quiz" && (
                <QuizBlock
                  pergunta={slide.pergunta}
                  opcoes={slide.opcoes}
                  correta={slide.correta}
                  explicacao={slide.explicacao}
                  answered={quizAnswered[slideIdx]}
                  onAnswer={(correct) => {
                    if (correct) setQuizAnswered({ ...quizAnswered, [slideIdx]: true });
                  }}
                  voice={voice}
                />
              )}

              {/* Botão "ouvir de novo" */}
              {voice.enabled && slide.texto && (
                <button
                  onClick={() => voice.speak(slide.texto)}
                  style={{
                    marginTop: 24, background: "transparent",
                    border: `1px solid ${C.sepia}`, borderRadius: 24,
                    padding: "8px 20px", cursor: "pointer",
                    color: C.sepia, fontSize: 14, fontFamily: "Crimson Text, serif",
                    display: "inline-flex", alignItems: "center", gap: 8,
                  }}
                >
                  <Volume2 size={14}/> Ouvir explicação de novo
                </button>
              )}
            </div>

            {/* Coluna tabuleiro (se houver) */}
            {slide.board && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <PracticeBoard
                  slide={slide}
                  slideIdx={slideIdx}
                  onComplete={() => setPracticeCompleted({ ...practiceCompleted, [slideIdx]: true })}
                  completed={practiceCompleted[slideIdx]}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controles inferior */}
      <div style={{
        backgroundColor: C.parchment, borderTop: `1px solid ${C.creamDark}`,
        padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <button
          onClick={goPrev}
          disabled={slideIdx === 0}
          style={{
            background: "transparent", border: `2px solid ${C.sepia}`,
            borderRadius: 12, padding: "12px 24px",
            cursor: slideIdx === 0 ? "not-allowed" : "pointer",
            color: C.sepia, fontSize: 16, fontFamily: "Crimson Text, serif",
            opacity: slideIdx === 0 ? 0.4 : 1,
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <ChevronLeft size={18}/> Anterior
        </button>

        <div style={{
          fontFamily: "Crimson Text, serif", color: C.sepia, fontSize: 14,
        }}>
          {slideIdx + 1} de {aula.slides.length}
        </div>

        <BigButton
          onClick={goNext}
          disabled={!canAdvance()}
          variant={isLast ? "gold" : "primary"}
          icon={isLast ? <Award size={20}/> : <ChevronRight size={20}/>}
        >
          {isLast ? "Concluir aula" : "Próximo"}
        </BigButton>
      </div>
    </div>
  );
}

// ───────────────────────── QUIZ ─────────────────────────
function QuizBlock({ pergunta, opcoes, correta, explicacao, answered, onAnswer, voice }) {
  const [selected, setSelected] = useState(null);

  function handleClick(i) {
    if (answered) return;
    setSelected(i);
    const isCorrect = i === correta;
    if (isCorrect) {
      voice.speak(explicacao);
    } else {
      voice.speak("Quase! Tente novamente.");
    }
    onAnswer(isCorrect);
  }

  return (
    <div style={{
      marginTop: 24, padding: 24,
      backgroundColor: C.parchment, borderRadius: 16,
      border: `2px solid ${C.gold}`,
    }}>
      <div style={{
        fontFamily: "Cormorant Garamond, serif", fontSize: 20,
        color: C.ink, marginBottom: 16, fontWeight: 600,
      }}>
        {pergunta}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {opcoes.map((op, i) => {
          const isSelected = selected === i;
          const showResult = isSelected && answered !== undefined;
          const isCorrect = i === correta;
          return (
            <motion.button
              key={i}
              onClick={() => handleClick(i)}
              whileHover={!answered ? { x: 6 } : {}}
              style={{
                padding: "14px 20px", borderRadius: 12,
                border: `2px solid ${
                  showResult ? (isCorrect ? C.moss : C.rose) :
                  (selected === i ? C.gold : C.creamDark)
                }`,
                backgroundColor: showResult ? (isCorrect ? `${C.moss}20` : `${C.rose}20`) : C.cream,
                color: C.sepiaDeep, fontSize: 16,
                fontFamily: "Crimson Text, serif",
                cursor: answered ? "default" : "pointer",
                textAlign: "left",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <span>{op}</span>
              {showResult && isCorrect && <Check size={18} color={C.moss}/>}
            </motion.button>
          );
        })}
      </div>
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 16, padding: 14,
            backgroundColor: `${C.moss}15`, borderRadius: 10,
            fontFamily: "Crimson Text, serif", fontSize: 15,
            color: C.sepiaDeep, fontStyle: "italic",
          }}
        >
          ✓ {explicacao}
        </motion.div>
      )}
    </div>
  );
}

// ───────────────────────── TABULEIRO DE PRÁTICA/EXPLICAÇÃO ─────────────────────────
function PracticeBoard({ slide, slideIdx, onComplete, completed }) {
  const [board, setBoard] = useState(slide.board);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setBoard(slide.board);
    setFeedback(null);
  }, [slideIdx]);

  function handleMove({ from, to, piece }) {
    if (slide.type !== "practice") {
      // Lição explicativa: só permite ver movimentos, não muda o estado
      const newBoard = board.map(row => [...row]);
      newBoard[to[0]][to[1]] = piece;
      newBoard[from[0]][from[1]] = null;
      setBoard(newBoard);
      return;
    }

    // Prática: verifica objetivo
    const newBoard = board.map(row => [...row]);
    newBoard[to[0]][to[1]] = piece;
    newBoard[from[0]][from[1]] = null;
    setBoard(newBoard);

    if (slide.objetivo === "any") {
      setFeedback({ type: "success", text: "Muito bem! Você moveu a peça!" });
      onComplete();
      return;
    }
    if (slide.objetivo === "promote") {
      if (to[0] === 0 && piece.type === "P") {
        // Promove
        newBoard[to[0]][to[1]] = { type: "Q", color: "w" };
        setBoard(newBoard);
        setFeedback({ type: "success", text: "🎉 Promoção! Seu peão virou Dama!" });
        onComplete();
      } else if (piece.type === "P") {
        setFeedback({ type: "info", text: "Continue empurrando o peão para frente..." });
      }
      return;
    }

    const target = slide.objetivo;
    const [tFromR, tFromC] = parseSquare(target.from);
    const [tToR, tToC] = parseSquare(target.to);
    if (from[0] === tFromR && from[1] === tFromC && to[0] === tToR && to[1] === tToC) {
      setFeedback({ type: "success", text: "✓ Perfeito! Lance correto!" });
      onComplete();
    } else {
      setFeedback({ type: "error", text: "Quase! Tente outra casa. Dica: o objetivo está marcado em verde." });
    }
  }

  function reset() {
    setBoard(slide.board);
    setFeedback(null);
  }

  // Se for objetivo específico, marca a casa de destino em verde como dica
  let extraHighlights = slide.highlights || [];
  if (slide.type === "practice" && slide.objetivo && typeof slide.objetivo === "object" && !completed) {
    extraHighlights = [...extraHighlights, parseSquare(slide.objetivo.to)];
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <ChessBoard
        board={board}
        onMove={handleMove}
        highlights={extraHighlights}
        arrows={slide.arrows || []}
        showCoordinates={slide.showCoordinates !== false}
        size={440}
        interactive={true}
        highlightedPiece={slide.highlightedPiece}
        showLastMove={slide.showLastMove}
      />

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            padding: "12px 20px", borderRadius: 12,
            backgroundColor: feedback.type === "success" ? `${C.moss}25`
                         : feedback.type === "error" ? `${C.rose}25` : `${C.gold}25`,
            border: `2px solid ${feedback.type === "success" ? C.moss
                              : feedback.type === "error" ? C.rose : C.gold}`,
            fontFamily: "Crimson Text, serif", fontSize: 16,
            color: C.sepiaDeep, textAlign: "center", maxWidth: 400,
          }}
        >
          {feedback.text}
        </motion.div>
      )}

      {slide.type === "practice" && (
        <button
          onClick={reset}
          style={{
            background: "transparent", border: `1px solid ${C.sepia}`,
            borderRadius: 20, padding: "6px 16px", cursor: "pointer",
            color: C.sepia, fontSize: 13, fontFamily: "Crimson Text, serif",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <RotateCcw size={14}/> Recomeçar
        </button>
      )}
    </div>
  );
}

// ───────────────────────── APP PRINCIPAL ─────────────────────────
const TODAS_AULAS = [...AULAS, ...AULAS_6_15, ...AULAS_16_20];

export default function App() {
  const [screen, setScreen] = useState("home"); // home | map | lesson
  const [currentLesson, setCurrentLesson] = useState(null);
  const progress = useProgress();
  const voice = useVoice();

  // Carrega vozes do navegador (algumas só ficam disponíveis depois de um event)
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {};
      window.speechSynthesis.getVoices();
    }
  }, []);

  function startCourse() {
    const firstUncompleted = TODAS_AULAS.find(a => !progress.isComplete(a.n)) || TODAS_AULAS[0];
    setCurrentLesson(firstUncompleted.n);
    setScreen("lesson");
  }
  function continueCourse() {
    const firstUncompleted = TODAS_AULAS.find(a => !progress.isComplete(a.n)) || TODAS_AULAS[TODAS_AULAS.length - 1];
    setCurrentLesson(firstUncompleted.n);
    setScreen("lesson");
  }
  function selectLesson(n) {
    setCurrentLesson(n);
    setScreen("lesson");
  }
  function completeLesson() {
    progress.markComplete(currentLesson);
    voice.stop();
    setScreen("map");
  }

  // Carrega google fonts uma vez
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("xc-fonts")) return;
    const link = document.createElement("link");
    link.id = "xc-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&display=swap";
    document.head.appendChild(link);
  }, []);

  if (screen === "home") {
    return (
      <HomeScreen
        onStart={startCourse}
        onContinue={continueCourse}
        hasProgress={progress.completed.size > 0}
        completedCount={progress.completed.size}
        voice={voice}
      />
    );
  }
  if (screen === "map") {
    return (
      <LessonMap
        aulas={TODAS_AULAS}
        progress={progress}
        onSelectLesson={selectLesson}
        onHome={() => setScreen("home")}
      />
    );
  }
  if (screen === "lesson") {
    const aula = TODAS_AULAS.find(a => a.n === currentLesson);
    if (!aula) return null;
    return (
      <LessonPlayer
        aula={aula}
        onComplete={completeLesson}
        onExit={() => { voice.stop(); setScreen("map"); }}
        voice={voice}
      />
    );
  }
  return null;
}
