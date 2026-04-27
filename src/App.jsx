import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Volume2, VolumeX, RotateCcw, Check, Home, Award, Play, Pause, SkipBack, SkipForward, Menu, X, BookOpen, ExternalLink } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   PROFESSOR DE XADREZ — 30 aulas, responsivo iPhone, progresso permanente
   ═══════════════════════════════════════════════════════════════════════════ */

// ───────────────────────── DESIGN TOKENS ─────────────────────────
const C = {
  cream: "#F5EFE0",
  creamDark: "#EBE3CE",
  parchment: "#FAF6EA",
  sepia: "#8B6F47",
  sepiaDeep: "#5C4A33",
  ink: "#2C1F0F",
  moss: "#5C7548",
  mossLight: "#8FA876",
  gold: "#B8945A",
  goldBright: "#D4AF6B",
  rose: "#A8625C",
  sky: "#6B8CA8",
  lightSquare: "#F0E4C8",
  darkSquare: "#A88A5C",
  validMove: "rgba(92,117,72,0.45)",
  selectedSquare: "rgba(184,148,90,0.65)",
  captureSquare: "rgba(168,98,92,0.55)",
  hintSquare: "rgba(212,175,107,0.5)",
};

// ───────────────────────── HOOK RESPONSIVO ─────────────────────────
function useViewport() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    if (typeof window === "undefined") return;
    function onResize() { setW(window.innerWidth); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return { w, isMobile: w < 760, isTablet: w >= 760 && w < 1024, isDesktop: w >= 1024 };
}

// ───────────────────────── PEÇAS SVG (mantidas idênticas — boas) ─────────────────────────
function PieceSvg({ type, color, size = 64 }) {
  const fill = color === "w" ? "#FAF6EA" : "#2C1F0F";
  const stroke = color === "w" ? "#2C1F0F" : "#B8945A";
  const sw = 2.5;
  const paths = {
    K: ( <g>
      <path d={`M 22.5 11.63 V 6 M 20 8 H 25`} stroke={stroke} strokeWidth={sw} strokeLinejoin="miter"/>
      <path d={`M 22.5 25 C 22.5 25 27 17.5 25.5 14.5 C 25.5 14.5 24.5 12 22.5 12 C 20.5 12 19.5 14.5 19.5 14.5 C 18 17.5 22.5 25 22.5 25`} fill={fill} stroke={stroke} strokeWidth={sw}/>
      <path d={`M 11.5 37 C 17 40.5 27 40.5 32.5 37 L 32.5 30 C 32.5 30 41.5 25.5 38.5 19.5 C 34.5 13 25 16 22.5 23.5 L 22.5 27 L 22.5 23.5 C 19 16 9.5 13 6.5 19.5 C 3.5 25.5 11.5 29.5 11.5 29.5 Z`} fill={fill} stroke={stroke} strokeWidth={sw}/>
      <path d={`M 11.5 30 C 17 27 27 27 32.5 30`} fill="none" stroke={stroke} strokeWidth={sw}/>
      <path d={`M 11.5 33.5 C 17 30.5 27 30.5 32.5 33.5`} fill="none" stroke={stroke} strokeWidth={sw}/>
      <path d={`M 11.5 37 C 17 34 27 34 32.5 37`} fill="none" stroke={stroke} strokeWidth={sw}/>
    </g>),
    Q: ( <g>
      <path d={`M 9 26 C 17.5 24.5 30 24.5 36 26 L 38.5 13.5 L 31 25 L 30.7 10.9 L 25.5 24.5 L 22.5 10 L 19.5 24.5 L 14.3 10.9 L 14 25 L 6.5 13.5 L 9 26 Z`} fill={fill} stroke={stroke} strokeWidth={sw}/>
      <path d={`M 9 26 C 9 28 10.5 28 11.5 30 C 12.5 31.5 12.5 31 12 33.5 C 10.5 34.5 11 36 11 36 C 9.5 37.5 11 38.5 11 38.5 C 17.5 39.5 27.5 39.5 34 38.5 C 34 38.5 35.5 37.5 34 36 C 34 36 34.5 34.5 33 33.5 C 32.5 31 32.5 31.5 33.5 30 C 34.5 28 36 28 36 26 C 27.5 24.5 17.5 24.5 9 26 Z`} fill={fill} stroke={stroke} strokeWidth={sw}/>
      <circle cx="6" cy="12" r="2" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <circle cx="14" cy="9" r="2" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <circle cx="22.5" cy="8" r="2" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <circle cx="31" cy="9" r="2" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <circle cx="39" cy="12" r="2" fill={fill} stroke={stroke} strokeWidth={sw}/>
    </g>),
    R: ( <g>
      <path d={`M 9 39 L 36 39 L 36 36 L 9 36 Z`} fill={fill} stroke={stroke} strokeWidth={sw}/>
      <path d={`M 12.5 32 L 14 29.5 L 31 29.5 L 32.5 32 Z`} fill={fill} stroke={stroke} strokeWidth={sw}/>
      <path d={`M 12 36 L 12 32 L 33 32 L 33 36 Z`} fill={fill} stroke={stroke} strokeWidth={sw}/>
      <path d={`M 14 29.5 L 14 16.5 L 31 16.5 L 31 29.5 Z`} fill={fill} stroke={stroke} strokeWidth={sw}/>
      <path d={`M 14 16.5 L 11 14 L 11 9 L 15 9 L 15 11 L 20 11 L 20 9 L 25 9 L 25 11 L 30 11 L 30 9 L 34 9 L 34 14 L 31 16.5 Z`} fill={fill} stroke={stroke} strokeWidth={sw}/>
    </g>),
    B: ( <g>
      <g fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="butt">
        <path d={`M 9 36 C 12.39 35.03 19.11 36.43 22.5 34 C 25.89 36.43 32.61 35.03 36 36 C 36 36 37.65 36.54 39 38 C 38.32 38.97 37.35 38.99 36 38.5 C 32.61 37.53 25.89 38.96 22.5 37.5 C 19.11 38.96 12.39 37.53 9 38.5 C 7.65 38.99 6.68 38.97 6 38 C 7.35 36.54 9 36 9 36 Z`}/>
        <path d={`M 15 32 C 17.5 34.5 27.5 34.5 30 32 C 30.5 30.5 30 30 30 30 C 30 27.5 27.5 26 27.5 26 C 33 24.5 33.5 14.5 22.5 10.5 C 11.5 14.5 12 24.5 17.5 26 C 17.5 26 15 27.5 15 30 C 15 30 14.5 30.5 15 32 Z`}/>
        <path d={`M 25 8 A 2.5 2.5 0 1 1 20 8 A 2.5 2.5 0 1 1 25 8 Z`}/>
      </g>
      <path d={`M 17.5 26 L 27.5 26 M 15 30 L 30 30 M 22.5 15.5 L 22.5 20.5 M 20 18 L 25 18`} fill="none" stroke={stroke} strokeWidth={sw} strokeLinejoin="miter"/>
    </g>),
    N: ( <g fill={fill} stroke={stroke} strokeWidth={sw}>
      <path d={`M 22 10 C 32.5 11 38.5 18 38 39 L 15 39 C 15 30 25 32.5 23 18`}/>
      <path d={`M 24 18 C 24.38 20.91 18.45 25.37 16 27 C 13 29 13.18 31.34 11 31 C 9.958 30.06 12.41 27.96 11 28 C 10 28 11.19 29.23 10 30 C 9 30 5.997 31 6 26 C 6 24 12 14 12 14 C 12 14 13.89 12.1 14 10.5 C 13.27 9.506 13.5 8.5 13.5 7.5 C 14.5 5.5 16.5 4.5 16.5 4.5 L 18 8 C 18 8 20.5 5 22 5 C 22 5 24 6 23 8 C 22 9 22 9 22 9`}/>
      <path d={`M 9.5 25.5 A 0.5 0.5 0 1 1 8.5 25.5 A 0.5 0.5 0 1 1 9.5 25.5 Z`} fill={stroke}/>
      <path d={`M 14.5 15.5 A 0.5 1.5 0 1 1 13.5 15.5 A 0.5 1.5 0 1 1 14.5 15.5 Z`} fill={stroke} transform="matrix(0.866 0.5 -0.5 0.866 9.693 -5.173)"/>
    </g>),
    P: ( <path d={`M 22.5 9 C 20.29 9 18.5 10.79 18.5 13 C 18.5 13.89 18.79 14.71 19.28 15.38 C 17.33 16.5 16 18.59 16 21 C 16 23.03 16.94 24.84 18.41 26.03 C 15.41 27.09 11 31.58 11 39.5 L 34 39.5 C 34 31.58 29.59 27.09 26.59 26.03 C 28.06 24.84 29 23.03 29 21 C 29 18.59 27.67 16.5 25.72 15.38 C 26.21 14.71 26.5 13.89 26.5 13 C 26.5 10.79 24.71 9 22.5 9 Z`} fill={fill} stroke={stroke} strokeWidth={sw}/>),
  };
  return (
    <svg viewBox="0 0 45 45" width={size} height={size} style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))" }}>
      {paths[type]}
    </svg>
  );
}

// ───────────────────────── HOOK: VOZ (com fallback iOS) ─────────────────────────
function useVoice() {
  const [enabled, setEnabledState] = useState(() => {
    try {
      const v = localStorage.getItem("xc_voice_enabled");
      return v === null ? true : v === "1";
    } catch { return true; }
  });
  const setEnabled = useCallback((v) => {
    setEnabledState(v);
    try { localStorage.setItem("xc_voice_enabled", v ? "1" : "0"); } catch {}
  }, []);
  const [unlocked, setUnlocked] = useState(false);

  const speak = useCallback((text) => {
    if (!enabled || typeof window === "undefined" || !window.speechSynthesis) return;
    if (!unlocked) return; // No iOS, voz só toca após 1ª interação
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "pt-BR";
      u.rate = 0.92;
      u.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const pt = voices.find(v => v.lang.startsWith("pt") && v.name.toLowerCase().includes("female")) ||
                 voices.find(v => v.lang.startsWith("pt"));
      if (pt) u.voice = pt;
      window.speechSynthesis.speak(u);
    } catch {}
  }, [enabled, unlocked]);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
  }, []);

  // Desbloqueia voz na 1ª interação do usuário (iOS exige isso)
  const unlock = useCallback(() => {
    if (unlocked || typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      const silent = new SpeechSynthesisUtterance("");
      silent.volume = 0;
      window.speechSynthesis.speak(silent);
    } catch {}
    setUnlocked(true);
  }, [unlocked]);

  return { speak, stop, enabled, setEnabled, unlock, unlocked };
}

// ───────────────────────── HOOK: PROGRESSO (localStorage real) ─────────────────────────
const PROGRESS_KEY = "xc_progress_v2";
function useProgress() {
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { completed: [], lastLesson: null, slideByLesson: {} };
  });

  const persist = useCallback((next) => {
    setData(next);
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const markComplete = useCallback((lessonNum) => {
    setData(prev => {
      const next = { ...prev, completed: [...new Set([...prev.completed, lessonNum])] };
      try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const setLastLesson = useCallback((n, slideIdx = 0) => {
    setData(prev => {
      const next = { ...prev, lastLesson: n, slideByLesson: { ...prev.slideByLesson, [n]: slideIdx } };
      try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const getSlideForLesson = useCallback((n) => data.slideByLesson?.[n] ?? 0, [data]);

  const reset = useCallback(() => {
    persist({ completed: [], lastLesson: null, slideByLesson: {} });
  }, [persist]);

  const completedSet = useMemo(() => new Set(data.completed || []), [data.completed]);
  const isComplete = useCallback((n) => completedSet.has(n), [completedSet]);

  return {
    completed: completedSet,
    lastLesson: data.lastLesson,
    markComplete,
    isComplete,
    setLastLesson,
    getSlideForLesson,
    reset,
  };
}
// ───────────────────────── TABULEIRO ─────────────────────────
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
function bd(setup) {
  const b = emptyBoard();
  for (const [sq, p] of Object.entries(setup)) {
    const [r, c] = parseSquare(sq);
    b[r][c] = { color: p[0], type: p[1] };
  }
  return b;
}
function hl(...squares) { return squares.map(s => parseSquare(s)); }
function arrow(from, to, color) { return { from: parseSquare(from), to: parseSquare(to), color }; }

// Aplica um lance "from-to" ao tabuleiro, retornando novo tabuleiro
// move: "e2-e4" ou "e7-e8=Q" para promoção, "O-O" / "O-O-O" para roque
// color: "w" ou "b"
function applyMove(board, move, color) {
  const next = board.map(row => row.map(p => p ? {...p} : null));
  if (move === "O-O") {
    // Roque pequeno
    const row = color === "w" ? 7 : 0;
    next[row][6] = next[row][4]; next[row][4] = null;  // Rei
    next[row][5] = next[row][7]; next[row][7] = null;  // Torre
    return { board: next, lastMove: { from: [row, 4], to: [row, 6] } };
  }
  if (move === "O-O-O") {
    const row = color === "w" ? 7 : 0;
    next[row][2] = next[row][4]; next[row][4] = null;
    next[row][3] = next[row][0]; next[row][0] = null;
    return { board: next, lastMove: { from: [row, 4], to: [row, 2] } };
  }
  // Movimento normal: "e2-e4" ou "e7-e8=Q"
  const parts = move.split("-");
  const from = parseSquare(parts[0]);
  const toAndPromo = parts[1].split("=");
  const to = parseSquare(toAndPromo[0]);
  const promo = toAndPromo[1]; // 'Q', 'R', 'B', 'N' ou undefined
  const piece = next[from[0]][from[1]];
  next[to[0]][to[1]] = promo ? { color: piece.color, type: promo } : piece;
  next[from[0]][from[1]] = null;
  return { board: next, lastMove: { from, to } };
}

// Helper para construir uma sequência de lances comentados a partir do tabuleiro inicial.
// moves = [{ move: "e2-e4", color: "w", comment: "...", arrows?: [...], label? }]
function buildGameMoves(initialBoard, moves) {
  let current = initialBoard;
  const result = [];
  for (const m of moves) {
    const applied = applyMove(current, m.move, m.color);
    current = applied.board;
    result.push({
      board: current,
      lastMove: applied.lastMove,
      comment: m.comment,
      arrows: m.arrows,
      label: m.label,
    });
  }
  return result;
}

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

// ───────────────────────── COMPONENTE: TABULEIRO RESPONSIVO ─────────────────────────
function ChessBoard({
  board, onMove, highlights = [], arrows = [],
  showCoordinates = true, size = 480,
  interactive = true, highlightedPiece = null,
  showLastMove = null,
}) {
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const sq = size / 8;

  // Reset seleção quando o board muda externamente
  useEffect(() => {
    setSelected(null);
    setValidMoves([]);
  }, [board]);

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
    <div style={{ position: "relative", width: size, height: size, touchAction: "manipulation" }}>
      <div style={{
        position: "absolute", inset: -10,
        background: `linear-gradient(135deg, ${C.sepiaDeep}, ${C.sepia})`,
        borderRadius: 10,
        boxShadow: "0 8px 24px rgba(44,31,15,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
      }}/>
      <div style={{
        position: "absolute", inset: 0, borderRadius: 4, overflow: "hidden",
        boxShadow: "inset 0 0 16px rgba(44,31,15,0.4)",
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
                <div
                  key={c}
                  onClick={() => handleSquareClick(r, c)}
                  style={{
                    width: sq, height: sq, position: "relative",
                    backgroundColor: isLight ? C.lightSquare : C.darkSquare,
                    cursor: interactive ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {isSelected && <div style={{ position: "absolute", inset: 0, backgroundColor: C.selectedSquare }}/>}
                  {isHighlight && !isSelected && (
                    <div style={{ position: "absolute", inset: 0, backgroundColor: C.validMove }}/>
                  )}
                  {isLastMove && !isSelected && !isHighlight && (
                    <div style={{ position: "absolute", inset: 0, backgroundColor: C.hintSquare }}/>
                  )}
                  {showCoordinates && c === 0 && (
                    <span style={{
                      position: "absolute", left: 3, top: 1,
                      fontSize: Math.max(9, sq * 0.18), fontWeight: 700,
                      color: isLight ? C.darkSquare : C.lightSquare,
                      fontFamily: "Crimson Text, serif",
                      pointerEvents: "none",
                    }}>{RANKS[r]}</span>
                  )}
                  {showCoordinates && r === 7 && (
                    <span style={{
                      position: "absolute", right: 3, bottom: 0,
                      fontSize: Math.max(9, sq * 0.18), fontWeight: 700,
                      color: isLight ? C.darkSquare : C.lightSquare,
                      fontFamily: "Crimson Text, serif",
                      pointerEvents: "none",
                    }}>{FILES[c]}</span>
                  )}
                  {isValidMove && !isCapture && (
                    <div style={{
                      position: "absolute", width: sq * 0.32, height: sq * 0.32,
                      borderRadius: "50%", backgroundColor: C.validMove,
                      pointerEvents: "none",
                    }}/>
                  )}
                  {isCapture && (
                    <div style={{
                      position: "absolute", inset: 4,
                      borderRadius: "50%", border: `4px solid ${C.captureSquare}`,
                      pointerEvents: "none",
                    }}/>
                  )}
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
                  {piece && (
                    <div style={{ position: "relative", zIndex: 2, pointerEvents: "none" }}>
                      <PieceSvg type={piece.type} color={piece.color} size={sq * 0.85} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {arrows.length > 0 && (
        <svg width={size} height={size} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={C.gold}/>
            </marker>
          </defs>
          {arrows.map((arr, i) => {
            const x1 = arr.from[1] * sq + sq/2;
            const y1 = arr.from[0] * sq + sq/2;
            const x2 = arr.to[1] * sq + sq/2;
            const y2 = arr.to[0] * sq + sq/2;
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={arr.color || C.gold}
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

// ───────────────────────── BOTÕES ─────────────────────────
function BigButton({ children, onClick, variant = "primary", icon, disabled, fullWidth }) {
  const styles = {
    primary: { bg: C.moss, hover: C.mossLight, text: C.cream, border: C.sepiaDeep },
    secondary: { bg: C.creamDark, hover: C.cream, text: C.sepiaDeep, border: C.sepia },
    gold: { bg: C.gold, hover: C.goldBright, text: C.ink, border: C.sepiaDeep },
  };
  const s = styles[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? C.creamDark : s.bg,
        color: disabled ? C.sepia : s.text,
        border: `2px solid ${disabled ? C.sepia : s.border}`,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        padding: "14px 24px",
        fontSize: 17,
        borderRadius: 14,
        boxShadow: disabled ? "none" : "0 4px 12px rgba(0,0,0,0.1)",
        display: "inline-flex", alignItems: "center", gap: 10,
        fontWeight: 500, letterSpacing: "0.02em",
        fontFamily: "Crimson Text, serif",
        width: fullWidth ? "100%" : undefined,
        justifyContent: "center",
        WebkitTapHighlightColor: "transparent",
        transition: "transform 0.1s, background-color 0.2s",
        minHeight: 50,
      }}
      onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
      onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {icon}
      {children}
    </button>
  );
}
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
  // Continuação — aulas 6 a 15
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
        type: "practice",
        titulo: "Exercício: encontre o garfo!",
        texto: "O Cavalo branco em e6 tem UMA casa especial que ataca o Rei E a Torre pretos ao mesmo tempo! Encontre essa casa. Dica: ela fica perto da Torre.",
        board: bd({ e8: "bK", a8: "bR", e1: "wK", e6: "wN" }),
        objetivo: { from: "e6", to: "c7" },
        explicacaoPosMate: "Garfo perfeito! Cavalo em c7 ataca o Rei em e8 (xeque!) E a Torre em a8 ao mesmo tempo. As pretas têm que mover o Rei (xeque é obrigatório), e na próxima jogada você captura a Torre!",
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
  // Aulas 16 a 20
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
        texto: "Como saber se o Rei adversário alcança seu peão passado? Imagine um QUADRADO entre o peão e a casa de promoção. Os lados marcados em verde mostram o quadrado: do peão (b5) até a casa de promoção (b8), e do peão para o lado (b5 até e5), formando um quadrado de 4 casas de lado. Se o Rei adversário estiver DENTRO desse quadrado (ou puder entrar nele em uma jogada), ele alcança. Aqui o Rei preto está em h6 — FORA do quadrado. O peão promove!",
        board: bd({ b5: "wP", h6: "bK" }),
        highlights: hl("b5","c5","d5","e5","b6","e6","b7","e7","b8","c8","d8","e8"),
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
    n: 17, titulo: "Final de Rei e Dama", subtitulo: "Como dar o mate quando ganhou material",
    capitulo: "Avançado",
    slides: [
      {
        type: "intro",
        titulo: "Você precisa SABER dar mate!",
        texto: "Vai acontecer com você: você está ganhando, tem Rei + Dama contra Rei sozinho. Agora precisa converter a vantagem em xeque-mate. Sem técnica, dá pra rodar 50 jogadas e empatar por afogamento. Com técnica, são 10 jogadas. Vou te ensinar passo a passo.",
      },
      {
        type: "explain",
        titulo: "A regra de ouro",
        texto: "Para dar mate, você precisa de DUAS coisas: 1) o Rei adversário na BORDA do tabuleiro (ou no canto). 2) seu próprio Rei AJUDANDO. A Dama SOZINHA nunca dá mate — ela só dá xeque, mas o Rei foge. Olhe: aqui o Rei preto está no centro, longe da borda. Não dá pra dar mate ainda.",
        board: bd({ e5: "bK", d4: "wQ", e1: "wK" }),
      },
      {
        type: "explain",
        titulo: "A técnica: 'salto de cavalo'",
        texto: "O truque para empurrar o Rei adversário é colocar sua Dama a um SALTO DE CAVALO dele — em forma de L. Olhe: a Dama branca está em d3 e o Rei preto em e5. Distância de Cavalo (1 casa pra um lado, 2 pra outro). A Dama assim tira muitas casas de fuga do Rei sem afogá-lo.",
        board: bd({ e5: "bK", d3: "wQ", e1: "wK" }),
        highlightedPiece: parseSquare("d3"),
      },
      {
        type: "explain",
        titulo: "Passo 1: aproxime a Dama no salto de cavalo",
        texto: "Primeiro lance: leve sua Dama para uma casa que esteja a um salto de cavalo do Rei adversário. Aqui a Dama em d3 cerca o Rei: ele só pode ir para e6, f6 ou f4 (poucas opções). Está sendo empurrado!",
        board: bd({ e5: "bK", d3: "wQ", e1: "wK" }),
        highlights: hl("e6","f6","f4"),
      },
      {
        type: "explain",
        titulo: "Passo 2: o Rei foge — você persegue",
        texto: "Imagine que o Rei preto fugiu para e6. Agora você joga a Dama para uma NOVA casa em salto de cavalo: Dama vai para d4. O Rei preto agora só consegue ir para e7, f5 ou f7. Está mais perto da borda 8.",
        board: bd({ e6: "bK", d4: "wQ", e1: "wK" }),
        highlights: hl("e7","f5","f7"),
      },
      {
        type: "explain",
        titulo: "Passo 3: continue empurrando",
        texto: "Imagine que o Rei foi para e7. Você joga Dama para d5 (sempre salto de cavalo!). O Rei agora só pode ir para e8 ou f8 — chegou na 8ª fileira!",
        board: bd({ e7: "bK", d5: "wQ", e1: "wK" }),
        highlights: hl("e8","f8"),
      },
      {
        type: "explain",
        titulo: "Passo 4: ATENÇÃO — não afogue!",
        texto: "Quando o Rei chegar no canto, MUITO CUIDADO. Olhe esta armadilha: Rei preto em a8, Dama branca em c7. O Rei NÃO está em xeque, MAS não tem nenhum lance legal: a7, b7 e b8 estão atacadas pela Dama. Isso é EMPATE por afogamento! Você jogou bem o jogo todo e empatou. Tragédia.",
        board: bd({ a8: "bK", c7: "wQ", e1: "wK" }),
      },
      {
        type: "explain",
        titulo: "Passo 5: traga seu Rei para ajudar",
        texto: "A solução: NÃO aperte mais a Dama por enquanto. Em vez disso, traga seu Rei para perto. Ele anda 1 casa por vez, então leva alguns lances. Veja: seu Rei chegou em e3. A Dama mantém o Rei preto preso na 8ª fileira (em d6 a Dama cerca a 7ª fileira sem afogar).",
        board: bd({ e8: "bK", d6: "wQ", e3: "wK" }),
      },
      {
        type: "explain",
        titulo: "Passo 6: Rei branco se aproximando",
        texto: "Continue trazendo o Rei. Lance após lance ele anda: e3 → e4 → e5. Agora ele está em e5. A Dama em d6 mantém o Rei preto preso na 8ª fileira (Rei preto pode ir só para f7 — ainda sem afogar).",
        board: bd({ e8: "bK", d6: "wQ", e5: "wK" }),
      },
      {
        type: "explain",
        titulo: "Passo 7: o mate!",
        texto: "Agora dê o mate! Dama vai para d8 ou e7. Veja Dama em e7: ataca o Rei em e8 (xeque pela coluna). O Rei não pode fugir: d8 atacada pela Dama; f8 atacada pela Dama; d7 e f7 atacadas pelo Rei branco em e6. E o Rei não pode capturar a Dama porque ela está PROTEGIDA pelo Rei branco em e6 (ao lado de e7). MATE!",
        board: bd({ e8: "bK", e7: "wQ", e6: "wK" }),
        arrows: [arrow("e7", "e8", C.rose)],
      },
      {
        type: "explain",
        titulo: "Resumo da técnica",
        texto: "1) Aproxime a Dama em SALTO DE CAVALO do Rei adversário\n2) Persiga ele até a borda, sempre em salto de cavalo\n3) Quando chegar na borda, PARE de apertar a Dama\n4) Traga seu Rei para apoiar\n5) Com os Reis em oposição (1 casa entre), dê o mate com a Dama\n\nNUNCA esqueça: cuidado com afogamento — sempre deixe pelo menos 1 casa de fuga até estar pronto para o mate.",
      },
      {
        type: "quiz",
        titulo: "Teste",
        pergunta: "Para dar mate com Rei + Dama contra Rei, você precisa:",
        opcoes: ["Só da Dama, sem o Rei", "Empurrar o Rei adversário para a borda e usar Dama + Rei juntos", "Capturar todas as peças"],
        correta: 1,
        explicacao: "Isso! Borda + Dama + Rei trabalhando juntos. Dama sozinha nunca mata.",
      },
      {
        type: "quiz",
        titulo: "Atenção ao perigo!",
        pergunta: "Se você fizer xeque com a Dama colando no Rei adversário, sem seu Rei perto, o que acontece?",
        opcoes: ["Mate", "Empate por afogamento (se não houver xeque) ou Rei captura a Dama", "Não pode fazer isso"],
        correta: 1,
        explicacao: "Exato! Sem o Rei defendendo a Dama, o Rei adversário pode capturá-la. Ou se não for xeque, é afogamento. Por isso o Rei tem que estar perto antes do mate.",
      },
      {
        type: "complete",
        titulo: "Aula 17 concluída! 🎉",
        texto: "Mate de Rei + Dama é fundamental — você vai usar essa técnica em muitas partidas. Pratique no Lichess: comece um final com Rei+Dama vs Rei e tente dar mate em menos de 15 lances. Próxima aula: o mate com Torre, um pouco mais difícil.",
      },
    ]
  },

  // ═══════════════════════ AULA 18: FINAL DE REI E TORRE ═══════════════════════
  {
    n: 18, titulo: "Final de Rei e Torre", subtitulo: "Como dar o mate com Torre",
    capitulo: "Avançado",
    slides: [
      {
        type: "intro",
        titulo: "Mate de Rei + Torre vs Rei",
        texto: "Esse é o segundo final fundamental que você precisa saber. Mais difícil que com Dama (porque a Torre é mais 'fraca'), mas igualmente importante. Vai te aparecer em partidas reais. Vou ensinar a técnica clássica passo a passo.",
      },
      {
        type: "explain",
        titulo: "Diferença para o mate de Dama",
        texto: "A Dama atacava na linha E na diagonal. A Torre só na linha. Por isso, no mate de Torre, o seu próprio Rei tem trabalho EXTRA: ele precisa cobrir as casas que a Torre não cobre. Os dois trabalham em parceria fechada.",
        board: bd({ d4: "wR", e1: "wK" }),
        highlights: hl("a4","b4","c4","e4","f4","g4","h4","d1","d2","d3","d5","d6","d7","d8"),
      },
      {
        type: "explain",
        titulo: "O conceito de 'oposição'",
        texto: "Antes do mate, você precisa entender OPOSIÇÃO. É quando os dois Reis estão na mesma coluna (ou fileira), com UMA casa entre eles. Olhe: Reis em e3 e e5, com e4 vazia entre eles. Quem TEM a oposição é quem NÃO está na vez de jogar — porque o outro vai ter que recuar.",
        board: bd({ e3: "wK", e5: "bK" }),
      },
      {
        type: "explain",
        titulo: "A técnica em 3 fases",
        texto: "1) Use a TORRE para CORTAR o Rei adversário, empurrando ele para a borda\n2) Aproxime seu Rei e force a OPOSIÇÃO\n3) Quando o Rei adversário estiver na última fileira/coluna, dê o mate com a Torre\n\nVamos ver passo a passo.",
      },
      {
        type: "explain",
        titulo: "Fase 1: cortar com a Torre",
        texto: "Imagine o Rei preto solto em d5. Sua primeira tarefa: usar a Torre para 'cortar' uma fileira ou coluna inteira, restringindo onde ele pode ir. Olhe: Torre em h5. O Rei preto NÃO pode mais descer para a fileira 5 — está PRESO nas fileiras 6, 7 e 8. (Ou na fileira 5 mas sem fugir).",
        board: bd({ d5: "bK", h5: "wR", e1: "wK" }),
      },
      {
        type: "explain",
        titulo: "Fase 1: continue empurrando",
        texto: "O Rei preto vai querer subir (única opção). Suponha que ele foi para d6. Agora você joga sua Torre uma fileira acima — Torre em h6 — e o Rei é cortado mais ainda: só pode ficar entre as fileiras 7 e 8.",
        board: bd({ d6: "bK", h6: "wR", e1: "wK" }),
      },
      {
        type: "explain",
        titulo: "Cuidado: Torre não pode ser capturada",
        texto: "ATENÇÃO: nunca aproxime sua Torre demais sem o Rei branco perto, ou o Rei adversário pode capturá-la. Aqui o Rei preto em d6 está a 4 casas de distância da Torre em h6 — seguro. Mas se a Torre fosse para e6, o Rei capturaria!",
        board: bd({ d6: "bK", h6: "wR", e1: "wK" }),
      },
      {
        type: "explain",
        titulo: "Fase 2: traga seu Rei",
        texto: "Com o Rei adversário cortado, traga o seu Rei. Cada lance ele anda 1 casa. Vai pra e2, e3, e4, e5... olhe a posição depois de algumas jogadas: Rei branco em e5, Rei preto em d7 (foi sendo empurrado), Torre cortando em h7.",
        board: bd({ d7: "bK", h7: "wR", e5: "wK" }),
      },
      {
        type: "explain",
        titulo: "Fase 2: a oposição se forma",
        texto: "Continue trazendo seu Rei até estar a 2 casas do Rei adversário, na MESMA coluna. Agora os Reis estão em oposição: Rei branco em e6, Rei preto em e8 (a Torre forçou ele para a 8ª fileira). É a vez das pretas — e elas não podem manter a oposição. Vão ter que ir pra d8 ou f8.",
        board: bd({ e8: "bK", h7: "wR", e6: "wK" }),
      },
      {
        type: "explain",
        titulo: "Fase 3: posição de mate",
        texto: "Imagine que pretas foram para d8 (já estavam encurraladas). Sua Torre vai dar o golpe na 8ª fileira. Mas para ser MATE, seu Rei branco precisa estar em d6 — controlando c7, d7, e7. Veja a posição: Rei branco em d6, Rei preto em d8, Torre em h7 pronta para subir.",
        board: bd({ d8: "bK", h7: "wR", d6: "wK" }),
      },
      {
        type: "explain",
        titulo: "O mate!",
        texto: "Torre h7 → h8 dá xeque pela 8ª fileira. O Rei preto não tem fuga: c8 e e8 atacadas pela Torre; c7, d7, e7 atacadas pelo Rei branco em d6. E ele não pode capturar a Torre (longe demais). MATE!",
        board: bd({ d8: "bK", h8: "wR", d6: "wK" }),
        arrows: [arrow("h8", "d8", C.rose)],
      },
      {
        type: "explain",
        titulo: "A regra de ouro do mate",
        texto: "Para mate de Rei+Torre, lembre-se: seu REI tem que estar BEM PERTO do Rei adversário (a 2 casas, em oposição direta), e a Torre dá o golpe na borda. Sem o Rei perto, o Rei adversário sempre foge. Esse final exige paciência — pode levar 15-20 lances. Sem pressa.",
      },
      {
        type: "quiz",
        titulo: "Teste",
        pergunta: "No mate de Rei + Torre, qual é o papel de cada peça?",
        opcoes: ["Torre dá xeque na borda, Rei controla as casas de fuga", "Torre dá xeque-mate sozinha", "Rei dá o mate, Torre só observa"],
        correta: 0,
        explicacao: "Isso! Torre + Rei trabalhando juntos. A Torre dá o xeque, o Rei controla onde o adversário tentaria fugir.",
      },
      {
        type: "quiz",
        titulo: "Por que demora?",
        pergunta: "Por que o mate de Torre é mais lento que o de Dama?",
        opcoes: ["Torre é mais lenta para se mover", "Torre não cobre diagonais — o Rei adversário tem mais casas para fugir", "São iguais"],
        correta: 1,
        explicacao: "Exato! A Dama cobre linha E diagonal. A Torre só linha. Por isso o seu Rei precisa fazer o trabalho extra de cobrir as diagonais.",
      },
      {
        type: "complete",
        titulo: "Aula 18 concluída! 🎉",
        texto: "Você já sabe os DOIS finais fundamentais: Rei+Dama e Rei+Torre. Pratique no Lichess. Próxima aula: estratégia do meio-jogo — pensando à frente.",
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
        texto: "Depois da abertura (peças desenvolvidas, Rei rocado), começa o MEIO-JOGO. Aqui os planos acontecem, peças manobram, ataques se preparam. Vou mostrar 5 conceitos visuais que vão melhorar muito o seu jogo.",
      },
      {
        type: "explain",
        titulo: "1. Atividade das peças — cavalo no centro",
        texto: "Olhe esse cavalo branco em e5. As 8 casas marcadas em verde são onde ele pode pular. Posicionado assim, no CENTRO do tabuleiro, ele é uma peça poderosa.",
        board: bd({ e5: "wN" }),
        highlights: hl("c4","c6","d3","d7","f3","f7","g4","g6"),
      },
      {
        type: "explain",
        titulo: "Atividade das peças — cavalo no canto",
        texto: "Compare: este cavalo está em a1 (canto). Veja só duas casas marcadas — só dois lugares pra pular. 'Cavalo no canto = cavalo fraco'. Sempre prefira peças no centro!",
        board: bd({ a1: "wN" }),
        highlights: hl("b3","c2"),
      },
      {
        type: "explain",
        titulo: "2. Estrutura de peões — peões dobrados",
        texto: "Olhe os peões brancos em c2 e c3 — DOBRADOS, na mesma coluna. Isso é fraco: eles não conseguem se defender mutuamente, e travam o trânsito. Evite ter peões dobrados; se conseguir CRIAR peões dobrados no adversário, isso é uma vantagem.",
        board: bd({ c3: "wP", c2: "wP", a2: "wP", b2: "wP", e2: "wP" }),
        highlightedPiece: parseSquare("c3"),
      },
      {
        type: "explain",
        titulo: "Estrutura de peões — peão isolado",
        texto: "Aqui o peão branco em d4 é ISOLADO — não tem peão amigo nas colunas vizinhas (c e e). Peões isolados são fracos porque ninguém pode defendê-los com peão. Adversário ataca com peças e ele cai.",
        board: bd({ d4: "wP", a2: "wP", b2: "wP", g2: "wP", h2: "wP" }),
        highlightedPiece: parseSquare("d4"),
      },
      {
        type: "explain",
        titulo: "3. Casas fracas — pondo cavalo no buraco",
        texto: "Uma CASA FRACA é uma casa que o adversário não consegue mais defender com peão. Olhe: as pretas têm peões em a7, c7, h7, mas a casa b6 ficou descoberta (não tem peão a7 nem c7 que possa atacar b6 sem se mover ainda mais). Coloque um cavalo branco lá: imbatível!",
        board: bd({ b6: "wN", a7: "bP", c7: "bP", h7: "bP", g7: "bP", e8: "bK" }),
        highlightedPiece: parseSquare("b6"),
      },
      {
        type: "explain",
        titulo: "4. Coluna aberta para Torres",
        texto: "Esta coluna 'd' está totalmente aberta — sem peões. A Torre branca em d1 enxerga até d8 sem nada no caminho. Torres adoram colunas abertas, viram máquinas de ataque. Sempre tente colocar suas torres em colunas abertas.",
        board: bd({ d1: "wR", a2: "wP", b2: "wP", e2: "wP", f2: "wP", g2: "wP", h2: "wP", a7: "bP", b7: "bP", e7: "bP", f7: "bP", g7: "bP", h7: "bP" }),
        highlightedPiece: parseSquare("d1"),
      },
      {
        type: "explain",
        titulo: "5. Ataque ao Rei exposto",
        texto: "Se o Rei adversário não fez o roque e ficou no centro, ATAQUE! Aqui as pretas estão com Rei em e8 ainda, peças desorganizadas. As brancas têm Dama, Bispo e Cavalo apontando para o lado do Rei. Hora de juntar peças contra o Rei!",
        board: bd({ d1: "wQ", c4: "wB", e5: "wN", g1: "wK", e8: "bK", a8: "bR", h8: "bR", a7: "bP", b7: "bP", c7: "bP", d7: "bP", f7: "bP", g7: "bP", h7: "bP" }),
        arrows: [arrow("c4", "f7", C.gold), arrow("d1", "d7", C.gold), arrow("e5", "f7", C.gold)],
      },
      {
        type: "explain",
        titulo: "Resumo: como pensar a cada lance",
        texto: "A cada lance, pergunte:\n1) Meu Rei está seguro?\n2) Alguma peça minha está em perigo?\n3) Minhas peças estão ativas?\n4) Posso melhorar a peça PIOR (a mais passiva)?\n5) Há alguma tática (garfo, cravada, ataque duplo)?\n\nResponda essas perguntas e seus lances vão melhorar muito.",
      },
      {
        type: "quiz",
        titulo: "Teste",
        pergunta: "No meio-jogo, qual peça é melhor: cavalo no centro ou cavalo no canto?",
        opcoes: ["No centro (mais ativo)", "No canto (mais protegido)", "Tanto faz"],
        correta: 0,
        explicacao: "Isso! Cavalo no centro alcança até 8 casas. No canto, só 2. 'Cavalo na borda é cavalo fraco'.",
      },
      {
        type: "quiz",
        titulo: "Outro teste",
        pergunta: "O que é melhor para uma Torre?",
        opcoes: ["Ficar atrás dos próprios peões", "Estar em uma coluna aberta (sem peões)", "Tanto faz"],
        correta: 1,
        explicacao: "Exato! Torre em coluna aberta é uma máquina de ataque.",
      },
      {
        type: "complete",
        titulo: "Aula 19 concluída! 🎉",
        texto: "Você aprendeu os 5 conceitos-chave do meio-jogo. Última aula chegando: vamos juntar TUDO numa partida completa!",
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
        type: "gameReplay",
        titulo: "Os primeiros lances de uma partida típica",
        moves: buildGameMoves(startingBoard(), [
          { move: "e2-e4", color: "w", comment: "1.e4 — Ocupando o centro e abrindo caminho para Bispo e Dama. Lance clássico, recomendado para iniciantes.", label: "Brancas" },
          { move: "e7-e5", color: "b", comment: "1...e5 — Pretas espelham, ocupando seu próprio centro. Posição equilibrada.", label: "Pretas" },
          { move: "g1-f3", color: "w", comment: "2.Cf3 — Brancas desenvolvem o cavalo E atacam o peão e5. Princípio da abertura aplicado!", label: "Brancas",
            arrows: [arrow("f3", "e5", C.rose)],
          },
          { move: "b8-c6", color: "b", comment: "2...Cc6 — Pretas defendem o peão desenvolvendo um cavalo. Bom lance!", label: "Pretas" },
          { move: "f1-c4", color: "w", comment: "3.Bc4 — Brancas desenvolvem o bispo apontando para f7, ponto fraco preto. Esta abertura se chama 'Italiana'.", label: "Brancas",
            arrows: [arrow("c4", "f7", C.gold)],
          },
          { move: "f8-c5", color: "b", comment: "3...Bc5 — Pretas espelham. Posição simétrica, equilibrada — chamada 'Giuoco Piano' (Jogo Tranquilo).", label: "Pretas" },
          { move: "O-O", color: "w", comment: "4.O-O — Brancas fazem o roque, colocando o Rei em segurança.", label: "Brancas" },
          { move: "g8-f6", color: "b", comment: "4...Cf6 — Pretas desenvolvem o último cavalo, atacando o peão e4.", label: "Pretas" },
        ]),
      },
      {
        type: "explain",
        titulo: "Continuação: meio-jogo",
        texto: "Daqui em diante, ambos terminam o desenvolvimento e começa o MEIO-JOGO — onde planos estratégicos entram. Você já tem toda a base para jogar isso na prática!",
      },
      {
        type: "explain",
        titulo: "Dica final: jogue muito!",
        texto: "Xadrez se aprende JOGANDO. O Lichess permite você jogar contra o computador no nível mais fácil, de graça e sem cadastro. Comece pelos níveis 1 ou 2 e suba devagar.",
        link: { url: "https://lichess.org/setup/ai?lang=pt-BR", label: "Jogar agora no Lichess" },
      },
      {
        type: "explain",
        titulo: "Quando errar, sem culpa",
        texto: "Todo jogador, mesmo os campeões mundiais, perde partidas. O importante NÃO É vencer sempre, mas se divertir e ir aprendendo. Cada partida ensina algo. Seja paciente consigo mesma — você está construindo uma habilidade nova aos 72 anos. Isso é admirável!",
      },
      {
        type: "complete",
        titulo: "Aula 20 concluída! 🎉",
        texto: "Você terminou os fundamentos! Agora vamos para 10 aulas extras: puzzles, partidas históricas comentadas, e um caminho para você jogar de verdade.",
      },
    ]
  },
  // ═══════════════════════ AULA 21: MATE EM 1 ═══════════════════════
  {
    n: 21, titulo: "Mate em 1 — Parte 1", subtitulo: "Encontre o lance vencedor",
    capitulo: "Quebra-cabeças",
    slides: [
      {
        type: "intro",
        titulo: "Hora de praticar mate!",
        texto: "A partir de agora, você vai resolver QUEBRA-CABEÇAS de mate. São posições reais onde existe um lance que dá xeque-mate imediato. Sua tarefa: achar esse lance. Comece olhando todas as peças com calma.",
      },
      {
        type: "explain",
        titulo: "Como resolver",
        texto: "Olhe a posição. Pergunte: 'qual peça pode dar xeque?'. Depois: 'esse xeque seria mate, ou o Rei foge?'. Quando achar o lance, clique na peça e na casa de destino.",
      },
      {
        type: "practice",
        titulo: "Puzzle 1: o mate da retaguarda",
        texto: "Brancas jogam e dão mate em 1. O Rei preto está preso atrás dos próprios peões. Como a Torre branca pode aproveitar?",
        board: bd({ e1: "wK", a1: "wR", h8: "bK", g7: "bP", f7: "bP", h7: "bP" }),
        objetivo: { from: "a1", to: "a8" },
        explicacaoPosMate: "Mate! Torre em a8 dá xeque pela 8ª fileira. O Rei em h8 está preso pelos próprios peões em f7, g7 e h7 — não há casa de fuga. Este é o famoso 'mate da retaguarda', muito comum em partidas reais.",
      },
      {
        type: "practice",
        titulo: "Puzzle 2: a Dama na borda",
        texto: "Brancas jogam e dão mate em 1. Olhe o Rei preto na coluna 'a' — onde a Dama branca pode chegar para ameaçar?",
        board: bd({ e1: "wK", c2: "wQ", a8: "bK", a7: "bP", b7: "bP" }),
        objetivo: { from: "c2", to: "c8" },
        explicacaoPosMate: "Mate! Dama em c8 dá xeque pela 8ª fileira. O Rei em a8 está preso pelos próprios peões em a7 e b7 — não tem casa para fugir. Torre seria igual, mas a Dama também faz!",
      },
      {
        type: "practice",
        titulo: "Puzzle 3: Cavalo afobado",
        texto: "Brancas jogam e dão mate. Dica: o Cavalo branco tem um lance especial. Olhe o Rei preto na borda.",
        board: bd({ e1: "wK", h6: "wN", g7: "wP", h8: "bK", h7: "bP" }),
        objetivo: { from: "h6", to: "f7" },
        explicacaoPosMate: "Mate! Cavalo em f7 dá xeque ao Rei em h8. O Rei não tem fuga: g8 é atacada pelo cavalo, h7 está com peão preto, e ele não pode capturar o Cavalo (longe demais).",
      },
      {
        type: "complete",
        titulo: "Aula 21 concluída! 🎉",
        texto: "Você resolveu seus primeiros 3 puzzles de mate em 1. Próxima aula: mais 3, com táticas diferentes!",
      },
    ]
  },

  // ═══════════════════════ AULA 22: MATE EM 1 — PARTE 2 ═══════════════════════
  {
    n: 22, titulo: "Mate em 1 — Parte 2", subtitulo: "Mais quebra-cabeças",
    capitulo: "Quebra-cabeças",
    slides: [
      {
        type: "intro",
        titulo: "Mais 3 puzzles!",
        texto: "Vamos continuar treinando. Cada puzzle vai ficar um pouquinho mais difícil. Olhe a posição com calma — a resposta sempre está lá.",
      },
      {
        type: "practice",
        titulo: "Puzzle 1: a longa diagonal",
        texto: "O Bispo branco em b2 controla a longa diagonal. Brancas jogam e dão mate em 1.",
        board: bd({ e1: "wK", b2: "wB", a1: "wR", h8: "bK", h7: "bP", g7: "bP", e8: "bR" }),
        objetivo: { from: "a1", to: "a8" },
        explicacaoPosMate: "Mate! Torre em a8 dá xeque na 8ª fileira. A Torre preta em e8 não pode bloquear sem deixar o Rei em xeque pelo Bispo, e o Rei está preso pelos próprios peões.",
      },
      {
        type: "practice",
        titulo: "Puzzle 2: a 'tesoura'",
        texto: "Duas torres trabalhando juntas é mortal. Brancas jogam e dão mate.",
        board: bd({ a1: "wK", a7: "wR", h6: "wR", e8: "bK" }),
        objetivo: { from: "h6", to: "h8" },
        explicacaoPosMate: "Mate! A Torre em h8 dá xeque, e a Torre em a7 corta a 7ª fileira. Rei preso entre as duas.",
      },
      {
        type: "practice",
        titulo: "Puzzle 3: o Bispo silencioso",
        texto: "Brancas jogam e dão mate. Pense: qual peça branca pode chegar a uma casa que ataque o Rei sem ser capturada?",
        board: bd({ e1: "wK", c1: "wB", d1: "wQ", h8: "bK", h7: "bP", g7: "bP", a8: "bR" }),
        objetivo: { from: "d1", to: "d8" },
        explicacaoPosMate: "Mate! Dama em d8 dá xeque pela 8ª fileira. A Torre preta em a8 não pode bloquear (sairia da fileira), e o Rei não tem casa.",
      },
      {
        type: "complete",
        titulo: "Aula 22 concluída! 🎉",
        texto: "Excelente! Você está enxergando os mates rapidinho agora. Próxima aula: mate em 2 — um nível acima.",
      },
    ]
  },

  // ═══════════════════════ AULA 23: MATE EM 2 ═══════════════════════
  {
    n: 23, titulo: "Mate em 1 — Parte 3", subtitulo: "Mais quebra-cabeças",
    capitulo: "Quebra-cabeças",
    slides: [
      {
        type: "intro",
        titulo: "Continuando o treino",
        texto: "Vamos com mais 3 puzzles de mate em 1. Cada um explora um tipo diferente de tema. Olhe sempre o Rei preto e procure como ameaçá-lo de forma definitiva.",
      },
      {
        type: "practice",
        titulo: "Puzzle 1: o Bispo e a Dama juntos",
        texto: "Brancas jogam e dão mate em 1. Dica: a Dama tem uma casa onde, defendida pelo Bispo, dá mate ao Rei preto.",
        board: bd({ e1: "wK", a1: "wB", g3: "wQ", h8: "bK", h7: "bP", f7: "bP" }),
        objetivo: { from: "g3", to: "g7" },
        explicacaoPosMate: "Mate! Dama vai a g7 dando xeque ao Rei em h8. A Dama está PROTEGIDA pelo Bispo na longa diagonal a1-h8 (passa por g7). O Rei não pode capturar (Bispo defende), não tem fuga (peões e ataque cobrem tudo).",
      },
      {
        type: "practice",
        titulo: "Puzzle 2: o sufoco",
        texto: "Brancas jogam e dão mate em 1. O Rei preto está apertado entre seus peões. Qual peça branca pode dar o golpe final?",
        board: bd({ e1: "wK", h3: "wR", e8: "bK", d7: "bP", e7: "bP", f7: "bP" }),
        objetivo: { from: "h3", to: "h8" },
        explicacaoPosMate: "Mate! Torre em h8 dá xeque na 8ª fileira. O Rei em e8 não tem fuga: d8 e f8 atacadas pela Torre, e os peões em d7/e7/f7 fecham a saída para a 7ª fileira.",
      },
      {
        type: "practice",
        titulo: "Puzzle 3: o salto fatal",
        texto: "Brancas jogam e dão mate em 1. O Cavalo branco tem um salto especial. Olhe o Rei preto preso no canto.",
        board: bd({ e1: "wK", c4: "wB", e5: "wN", h8: "bK", g8: "bN", h7: "bP", g7: "bP" }),
        objetivo: { from: "e5", to: "f7" },
        explicacaoPosMate: "Mate! Cavalo em f7 dá xeque ao Rei em h8. O Rei não tem para onde fugir: g8 está ocupada pelo seu próprio Cavalo, h7 pelo seu próprio peão. E ninguém consegue bloquear o xeque de Cavalo (cavalos pulam!).",
      },
      {
        type: "complete",
        titulo: "Aula 23 concluída! 🎉",
        texto: "Você está cada vez melhor em encontrar mates! Próxima aula: a partida mais bonita do xadrez clássico — a Imortal!",
      },
    ]
  },

  // ═══════════════════════ AULA 24: PARTIDA HISTÓRICA — A IMORTAL ═══════════════════════
  {
    n: 24, titulo: "A Partida Imortal", subtitulo: "Anderssen vs Kieseritzky, 1851",
    capitulo: "Partidas Clássicas",
    slides: [
      {
        type: "intro",
        titulo: "A obra-prima de 1851",
        texto: "Em Londres, 1851, durante o primeiro torneio internacional de xadrez, dois mestres jogaram uma partida tão linda que ganhou o nome de 'A Imortal'. Adolf Anderssen sacrificou um Bispo, as duas Torres E a Dama — e ainda assim deu mate. É a partida mais espetacular do século 19.",
      },
      {
        type: "explain",
        titulo: "Era romântica do xadrez",
        texto: "Naquela época, jogadores valorizavam ATAQUE acima de tudo. Sacrifícios audaciosos eram lance comum. A Imortal é o melhor exemplo desse estilo. Aperte 'Tocar tudo' no próximo slide e veja Anderssen sacrificar quase tudo!",
      },
      {
        type: "gameReplay",
        titulo: "A Imortal lance a lance",
        moves: buildGameMoves(startingBoard(), [
          { move: "e2-e4", color: "w", comment: "1.e4 — Anderssen abre normalmente, controlando o centro.", label: "Brancas" },
          { move: "e7-e5", color: "b", comment: "1...e5 — Kieseritzky responde simetricamente.", label: "Pretas" },
          { move: "f2-f4", color: "w", comment: "2.f4 — O Gambito do Rei! Anderssen oferece um peão para abrir linhas.", label: "Brancas" },
          { move: "e5-f4", color: "b", comment: "2...exf4 — Kieseritzky aceita o sacrifício. Está com 1 peão a mais.", label: "Pretas" },
          { move: "f1-c4", color: "w", comment: "3.Bc4 — Anderssen desenvolve o Bispo apontando para f7, ponto fraco preto.", label: "Brancas" },
          { move: "d8-h4", color: "b", comment: "3...Dh4+ — Pretas dão xeque. Brancas perdem o roque.", label: "Pretas" },
          { move: "e1-f1", color: "w", comment: "4.Rf1 — Rei se mexe. Sem roque agora — mas Anderssen não se importa.", label: "Brancas" },
          { move: "b7-b5", color: "b", comment: "4...b5 — Pretas tentam expulsar o Bispo c4 e ganhar mais tempo.", label: "Pretas" },
          { move: "c4-b5", color: "w", comment: "5.Bxb5 — Anderssen captura o peão. Recuperou o material!", label: "Brancas" },
          { move: "g8-f6", color: "b", comment: "5...Cf6 — Pretas desenvolvem o cavalo, atacando o peão e4.", label: "Pretas" },
          { move: "g1-f3", color: "w", comment: "6.Cf3 — Anderssen desenvolve cavalo atacando a Dama preta.", label: "Brancas" },
          { move: "h4-h6", color: "b", comment: "6...Dh6 — Dama recua para casa segura.", label: "Pretas" },
          { move: "d2-d3", color: "w", comment: "7.d3 — Apoia o peão e4 e abre o Bispo c1.", label: "Brancas" },
          { move: "f6-h5", color: "b", comment: "7...Ch5 — Cavalo na borda, defendendo o peão f4.", label: "Pretas" },
          { move: "f3-h4", color: "w", comment: "8.Ch4 — Anderssen ataca o cavalo h5.", label: "Brancas" },
          { move: "h6-g5", color: "b", comment: "8...Dg5 — Dama vai pra g5.", label: "Pretas" },
          { move: "h4-f5", color: "w", comment: "9.Cf5 — Cavalo voa pra casa central, atacando a Dama!", label: "Brancas" },
          { move: "c7-c6", color: "b", comment: "9...c6 — Pretas atacam o Bispo b5.", label: "Pretas" },
          { move: "g2-g4", color: "w", comment: "10.g4 — Anderssen avança peão, atacando o cavalo h5.", label: "Brancas" },
          { move: "h5-f6", color: "b", comment: "10...Cf6 — Cavalo recua.", label: "Pretas" },
          { move: "h1-g1", color: "w", comment: "11.Tg1!! — Anderssen IGNORA a ameaça ao Bispo b5! Sacrifício!", label: "Brancas" },
          { move: "c6-b5", color: "b", comment: "11...cxb5 — Pretas capturam o Bispo. Estão com peça a mais.", label: "Pretas" },
          { move: "h2-h4", color: "w", comment: "12.h4 — Anderssen continua atacando, ignorando o material!", label: "Brancas" },
          { move: "g5-g6", color: "b", comment: "12...Dg6 — Dama recua.", label: "Pretas" },
          { move: "h4-h5", color: "w", comment: "13.h5 — Avança o peão expulsando a Dama.", label: "Brancas" },
          { move: "g6-g5", color: "b", comment: "13...Dg5 — Dama recua de novo.", label: "Pretas" },
          { move: "d1-f3", color: "w", comment: "14.Df3 — Anderssen desenvolve a Dama com ameaças duplas.", label: "Brancas" },
          { move: "f6-g8", color: "b", comment: "14...Cg8 — Pretas têm que recuar feio para defender.", label: "Pretas" },
          { move: "c1-f4", color: "w", comment: "15.Bxf4 — Anderssen captura o peão e desenvolve o Bispo.", label: "Brancas" },
          { move: "g5-f6", color: "b", comment: "15...Df6 — Dama tenta forçar troca.", label: "Pretas" },
          { move: "b1-c3", color: "w", comment: "16.Cc3 — Anderssen desenvolve seu último cavalo. TODAS as peças ativas.", label: "Brancas" },
          { move: "f8-c5", color: "b", comment: "16...Bc5 — Pretas finalmente desenvolvem o Bispo.", label: "Pretas" },
          { move: "c3-d5", color: "w", comment: "17.Cd5 — Cavalo invasor no centro, atacando a Dama!", label: "Brancas" },
          { move: "f6-b2", color: "b", comment: "17...Dxb2 — Pretas capturam peão b2 e ameaçam a Torre a1.", label: "Pretas" },
          { move: "f4-d6", color: "w", comment: "18.Bd6!! — Anderssen IGNORA a ameaça às duas Torres! O sacrifício duplo!", label: "Brancas" },
          { move: "b2-a1", color: "b", comment: "18...Dxa1+ — Pretas capturam uma Torre dando xeque! Material vantajoso ENORME.", label: "Pretas" },
          { move: "f1-e2", color: "w", comment: "19.Re2 — Rei foge. Anderssen sacrificou DUAS Torres + um Bispo.", label: "Brancas" },
          { move: "b8-a6", color: "b", comment: "19...Ca6 — Pretas tentam defender g7 (mate ameaçado).", label: "Pretas" },
          { move: "f5-g7", color: "w", comment: "20.Nxg7+ — Cavalo captura, dando xeque!", label: "Brancas" },
          { move: "e8-d8", color: "b", comment: "20...Kd8 — Rei foge.", label: "Pretas" },
          { move: "f3-f6", color: "w", comment: "21.Df6+!! — SACRIFÍCIO DA DAMA! Anderssen oferece a peça mais valiosa!", label: "Brancas" },
          { move: "g8-f6", color: "b", comment: "21...Nxf6 — Pretas capturam a Dama. Mas estão presas...", label: "Pretas" },
          { move: "d6-e7", color: "w", comment: "22.Be7# — XEQUE-MATE! Bispo + Cavalo + peão dão mate. Anderssen ganhou com 3 peças menores, sem Dama, sem Torres!", label: "Brancas",
            arrows: [arrow("e7", "d8", C.rose)],
          },
        ]),
      },
      {
        type: "explain",
        titulo: "Por que essa partida é IMORTAL",
        texto: "Anderssen sacrificou: 1 Bispo, 2 Torres, 1 Dama — material que valeria 21 pontos. E ainda assim deu mate! Foi a primeira partida do tipo 'romântico' tão extrema. 4 anos depois, o austríaco Falkbeer a apelidou de 'Imortal'. Até hoje é uma das partidas mais estudadas da história.",
      },
      {
        type: "explain",
        titulo: "Quer ver com mais comentários?",
        texto: "No Lichess você pode reproduzir a partida com explicações detalhadas, e há vídeos ótimos no YouTube em português também.",
        link: { url: "https://www.youtube.com/results?search_query=partida+imortal+anderssen+comentada", label: "Buscar no YouTube" },
      },
      {
        type: "complete",
        titulo: "Aula 24 concluída! 🎉",
        texto: "Você conheceu uma das obras-primas do xadrez. Próxima aula: outra partida famosa, esta jogada na ÓPERA por Paul Morphy!",
      },
    ]
  },

  // ═══════════════════════ AULA 25: PARTIDA NA ÓPERA ═══════════════════════
  {
    n: 25, titulo: "A Partida da Ópera", subtitulo: "Morphy, Paris 1858",
    capitulo: "Partidas Clássicas",
    slides: [
      {
        type: "intro",
        titulo: "Uma noite na Ópera de Paris",
        texto: "1858. Paul Morphy, um americano de 21 anos considerado o melhor jogador do mundo, foi à Ópera de Paris com amigos aristocratas. No intervalo, dois nobres (o Duque de Brunswick e o Conde de Isouard) o desafiaram para uma partida. Morphy jogou — e ouvia a ópera ao fundo! Em apenas 17 lances, ele deu mate.",
      },
      {
        type: "explain",
        titulo: "Por que esta partida é especial",
        texto: "Esta partida é perfeita para iniciantes porque mostra TODOS OS PRINCÍPIOS DA ABERTURA: controle do centro, desenvolvimento rápido, roque, e ataque ao rei descoberto. Aperte 'Tocar tudo' no próximo slide e veja a magia acontecer — ou clique nas setas pra avançar lance a lance no seu ritmo.",
      },
      {
        type: "gameReplay",
        titulo: "A Partida da Ópera lance a lance",
        moves: buildGameMoves(startingBoard(), [
          { move: "e2-e4", color: "w", comment: "1.e4 — Morphy abre com o peão central. O lance mais clássico do mundo.", label: "Brancas" },
          { move: "e7-e5", color: "b", comment: "1...e5 — Pretas espelham, ocupando o centro.", label: "Pretas" },
          { move: "g1-f3", color: "w", comment: "2.Cf3 — Morphy desenvolve o cavalo e ataca o peão e5.", label: "Brancas" },
          { move: "d7-d6", color: "b", comment: "2...d6 — Pretas defendem o peão de modo passivo. Esta é a Defesa Philidor. Cc6 seria mais ativo.", label: "Pretas" },
          { move: "d2-d4", color: "w", comment: "3.d4 — Morphy ataca o centro. Pressão máxima desde o começo.", label: "Brancas" },
          { move: "c8-g4", color: "b", comment: "3...Bg4 — Pretas cravam o cavalo de Morphy. Parece bom, mas perde tempo.", label: "Pretas" },
          { move: "d4-e5", color: "w", comment: "4.dxe5 — Morphy captura o peão e5, expondo um problema.", label: "Brancas" },
          { move: "g4-f3", color: "b", comment: "4...Bxf3 — Pretas precisam capturar o cavalo, senão perdem material.", label: "Pretas" },
          { move: "d1-f3", color: "w", comment: "5.Dxf3 — Morphy recaptura com a Dama. As pretas já trocaram um Bispo por Cavalo.", label: "Brancas" },
          { move: "d6-e5", color: "b", comment: "5...dxe5 — Pretas recuperam o peão. Material igual, mas Morphy tem MELHOR desenvolvimento.", label: "Pretas" },
          { move: "f1-c4", color: "w", comment: "6.Bc4 — Morphy desenvolve o Bispo apontando para f7, o ponto fraco preto. Ameaça de mate iminente!", label: "Brancas" },
          { move: "g8-f6", color: "b", comment: "6...Cf6 — Pretas defendem f7 com o cavalo, atacando a Dama branca.", label: "Pretas" },
          { move: "f3-b3", color: "w", comment: "7.Db3 — Morphy joga a Dama para b3, atacando b7 E mantendo a pressão sobre f7.", label: "Brancas" },
          { move: "d8-e7", color: "b", comment: "7...De7 — Pretas defendem com a Dama, mas bloqueiam o próprio Bispo de f8. Posição feia.", label: "Pretas" },
          { move: "b1-c3", color: "w", comment: "8.Cc3 — Morphy desenvolve o último cavalo. Princípio: complete o desenvolvimento ANTES de atacar.", label: "Brancas" },
          { move: "c7-c6", color: "b", comment: "8...c6 — Pretas defendem b7 e tentam respirar.", label: "Pretas" },
          { move: "c1-g5", color: "w", comment: "9.Bg5 — Morphy desenvolve o último Bispo, cravando o cavalo preto. TODAS as peças de Morphy estão ativas.", label: "Brancas" },
          { move: "b7-b5", color: "b", comment: "9...b5 — Pretas tentam expulsar o Bispo branco. Lance desesperado.", label: "Pretas" },
          { move: "c3-b5", color: "w", comment: "10.Cxb5! — SACRIFÍCIO de Cavalo! Morphy aceita perder material para abrir as linhas.", label: "Brancas" },
          { move: "c6-b5", color: "b", comment: "10...cxb5 — Pretas capturam. Agora ficam com peça a mais... mas em apuros.", label: "Pretas" },
          { move: "c4-b5", color: "w", comment: "11.Bxb5+ — Xeque! O Bispo captura o peão e ataca o Rei preto.", label: "Brancas" },
          { move: "b8-d7", color: "b", comment: "11...Cbd7 — Pretas bloqueiam o xeque com o cavalo. Mas agora o cavalo está cravado.", label: "Pretas" },
          { move: "O-O-O", color: "w", comment: "12.O-O-O — Morphy faz o ROQUE GRANDE! Rei seguro e Torre na coluna 'd' atacando o cavalo cravado!", label: "Brancas" },
          { move: "a8-d8", color: "b", comment: "12...Td8 — Pretas defendem o cavalo com a Torre.", label: "Pretas" },
          { move: "d1-d7", color: "w", comment: "13.Txd7! — SACRIFÍCIO de Torre! Morphy quer destruir a defesa preta.", label: "Brancas" },
          { move: "d8-d7", color: "b", comment: "13...Txd7 — Pretas capturam a Torre. Estão com 2 peças a mais!", label: "Pretas" },
          { move: "h1-d1", color: "w", comment: "14.Td1 — Morphy traz a OUTRA Torre para a coluna 'd'. Ataque dobrado.", label: "Brancas" },
          { move: "e7-e6", color: "b", comment: "14...De6 — Pretas tentam aliviar a pressão e oferecer troca de Damas.", label: "Pretas" },
          { move: "b5-d7", color: "w", comment: "15.Bxd7+ — Xeque! O Bispo captura a Torre cravada.", label: "Brancas" },
          { move: "f6-d7", color: "b", comment: "15...Cxd7 — O cavalo recaptura. Pretas agora estão sufocadas.", label: "Pretas" },
          { move: "b3-b8", color: "w", comment: "16.Db8+!! — SACRIFÍCIO de DAMA! Morphy força o cavalo a capturar.", label: "Brancas" },
          { move: "d7-b8", color: "b", comment: "16...Cxb8 — Pretas capturam a Dama. Mas agora não tem como impedir o mate!", label: "Pretas" },
          { move: "d1-d8", color: "w", comment: "17.Td8# — XEQUE-MATE! A Torre dá mate, defendida pelo Bispo. Em 17 lances, Morphy ganhou contra DOIS adversários!", label: "Brancas",
            arrows: [arrow("d8", "e8", C.rose)],
          },
        ]),
      },
      {
        type: "explain",
        titulo: "O que aprender desta partida",
        texto: "1) DESENVOLVIMENTO: Morphy tirou todas as peças nos primeiros 9 lances\n2) ROQUE: ele protegeu o Rei rapidamente\n3) ATIVIDADE: cada peça tinha um propósito\n4) SACRIFÍCIOS: trocou material por TEMPO e POSIÇÃO\n5) TUDO PARA O REI: o ataque inteiro foi coordenado",
      },
      {
        type: "explain",
        titulo: "Quer ver mais comentado?",
        texto: "Há vídeos ótimos no YouTube em português comentando essa partida. Procure 'Partida da Ópera Morphy comentada' e você acha. Essa partida é estudada por iniciantes pelo mundo todo há mais de 150 anos.",
        link: { url: "https://www.youtube.com/results?search_query=partida+da+%C3%B3pera+morphy+comentada", label: "Buscar no YouTube" },
      },
      {
        type: "complete",
        titulo: "Aula 25 concluída! 🎉",
        texto: "Você acabou de ver a partida mais didática da história do xadrez! Próxima aula: a Abertura Italiana — agora você vai aprender a APLICAR esses princípios.",
      },
    ]
  },

  // ═══════════════════════ AULA 26: ABERTURA ITALIANA ═══════════════════════
  {
    n: 26, titulo: "Abertura Italiana", subtitulo: "Sua primeira abertura",
    capitulo: "Aberturas",
    slides: [
      {
        type: "intro",
        titulo: "Hora de aprender uma abertura",
        texto: "Você já viu princípios gerais. Agora vamos aprender uma abertura ESPECÍFICA — a Italiana. É uma das mais antigas (séc. XVI!) e melhores para iniciantes. Você vai poder usar em todas as suas partidas.",
      },
      {
        type: "gameReplay",
        titulo: "A Italiana lance a lance",
        moves: buildGameMoves(startingBoard(), [
          { move: "e2-e4", color: "w", comment: "1.e4 — Brancas ocupam o centro. Lance clássico.", label: "Brancas" },
          { move: "e7-e5", color: "b", comment: "1...e5 — Pretas espelham. Posição equilibrada.", label: "Pretas" },
          { move: "g1-f3", color: "w", comment: "2.Cf3 — Brancas desenvolvem o Cavalo E atacam o peão e5.", label: "Brancas" },
          { move: "b8-c6", color: "b", comment: "2...Cc6 — Pretas defendem o peão com o Cavalo. Tudo desenvolvendo.", label: "Pretas" },
          { move: "f1-c4", color: "w", comment: "3.Bc4 — O 'Bispo Italiano'! Aponta para f7, ponto fraco preto. É daqui que vem o nome 'Italiana'.", label: "Brancas",
            arrows: [arrow("c4", "f7", C.gold)],
          },
          { move: "f8-c5", color: "b", comment: "3...Bc5 — Pretas espelham, Bispo aponta para f2. Posição chamada 'Giuoco Piano' (Jogo Tranquilo).", label: "Pretas" },
          { move: "c2-c3", color: "w", comment: "4.c3 — Brancas preparam d4 (avanço central forte).", label: "Brancas" },
          { move: "g8-f6", color: "b", comment: "4...Cf6 — Último cavalo preto desenvolvido, atacando e4.", label: "Pretas" },
          { move: "d2-d4", color: "w", comment: "5.d4 — Avanço central agressivo, abrindo o jogo.", label: "Brancas" },
          { move: "e5-d4", color: "b", comment: "5...exd4 — Pretas capturam.", label: "Pretas" },
          { move: "c3-d4", color: "w", comment: "6.cxd4 — Brancas recapturam, formando um centro de peões forte.", label: "Brancas" },
          { move: "c5-b4", color: "b", comment: "6...Bb4+ — Pretas dão xeque. Brancas precisam responder.", label: "Pretas" },
          { move: "b1-c3", color: "w", comment: "7.Cc3 — Bloqueia o xeque desenvolvendo o cavalo. Posição rica e equilibrada.", label: "Brancas" },
          { move: "O-O", color: "w", comment: "Em poucos lances mais, brancas farão o roque pequeno (mostrado aqui pulando à frente). O Rei fica em segurança no canto.", label: "Hipotético: roque" },
        ]),
      },
      {
        type: "explain",
        titulo: "Por que aprender a Italiana",
        texto: "É didática: ensina os princípios de abertura na prática. Você desenvolve cavalos primeiro, depois bispos, faz o roque cedo. Não precisa decorar 20 lances — só 4 ou 5 e você já está bem. Use essa abertura em todas as suas primeiras partidas no Lichess.",
      },
      {
        type: "explain",
        titulo: "Quer praticar agora?",
        texto: "Abra o Lichess e jogue uma partida contra o computador no nível 1. Comece com 1.e4 e siga os lances que você acabou de ver. Se errar, sem problema — analise depois.",
        link: { url: "https://lichess.org/setup/ai?lang=pt-BR", label: "Praticar no Lichess agora" },
      },
      {
        type: "complete",
        titulo: "Aula 26 concluída! 🎉",
        texto: "Sua primeira abertura está dominada! Próxima aula: a Defesa Siciliana, a mais popular do mundo profissional.",
      },
    ]
  },

  // ═══════════════════════ AULA 27: DEFESA SICILIANA ═══════════════════════
  {
    n: 27, titulo: "Defesa Siciliana", subtitulo: "A defesa mais popular do mundo",
    capitulo: "Aberturas",
    slides: [
      {
        type: "intro",
        titulo: "Quando você joga de pretas",
        texto: "Quando você é pretas, e brancas jogam 1.e4, você precisa decidir: aceito 1...e5 (simétrico) ou jogo algo diferente? A Siciliana (1...c5) é a defesa MAIS popular nos altos níveis. Magnus Carlsen, Kasparov, Fischer — todos jogam.",
      },
      {
        type: "gameReplay",
        titulo: "A Siciliana lance a lance",
        moves: buildGameMoves(startingBoard(), [
          { move: "e2-e4", color: "w", comment: "1.e4 — Brancas abrem com peão central, igual à Italiana.", label: "Brancas" },
          { move: "c7-c5", color: "b", comment: "1...c5 — Pretas NÃO espelham! Atacam o centro pela diagonal. Esta é a Siciliana.", label: "Pretas" },
          { move: "g1-f3", color: "w", comment: "2.Cf3 — Brancas desenvolvem o cavalo, preparando d4.", label: "Brancas" },
          { move: "d7-d6", color: "b", comment: "2...d6 — Pretas preparam o desenvolvimento. Esta é a entrada da variante 'Najdorf', a mais famosa.", label: "Pretas" },
          { move: "d2-d4", color: "w", comment: "3.d4 — Brancas atacam o centro forçando troca.", label: "Brancas" },
          { move: "c5-d4", color: "b", comment: "3...cxd4 — Pretas capturam, abrindo a coluna 'c' para sua Torre futura.", label: "Pretas" },
          { move: "f3-d4", color: "w", comment: "4.Cxd4 — Brancas recapturam com cavalo. Centro aberto.", label: "Brancas" },
          { move: "g8-f6", color: "b", comment: "4...Cf6 — Pretas desenvolvem cavalo atacando o peão e4.", label: "Pretas" },
          { move: "b1-c3", color: "w", comment: "5.Cc3 — Brancas defendem e4 com o segundo cavalo.", label: "Brancas" },
          { move: "a7-a6", color: "b", comment: "5...a6 — A famosa variante Najdorf! Prepara b5 e expansão pelo flanco da Dama.", label: "Pretas" },
        ]),
      },
      {
        type: "explain",
        titulo: "Por que a Siciliana é boa",
        texto: "Ela dá às pretas: 1) controle assimétrico do centro; 2) coluna 'c' semiaberta para a Torre; 3) jogo agressivo e dinâmico. NÃO é defesa passiva — é uma defesa que LUTA pela vitória.",
      },
      {
        type: "explain",
        titulo: "Aviso: é complexa",
        texto: "A Siciliana tem MUITAS variantes — Najdorf, Dragão, Scheveningen, Sveshnikov... Para começar, recomendo: jogue a Italiana de brancas, e a Siciliana só quando for de pretas e quiser variar. Mas como Magnus Carlsen joga muito, vale conhecer.",
      },
      {
        type: "explain",
        titulo: "Pratique no Lichess",
        texto: "No Lichess, abra uma partida e quando você for de pretas e o computador jogar 1.e4, responda com 1...c5. Veja o que acontece e use sua intuição. Errar faz parte!",
        link: { url: "https://lichess.org/setup/ai?lang=pt-BR", label: "Praticar no Lichess" },
      },
      {
        type: "complete",
        titulo: "Aula 27 concluída! 🎉",
        texto: "Você conheceu a Siciliana, a defesa mais popular do mundo. Próxima aula: como reproduzir no tabuleiro de verdade!",
      },
    ]
  },

  // ═══════════════════════ AULA 28: TABULEIRO REAL ═══════════════════════
  {
    n: 28, titulo: "No Tabuleiro de Verdade", subtitulo: "Como sair do celular para o jogo físico",
    capitulo: "Pratique",
    slides: [
      {
        type: "intro",
        titulo: "Hora de pegar peças de verdade!",
        texto: "Aprender no celular é ótimo, mas o xadrez fica MUITO MAIS GOSTOSO em um tabuleiro físico. Vamos ver como fazer essa transição.",
      },
      {
        type: "explain",
        titulo: "Onde comprar tabuleiro",
        texto: "Tabuleiros simples custam de R$ 30 a R$ 100. Você acha em: Mercado Livre, Amazon, Shopee, livrarias maiores (Cultura, Saraiva), e algumas papelarias. Para começar, qualquer um serve — preto e branco, com peças simples.",
      },
      {
        type: "explain",
        titulo: "Lembre-se da regra de ouro",
        texto: "Ao montar: 'casa CLARA à direita' (lembra da Aula 1?). Cada jogador deve ter uma casa clara no canto inferior direito. Se montar errado, peças vão sair erradas também! Olhe: o canto inferior direito (h1) é claro.",
        board: emptyBoard(),
        highlights: hl("h1"),
      },
      {
        type: "explain",
        titulo: "Posicionamento das peças",
        texto: "Da esquerda para a direita na sua fileira de trás:\nTorre, Cavalo, Bispo, DAMA, Rei, Bispo, Cavalo, Torre.\n\nDama na sua cor (branca em casa branca, preta em preta). Rei na casa que sobra. Olhe a posição inicial completa abaixo — exatamente assim no tabuleiro físico.",
        board: startingBoard(),
      },
      {
        type: "explain",
        titulo: "Quem joga primeiro?",
        texto: "Brancas SEMPRE começam. Para escolher quem joga de brancas, costuma-se: uma pessoa esconde 1 peão branco em uma mão e 1 preto na outra; a outra escolhe.",
      },
      {
        type: "explain",
        titulo: "Use este app no celular ao lado",
        texto: "Truque legal: deixe este app aberto no celular ao lado do tabuleiro. Faça os puzzles aqui e RECRIE no tabuleiro real. Ajuda muito a fixar as posições.",
      },
      {
        type: "explain",
        titulo: "Convidando alguém para jogar",
        texto: "Convide o Victor, suas amigas, vizinhos. No começo, jogue partidas SEM relógio — sem pressão de tempo. O importante é divertir e pensar com calma.",
      },
      {
        type: "complete",
        titulo: "Aula 28 concluída! 🎉",
        texto: "Você está pronta para o tabuleiro físico! Próxima aula: como jogar online (Lichess), grátis, em português, no nível certo para iniciantes.",
      },
    ]
  },

  // ═══════════════════════ AULA 29: JOGAR ONLINE ═══════════════════════
  {
    n: 29, titulo: "Jogando no Lichess", subtitulo: "Computador no nível ideal",
    capitulo: "Pratique",
    slides: [
      {
        type: "intro",
        titulo: "Lichess.org: melhor amigo do iniciante",
        texto: "Lichess é um site GRATUITO, em português, sem propaganda, onde você pode jogar contra o computador no nível que quiser — do mais fácil (1) ao mais difícil (8). Recomendo começar no nível 1 ou 2.",
        link: { url: "https://lichess.org/?lang=pt-BR", label: "Abrir Lichess.org" },
      },
      {
        type: "explain",
        titulo: "Como acessar",
        texto: "Toque no botão dourado abaixo para abrir o Lichess agora mesmo. Ele abre numa nova aba — você pode ir e voltar entre o curso e o jogo. Não precisa criar conta para jogar.",
        link: { url: "https://lichess.org/?lang=pt-BR", label: "Abrir Lichess.org" },
      },
      {
        type: "explain",
        titulo: "Configurando uma partida",
        texto: "Quando o Lichess abrir:\n1) Toque em 'JOGAR' no topo\n2) Escolha 'Contra o computador'\n3) Em 'NÍVEL', escolha 1 (mais fácil)\n4) 'Tempo' — escolha 'Ilimitado' (sem pressão)\n5) Toque em 'JOGAR'",
        link: { url: "https://lichess.org/setup/ai?lang=pt-BR", label: "Ir direto para 'Jogar contra computador'" },
      },
      {
        type: "explain",
        titulo: "Dicas para a primeira partida",
        texto: "1) Aplique a abertura Italiana: 1.e4, 2.Cf3, 3.Bc4\n2) Faça o roque cedo\n3) Não traga a Dama no começo\n4) Pense ANTES de cada lance — qual peça pode ser capturada?\n5) Se errar, sem problema. Cada partida ensina algo.",
      },
      {
        type: "explain",
        titulo: "Use a 'análise' depois",
        texto: "Depois de cada partida, o Lichess mostra um botão 'Análise do computador'. Ele aponta seus erros e sugere lances melhores. É como ter um professor particular grátis!",
      },
      {
        type: "explain",
        titulo: "Outros modos legais",
        texto: "Lichess também tem:\n• Quebra-cabeças (puzzles) — milhares, no seu nível\n• Aprenda — lições interativas\n• Estudos — coleções de aberturas e finais\n\nTudo grátis.",
        link: { url: "https://lichess.org/training?lang=pt-BR", label: "Resolver puzzles agora" },
      },
      {
        type: "complete",
        titulo: "Aula 29 concluída! 🎉",
        texto: "Agora você sabe onde jogar de verdade! Lichess é o caminho. Última aula: encerramento e seus próximos passos.",
      },
    ]
  },

  // ═══════════════════════ AULA 30: ENCERRAMENTO ═══════════════════════
  {
    n: 30, titulo: "Sua Jornada Continua", subtitulo: "Encerramento e próximos passos",
    capitulo: "Pratique",
    slides: [
      {
        type: "intro",
        titulo: "Você chegou ao fim do curso! 🏆",
        texto: "30 aulas. Do tabuleiro vazio até partidas históricas. Sua dedicação me deixa muito orgulhoso. Você aprendeu uma habilidade complexa, com paciência, e agora pode jogar e se divertir pelo resto da vida.",
      },
      {
        type: "explain",
        titulo: "O que você sabe agora",
        texto: "✓ Todas as 6 peças e seus movimentos\n✓ Capturas, xeque, xeque-mate, roque\n✓ Princípios de abertura\n✓ Táticas: garfo, cravada\n✓ Finais: Rei + Dama, Rei + Torre\n✓ Resolver puzzles de mate em 1\n✓ Duas partidas históricas (Imortal e Ópera)\n✓ Abertura Italiana e Defesa Siciliana\n✓ Como jogar de verdade no tabuleiro físico e online",
      },
      {
        type: "explain",
        titulo: "Como continuar evoluindo",
        texto: "1) JOGUE no Lichess pelo menos 1 partida por dia\n2) Resolva 5 puzzles por dia (no Lichess, seção 'Quebra-cabeças')\n3) Veja vídeos no YouTube — canal 'Xadrez Brasil' tem partidas comentadas\n4) Convide o Victor pra jogar :)",
        link: { url: "https://lichess.org/?lang=pt-BR", label: "Jogar no Lichess agora" },
      },
      {
        type: "explain",
        titulo: "Seu rating evoluirá com o tempo",
        texto: "No Lichess, você ganha um 'rating' (pontuação) baseado nas partidas. Iniciantes começam em ~800. Em 6 meses jogando regularmente, você pode chegar em 1200-1400. Mas isso é DETALHE — o importante é se divertir!",
      },
      {
        type: "explain",
        titulo: "Lembre sempre",
        texto: "Xadrez é jogo, não obrigação. Se cansar, pare e volte amanhã. Se perder, sorri e recomece. Os melhores jogadores do mundo perderam MILHARES de partidas — faz parte. O que importa é a alegria de pensar e descobrir coisas novas no tabuleiro.",
      },
      {
        type: "complete",
        titulo: "🎉 Curso concluído! 🎉",
        texto: "Parabéns, vovó! ❤️\n\nVocê é incrível. Aprender xadrez aos 72 anos é uma das coisas mais legais que alguém pode fazer. Espero que esse curso seja só o começo de uma longa amizade com este jogo lindo.\n\nUm beijo enorme do seu filho que te ama,\nVictor",
      },
    ]
  },
];
// ───────────────────────── HEADER ─────────────────────────
function Header({ onHome, onMenu, voiceEnabled, onToggleVoice, isMobile, currentTitle, onUnlockVoice }) {
  return (
    <header style={{
      backgroundColor: C.parchment,
      borderBottom: `1px solid ${C.creamDark}`,
      padding: isMobile ? "10px 12px" : "14px 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 50,
      boxShadow: "0 1px 8px rgba(44,31,15,0.08)",
    }}>
      <button
        onClick={() => { onUnlockVoice?.(); onMenu(); }}
        style={{
          background: "transparent", border: "none", cursor: "pointer",
          color: C.sepiaDeep, padding: 8,
          display: "flex", alignItems: "center", gap: 6,
          WebkitTapHighlightColor: "transparent",
          minWidth: 44, minHeight: 44,
        }}
      >
        <Menu size={24}/>
        {!isMobile && <span style={{ fontFamily: "Crimson Text, serif", fontSize: 16 }}>Aulas</span>}
      </button>

      <div style={{
        flex: 1, textAlign: "center",
        fontFamily: "Cormorant Garamond, serif",
        color: C.ink, fontWeight: 600,
        fontSize: isMobile ? 17 : 20,
        padding: "0 8px",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {currentTitle || "Professor de Xadrez"}
      </div>

      <button
        onClick={() => { onUnlockVoice?.(); onToggleVoice(); }}
        style={{
          background: voiceEnabled ? C.moss : "transparent",
          color: voiceEnabled ? C.cream : C.sepia,
          border: `2px solid ${voiceEnabled ? C.moss : C.sepia}`,
          borderRadius: 22, padding: isMobile ? "6px 10px" : "8px 14px",
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          fontFamily: "Crimson Text, serif", fontSize: 13,
          WebkitTapHighlightColor: "transparent",
          minHeight: 40,
        }}
      >
        {voiceEnabled ? <Volume2 size={16}/> : <VolumeX size={16}/>}
        {!isMobile && (voiceEnabled ? "Voz" : "Mudo")}
      </button>
    </header>
  );
}

// ───────────────────────── MODAL DE CONFIRMAÇÃO ─────────────────────────
function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        backgroundColor: "rgba(44,31,15,0.6)",
        zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: C.cream,
          borderRadius: 18,
          padding: 28,
          maxWidth: 400, width: "100%",
          boxShadow: "0 12px 40px rgba(44,31,15,0.4)",
          border: `2px solid ${C.gold}`,
        }}
      >
        <h3 style={{
          fontFamily: "Cormorant Garamond, serif",
          fontSize: 24, color: C.ink, marginTop: 0, marginBottom: 12,
          fontWeight: 600,
        }}>
          {title}
        </h3>
        <p style={{
          fontFamily: "Crimson Text, serif",
          fontSize: 16, color: C.sepiaDeep,
          lineHeight: 1.5, marginBottom: 22,
        }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
          <button
            onClick={onConfirm}
            style={{
              backgroundColor: C.rose, color: C.cream,
              border: `2px solid ${C.sepiaDeep}`,
              borderRadius: 12, padding: "14px 18px",
              cursor: "pointer", fontSize: 16,
              fontFamily: "Crimson Text, serif", fontWeight: 500,
              WebkitTapHighlightColor: "transparent",
              minHeight: 50,
            }}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: "transparent", color: C.sepia,
              border: `2px solid ${C.sepia}`,
              borderRadius: 12, padding: "14px 18px",
              cursor: "pointer", fontSize: 16,
              fontFamily: "Crimson Text, serif",
              WebkitTapHighlightColor: "transparent",
              minHeight: 50,
            }}
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ───────────────────────── MENU LATERAL DE AULAS ─────────────────────────
function AulasMenu({ open, onClose, aulas, progress, onSelectLesson, isMobile }) {
  const [confirmReset, setConfirmReset] = useState(false);
  if (!open) return null;
  const capitulos = ["Fundamentos", "As Peças", "Básico", "Intermediário", "Avançado", "Quebra-cabeças", "Partidas Clássicas", "Aberturas", "Pratique"];
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          backgroundColor: "rgba(44,31,15,0.45)",
          zIndex: 100,
        }}
      />
      {/* Drawer */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        transition={{ type: "tween", duration: 0.25 }}
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: isMobile ? "88%" : 380,
          maxWidth: 420,
          backgroundColor: C.cream,
          zIndex: 101,
          overflowY: "auto",
          boxShadow: "4px 0 20px rgba(44,31,15,0.2)",
          padding: 20,
        }}
      >
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 16, paddingBottom: 12,
          borderBottom: `1px solid ${C.creamDark}`,
        }}>
          <div>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 22, color: C.ink, fontWeight: 600 }}>
              Suas aulas
            </div>
            <div style={{ fontFamily: "Crimson Text, serif", fontSize: 13, color: C.sepia, fontStyle: "italic" }}>
              {progress.completed.size} de {aulas.length} concluídas
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              padding: 8, color: C.sepia,
              WebkitTapHighlightColor: "transparent",
              minWidth: 44, minHeight: 44,
            }}
          >
            <X size={22}/>
          </button>
        </div>

        {capitulos.map(cap => {
          const lista = aulas.filter(a => a.capitulo === cap);
          if (lista.length === 0) return null;
          return (
            <div key={cap} style={{ marginBottom: 22 }}>
              <div style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: 12, letterSpacing: "0.25em",
                color: C.gold, textTransform: "uppercase",
                marginBottom: 8, fontWeight: 600,
              }}>
                {cap}
              </div>
              {lista.map(aula => {
                const completed = progress.isComplete(aula.n);
                const isLast = progress.lastLesson === aula.n;
                return (
                  <button
                    key={aula.n}
                    onClick={() => { onSelectLesson(aula.n); onClose(); }}
                    style={{
                      width: "100%",
                      backgroundColor: isLast ? `${C.gold}25` : (completed ? `${C.moss}15` : "transparent"),
                      border: `1px solid ${isLast ? C.gold : (completed ? C.moss : C.creamDark)}`,
                      borderRadius: 10, padding: "10px 12px",
                      marginBottom: 6, cursor: "pointer",
                      textAlign: "left",
                      display: "flex", alignItems: "center", gap: 10,
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <div style={{
                      minWidth: 28, height: 28, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700,
                      backgroundColor: completed ? C.moss : C.creamDark,
                      color: completed ? C.cream : C.sepia,
                      fontFamily: "Crimson Text, serif",
                    }}>
                      {completed ? <Check size={14} strokeWidth={3}/> : aula.n}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "Cormorant Garamond, serif", fontSize: 16,
                        color: C.ink, fontWeight: 600,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {aula.titulo}
                      </div>
                      <div style={{
                        fontFamily: "Crimson Text, serif", fontSize: 12,
                        color: C.sepia, fontStyle: "italic",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {aula.subtitulo}
                      </div>
                    </div>
                    {isLast && (
                      <div style={{
                        fontSize: 10, fontWeight: 600,
                        color: C.gold, fontFamily: "Crimson Text, serif",
                        letterSpacing: "0.1em",
                      }}>
                        AQUI
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}

        {progress.completed.size > 0 && (
          <button
            onClick={() => setConfirmReset(true)}
            style={{
              width: "100%", marginTop: 8,
              background: "transparent",
              border: `1px solid ${C.rose}`,
              color: C.rose,
              borderRadius: 10, padding: "10px",
              cursor: "pointer",
              fontFamily: "Crimson Text, serif", fontSize: 13,
              WebkitTapHighlightColor: "transparent",
              minHeight: 44,
            }}
          >
            Apagar progresso
          </button>
        )}

        {/* Botão fixo: Jogar no Lichess */}
        <div style={{
          marginTop: 24, paddingTop: 20,
          borderTop: `1px solid ${C.creamDark}`,
        }}>
          <div style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 12, letterSpacing: "0.25em",
            color: C.gold, textTransform: "uppercase",
            marginBottom: 10, fontWeight: 600,
          }}>
            Jogar de verdade
          </div>
          <a
            href="https://lichess.org/?lang=pt-BR"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              backgroundColor: C.gold, color: C.ink,
              border: `2px solid ${C.sepiaDeep}`,
              borderRadius: 12, padding: "12px",
              textDecoration: "none",
              fontSize: 15, fontFamily: "Crimson Text, serif", fontWeight: 600,
              WebkitTapHighlightColor: "transparent",
              minHeight: 48,
            }}
          >
            <ExternalLink size={16}/>
            Jogar no Lichess
          </a>
          <div style={{
            marginTop: 6, textAlign: "center",
            fontSize: 11, fontFamily: "Crimson Text, serif",
            color: C.sepia, fontStyle: "italic",
          }}>
            Grátis, em português
          </div>
        </div>
      </motion.div>
      <ConfirmModal
        open={confirmReset}
        title="Apagar todo o progresso?"
        message="Você vai perder o registro de aulas concluídas e o slide onde estava. Isto não pode ser desfeito."
        confirmLabel="Sim, apagar tudo"
        onConfirm={() => {
          progress.reset();
          setConfirmReset(false);
          onClose();
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </>
  );
}

// ───────────────────────── TELA INICIAL ─────────────────────────
function HomeScreen({ onStart, onContinue, hasProgress, completedCount, isMobile, voice }) {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: C.cream,
      backgroundImage: `radial-gradient(circle at 20% 30%, ${C.goldBright}15 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${C.moss}15 0%, transparent 50%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: isMobile ? "32px 20px" : "60px 32px",
    }}>
      <div style={{
        maxWidth: 1100, width: "100%",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr",
        gap: isMobile ? 32 : 60,
        alignItems: "center",
      }}>
        <div style={{ textAlign: isMobile ? "center" : "left" }}>
          <div style={{
            fontSize: 12, letterSpacing: "0.3em", color: C.gold,
            fontFamily: "Crimson Text, serif", marginBottom: 12,
            textTransform: "uppercase",
          }}>
            ✦ Curso completo em 30 aulas ✦
          </div>
          <h1 style={{
            fontSize: isMobile ? 48 : 72, lineHeight: 0.95, color: C.ink,
            fontFamily: "Cormorant Garamond, serif", fontWeight: 600,
            marginBottom: 20, letterSpacing: "-0.02em", marginTop: 0,
          }}>
            Professor<br/>
            <span style={{ fontStyle: "italic", color: C.moss }}>de Xadrez</span>
          </h1>
          <p style={{
            fontSize: isMobile ? 17 : 20, lineHeight: 1.5, color: C.sepiaDeep,
            fontFamily: "Crimson Text, serif", marginBottom: 28,
            maxWidth: 480, marginLeft: isMobile ? "auto" : 0, marginRight: isMobile ? "auto" : 0,
          }}>
            Um curso pensado com calma. Do tabuleiro ao xeque-mate, em 30 aulas curtas e visuais. Sem pressa, sem complicação.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-start" }}>
            {hasProgress ? (
              <BigButton variant="gold" onClick={() => { voice.unlock(); onContinue(); }} icon={<Play size={20}/>}>
                Continuar de onde parei
              </BigButton>
            ) : (
              <BigButton variant="primary" onClick={() => { voice.unlock(); onStart(); }} icon={<Play size={20}/>}>
                Começar do início
              </BigButton>
            )}
            {hasProgress && (
              <BigButton variant="secondary" onClick={() => { voice.unlock(); onStart(); }} icon={<BookOpen size={20}/>}>
                Ver todas as aulas
              </BigButton>
            )}
          </div>

          {hasProgress && (
            <div style={{
              marginTop: 24,
              fontSize: 14, color: C.sepia,
              fontFamily: "Crimson Text, serif",
              fontStyle: "italic",
            }}>
              ✓ Você já completou {completedCount} {completedCount === 1 ? "aula" : "aulas"} de 30
            </div>
          )}
        </div>

        {!isMobile && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative", transform: "rotate(-3deg)" }}>
              <ChessBoard
                board={bd({ d4: "wQ", e5: "bK", h8: "bR", a1: "wK", c6: "wN", f3: "wB" })}
                size={380}
                interactive={false}
                showCoordinates={false}
                arrows={[arrow("c6", "e5", C.gold), arrow("c6", "d4", C.gold)]}
              />
              <div style={{
                position: "absolute", bottom: -16, right: -16,
                width: 92, height: 92, borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.gold}, ${C.goldBright})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 20px rgba(184,148,90,0.4)",
                transform: "rotate(15deg)",
                border: `3px solid ${C.cream}`,
              }}>
                <div style={{ textAlign: "center", color: C.ink, fontFamily: "Cormorant Garamond, serif" }}>
                  <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1 }}>30</div>
                  <div style={{ fontSize: 10, letterSpacing: "0.1em" }}>AULAS</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// ───────────────────────── QUIZ ─────────────────────────
function QuizBlock({ pergunta, opcoes, correta, explicacao, slideIdx, answered, onAnswer, voice }) {
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Reset ao trocar de slide
  useEffect(() => {
    setSelected(null);
    setShowExplanation(false);
  }, [slideIdx]);

  // Se já tinha sido respondido (vindo do progresso), mostra explicação
  useEffect(() => {
    if (answered) {
      setShowExplanation(true);
      setSelected(correta);
    }
  }, [answered, correta]);

  function handleClick(i) {
    if (showExplanation) return;
    setSelected(i);
    setShowExplanation(true);
    const isCorrect = i === correta;
    if (isCorrect) {
      voice.speak(explicacao);
      onAnswer(true);
    } else {
      voice.speak("Não foi essa. Olhe de novo e clique na resposta certa.");
      // Não trava - permite tentar de novo
      setTimeout(() => {
        setShowExplanation(false);
        setSelected(null);
      }, 2000);
    }
  }

  return (
    <div style={{
      marginTop: 20, padding: 20,
      backgroundColor: C.parchment, borderRadius: 14,
      border: `2px solid ${C.gold}`,
    }}>
      <div style={{
        fontFamily: "Cormorant Garamond, serif", fontSize: 19,
        color: C.ink, marginBottom: 14, fontWeight: 600,
      }}>
        {pergunta}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {opcoes.map((op, i) => {
          const isSelected = selected === i;
          const isCorrect = i === correta;
          const showResult = showExplanation && isSelected;
          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              style={{
                padding: "13px 16px", borderRadius: 10,
                border: `2px solid ${
                  showResult ? (isCorrect ? C.moss : C.rose) :
                  (isSelected ? C.gold : C.creamDark)
                }`,
                backgroundColor: showResult
                  ? (isCorrect ? `${C.moss}25` : `${C.rose}25`)
                  : C.cream,
                color: C.sepiaDeep, fontSize: 15,
                fontFamily: "Crimson Text, serif",
                cursor: "pointer",
                textAlign: "left",
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                lineHeight: 1.4,
                WebkitTapHighlightColor: "transparent",
                minHeight: 48,
              }}
            >
              <span>{op}</span>
              {showResult && isCorrect && <Check size={18} color={C.moss} strokeWidth={3}/>}
              {showResult && !isCorrect && <X size={18} color={C.rose} strokeWidth={3}/>}
            </button>
          );
        })}
      </div>
      {showExplanation && answered && (
        <motion.div
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 14, padding: 12,
            backgroundColor: `${C.moss}15`, borderRadius: 8,
            fontFamily: "Crimson Text, serif", fontSize: 14,
            color: C.sepiaDeep, fontStyle: "italic",
            lineHeight: 1.5,
          }}
        >
          ✓ {explicacao}
        </motion.div>
      )}
    </div>
  );
}

// ───────────────────────── TABULEIRO DE PRÁTICA ─────────────────────────
function PracticeBoard({ slide, slideIdx, onComplete, completed, isMobile, viewport }) {
  const [board, setBoard] = useState(slide.board);
  const [feedback, setFeedback] = useState(null);

  // Tamanho calculado: cabe no celular sem cortar
  const boardSize = useMemo(() => {
    const w = viewport.w;
    if (w < 380) return Math.min(280, w - 50);
    if (w < 500) return Math.min(320, w - 50);
    if (w < 760) return 360;
    if (w < 1024) return 400;
    return 440;
  }, [viewport.w]);

  // Reset ao mudar slide
  useEffect(() => {
    setBoard(slide.board);
    setFeedback(null);
  }, [slideIdx]);

  function handleMove({ from, to, piece }) {
    const newBoard = board.map(row => [...row]);
    newBoard[to[0]][to[1]] = piece;
    newBoard[from[0]][from[1]] = null;

    if (slide.type !== "practice") {
      setBoard(newBoard);
      return;
    }

    setBoard(newBoard);

    if (slide.objetivo === "any") {
      setFeedback({ type: "success", text: "Muito bem! Você moveu a peça!" });
      onComplete();
      return;
    }
    if (slide.objetivo === "promote") {
      if (to[0] === 0 && piece.type === "P") {
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
      const text = slide.explicacaoPosMate || "Perfeito! Lance correto!";
      setFeedback({ type: "success", text: "✓ " + text });
      onComplete();
    } else {
      setFeedback({ type: "error", text: "Quase! A casa correta está marcada em verde. Tente novamente." });
      // Reseta o tabuleiro depois de um tempo para a pessoa tentar de novo
      setTimeout(() => {
        setBoard(slide.board);
        setFeedback(null);
      }, 1800);
    }
  }

  function reset() {
    setBoard(slide.board);
    setFeedback(null);
  }

  let extraHighlights = slide.highlights || [];
  if (slide.type === "practice" && slide.objetivo && typeof slide.objetivo === "object" && !completed) {
    extraHighlights = [...extraHighlights, parseSquare(slide.objetivo.to)];
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <ChessBoard
        board={board}
        onMove={handleMove}
        highlights={extraHighlights}
        arrows={slide.arrows || []}
        showCoordinates={slide.showCoordinates !== false}
        size={boardSize}
        interactive={true}
        highlightedPiece={slide.highlightedPiece}
        showLastMove={slide.showLastMove}
      />

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          style={{
            padding: "10px 16px", borderRadius: 10,
            backgroundColor: feedback.type === "success" ? `${C.moss}25`
                         : feedback.type === "error" ? `${C.rose}25` : `${C.gold}25`,
            border: `2px solid ${feedback.type === "success" ? C.moss
                              : feedback.type === "error" ? C.rose : C.gold}`,
            fontFamily: "Crimson Text, serif", fontSize: 14,
            color: C.sepiaDeep, textAlign: "center",
            maxWidth: boardSize + 20,
            lineHeight: 1.4,
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
            borderRadius: 18, padding: "6px 14px", cursor: "pointer",
            color: C.sepia, fontSize: 12, fontFamily: "Crimson Text, serif",
            display: "flex", alignItems: "center", gap: 6,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <RotateCcw size={12}/> Recomeçar
        </button>
      )}
    </div>
  );
}

// ───────────────────────── PLAYER DE AULA ─────────────────────────
// ───────────────────────── GAME REPLAY ─────────────────────────
// Mostra uma partida lance a lance, com play/pause e setas manuais.
// Slide deve ter: { type: "gameReplay", title, intro, moves: [{ board, comment, arrows?, lastMove? }] }
function GameReplay({ slide, slideIdx, isMobile, viewport, voice }) {
  const [moveIdx, setMoveIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const moves = slide.moves || [];
  const move = moves[moveIdx] || moves[0];
  const isLastMove = moveIdx === moves.length - 1;

  const boardSize = useMemo(() => {
    const w = viewport.w;
    if (w < 380) return Math.min(280, w - 50);
    if (w < 500) return Math.min(320, w - 50);
    if (w < 760) return 360;
    if (w < 1024) return 400;
    return 440;
  }, [viewport.w]);

  // Reset quando muda de slide
  useEffect(() => {
    setMoveIdx(0);
    setPlaying(false);
  }, [slideIdx]);

  // Lê comentário do lance ao avançar
  useEffect(() => {
    if (move?.comment) voice.speak(move.comment);
  }, [moveIdx, slideIdx]);

  // Auto-avanço quando playing
  useEffect(() => {
    if (!playing) return;
    if (isLastMove) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => {
      setMoveIdx(prev => prev + 1);
    }, 4500); // 4.5s por lance — tempo pra ler/ouvir
    return () => clearTimeout(t);
  }, [playing, moveIdx, isLastMove]);

  const goPrev = () => { setPlaying(false); setMoveIdx(Math.max(0, moveIdx - 1)); };
  const goNext = () => { setPlaying(false); setMoveIdx(Math.min(moves.length - 1, moveIdx + 1)); };
  const goStart = () => { setPlaying(false); setMoveIdx(0); };
  const togglePlay = () => {
    if (isLastMove) {
      setMoveIdx(0);
      setPlaying(true);
    } else {
      setPlaying(!playing);
    }
  };

  if (!move) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
      <ChessBoard
        board={move.board}
        size={boardSize}
        interactive={false}
        showCoordinates={true}
        arrows={move.arrows || []}
        showLastMove={move.lastMove}
        highlightedPiece={move.highlight}
      />

      {/* Comentário do lance atual */}
      <div style={{
        backgroundColor: C.parchment,
        border: `2px solid ${C.gold}`,
        borderRadius: 12, padding: "12px 16px",
        maxWidth: boardSize + 20, width: "100%",
      }}>
        <div style={{
          fontFamily: "Cormorant Garamond, serif",
          fontSize: 13, color: C.gold,
          letterSpacing: "0.15em", fontWeight: 600,
          marginBottom: 4,
        }}>
          LANCE {moveIdx + 1} DE {moves.length}{move.label ? ` · ${move.label}` : ""}
        </div>
        <div style={{
          fontFamily: "Crimson Text, serif",
          fontSize: 15, color: C.sepiaDeep,
          lineHeight: 1.5,
        }}>
          {move.comment}
        </div>
      </div>

      {/* Controles do replay */}
      <div style={{
        display: "flex", gap: 8, alignItems: "center",
        flexWrap: "wrap", justifyContent: "center",
      }}>
        <button
          onClick={goStart}
          aria-label="Voltar ao início"
          style={{
            backgroundColor: "transparent",
            border: `2px solid ${C.sepia}`,
            borderRadius: 12, padding: 10,
            cursor: "pointer", color: C.sepia,
            display: "flex", alignItems: "center", justifyContent: "center",
            WebkitTapHighlightColor: "transparent",
            minWidth: 44, minHeight: 44,
          }}
        >
          <SkipBack size={18}/>
        </button>
        <button
          onClick={goPrev}
          disabled={moveIdx === 0}
          aria-label="Lance anterior"
          style={{
            backgroundColor: "transparent",
            border: `2px solid ${moveIdx === 0 ? C.creamDark : C.sepia}`,
            borderRadius: 12, padding: 10,
            cursor: moveIdx === 0 ? "not-allowed" : "pointer",
            color: moveIdx === 0 ? C.creamDark : C.sepia,
            display: "flex", alignItems: "center", justifyContent: "center",
            WebkitTapHighlightColor: "transparent",
            minWidth: 44, minHeight: 44,
          }}
        >
          <ChevronLeft size={20}/>
        </button>
        <button
          onClick={togglePlay}
          aria-label={playing ? "Pausar" : "Tocar"}
          style={{
            backgroundColor: C.moss, color: C.cream,
            border: `2px solid ${C.sepiaDeep}`,
            borderRadius: 12, padding: "10px 18px",
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            fontFamily: "Crimson Text, serif", fontSize: 14, fontWeight: 600,
            WebkitTapHighlightColor: "transparent",
            minHeight: 44,
          }}
        >
          {playing ? <Pause size={18}/> : <Play size={18}/>}
          {playing ? "Pausar" : (isLastMove ? "Reiniciar" : "Tocar tudo")}
        </button>
        <button
          onClick={goNext}
          disabled={isLastMove}
          aria-label="Próximo lance"
          style={{
            backgroundColor: "transparent",
            border: `2px solid ${isLastMove ? C.creamDark : C.sepia}`,
            borderRadius: 12, padding: 10,
            cursor: isLastMove ? "not-allowed" : "pointer",
            color: isLastMove ? C.creamDark : C.sepia,
            display: "flex", alignItems: "center", justifyContent: "center",
            WebkitTapHighlightColor: "transparent",
            minWidth: 44, minHeight: 44,
          }}
        >
          <ChevronRight size={20}/>
        </button>
      </div>
    </div>
  );
}

function LessonPlayer({ aula, onComplete, onExit, voice, onMenu, isMobile, viewport, savedSlideIdx, onSlideChange, lessonProgress, onAulaTitleChange }) {
  // Garante que savedSlideIdx esteja dentro dos limites
  const safeInitialIdx = Math.min(Math.max(0, savedSlideIdx || 0), aula.slides.length - 1);
  const [slideIdx, setSlideIdx] = useState(safeInitialIdx);
  const [quizAnswered, setQuizAnswered] = useState({});
  const [practiceCompleted, setPracticeCompleted] = useState({});

  // Reset slideIdx ao trocar de aula (impede slide fora dos limites)
  useEffect(() => {
    const safe = Math.min(Math.max(0, savedSlideIdx || 0), aula.slides.length - 1);
    setSlideIdx(safe);
  }, [aula.n]);

  const slide = aula.slides[slideIdx] || aula.slides[0];
  const isLast = slideIdx === aula.slides.length - 1;

  // Persiste slide atual no progresso
  useEffect(() => {
    onSlideChange?.(slideIdx);
  }, [slideIdx]);

  // Reset estados de quiz/prática ao trocar de aula (não slide)
  useEffect(() => {
    setQuizAnswered({});
    setPracticeCompleted({});
  }, [aula.n]);

  // Auto-fala (só para slides que NÃO são gameReplay — esse cuida da própria fala por lance)
  useEffect(() => {
    if (slide?.texto && slide?.type !== "gameReplay") voice.speak(slide.texto);
    return () => voice.stop();
  }, [slideIdx, aula.n]);

  const goNext = () => {
    if (slideIdx < aula.slides.length - 1) {
      setSlideIdx(slideIdx + 1);
    } else {
      onComplete();
    }
  };
  const goPrev = () => slideIdx > 0 && setSlideIdx(slideIdx - 1);

  // BUG FIX: sempre permite avançar. Quiz/prática são opcionais.
  // O "Pular" se torna disponível em todos os slides.
  const progress = ((slideIdx + 1) / aula.slides.length) * 100;
  const hasInteraction = slide.type === "quiz" || slide.type === "practice";
  const interactionDone = slide.type === "quiz" ? quizAnswered[slideIdx] :
                          slide.type === "practice" ? practiceCompleted[slideIdx] : true;

  const showBoard = slide.board || slide.bigPiece || slide.type === "gameReplay";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.cream, display: "flex", flexDirection: "column" }}>
      <Header
        isMobile={isMobile}
        onHome={onExit}
        onMenu={onMenu}
        voiceEnabled={voice.enabled}
        onToggleVoice={() => voice.setEnabled(!voice.enabled)}
        onUnlockVoice={voice.unlock}
        currentTitle={`${aula.n}. ${aula.titulo}`}
      />

      {/* Progresso da aula */}
      <div style={{ height: 4, backgroundColor: C.creamDark, position: "relative" }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            background: `linear-gradient(90deg, ${C.moss}, ${C.gold})`,
          }}
        />
      </div>

      {/* Slide */}
      <div style={{
        flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start",
        padding: isMobile ? "20px 16px" : "32px 32px",
        overflow: "auto",
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${aula.n}-${slideIdx}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            style={{
              maxWidth: 1100, width: "100%",
              display: "grid",
              gridTemplateColumns: showBoard && !isMobile ? "1fr 1fr" : "1fr",
              gap: isMobile ? 24 : 40,
              alignItems: "start",
            }}
          >
            {/* Coluna texto */}
            <div style={{ order: isMobile && showBoard ? 2 : 1 }}>
              {slide.type === "intro" && (
                <div style={{
                  fontSize: 12, letterSpacing: "0.3em", color: C.gold,
                  fontFamily: "Crimson Text, serif", marginBottom: 10,
                  textTransform: "uppercase",
                }}>
                  ✦ Início da aula
                </div>
              )}
              {slide.type === "complete" && (
                <div style={{
                  fontSize: 12, letterSpacing: "0.3em", color: C.moss,
                  fontFamily: "Crimson Text, serif", marginBottom: 10,
                  textTransform: "uppercase",
                }}>
                  ✦ Aula concluída
                </div>
              )}
              <h2 style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: isMobile ? 30 : 40, color: C.ink, lineHeight: 1.1,
                marginBottom: 16, fontWeight: 600, marginTop: 0,
              }}>
                {slide.titulo}
              </h2>

              {slide.bigPiece && (
                <div style={{
                  display: "inline-flex", marginBottom: 18,
                  padding: 18, backgroundColor: C.parchment,
                  borderRadius: 14, border: `2px solid ${C.gold}`,
                }}>
                  <PieceSvg type={slide.bigPiece.type} color={slide.bigPiece.color} size={isMobile ? 90 : 110}/>
                </div>
              )}

              {slide.texto && (
                <p style={{
                  fontFamily: "Crimson Text, serif",
                  fontSize: isMobile ? 17 : 19, lineHeight: 1.55, color: C.sepiaDeep,
                  whiteSpace: "pre-wrap", margin: 0,
                }}>
                  {slide.texto}
                </p>
              )}

              {slide.type === "quiz" && (
                <QuizBlock
                  slideIdx={slideIdx}
                  pergunta={slide.pergunta}
                  opcoes={slide.opcoes}
                  correta={slide.correta}
                  explicacao={slide.explicacao}
                  answered={quizAnswered[slideIdx]}
                  onAnswer={(correct) => {
                    if (correct) setQuizAnswered(prev => ({ ...prev, [slideIdx]: true }));
                  }}
                  voice={voice}
                />
              )}

              {slide.link && (
                <a
                  href={slide.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    marginTop: 20, alignItems: "center", gap: 10,
                    backgroundColor: C.gold, color: C.ink,
                    border: `2px solid ${C.sepiaDeep}`,
                    borderRadius: 14, padding: "14px 22px",
                    textDecoration: "none",
                    fontSize: 16, fontFamily: "Crimson Text, serif", fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(184,148,90,0.3)",
                    WebkitTapHighlightColor: "transparent",
                    minHeight: 50,
                  }}
                >
                  <ExternalLink size={18}/>
                  {slide.link.label}
                </a>
              )}

              {voice.enabled && slide.texto && (
                <button
                  onClick={() => voice.speak(slide.texto)}
                  style={{
                    marginTop: 18, background: "transparent",
                    border: `1px solid ${C.sepia}`, borderRadius: 22,
                    padding: "8px 16px", cursor: "pointer",
                    color: C.sepia, fontSize: 13, fontFamily: "Crimson Text, serif",
                    display: "inline-flex", alignItems: "center", gap: 6,
                    WebkitTapHighlightColor: "transparent",
                    minHeight: 40,
                  }}
                >
                  <Volume2 size={14}/> Ouvir explicação
                </button>
              )}
            </div>

            {/* Coluna tabuleiro */}
            {slide.board && (
              <div style={{
                order: isMobile && showBoard ? 1 : 2,
                display: "flex", justifyContent: "center",
              }}>
                <PracticeBoard
                  slide={slide}
                  slideIdx={slideIdx}
                  onComplete={() => setPracticeCompleted(prev => ({ ...prev, [slideIdx]: true }))}
                  completed={practiceCompleted[slideIdx]}
                  isMobile={isMobile}
                  viewport={viewport}
                />
              </div>
            )}

            {/* Game Replay (partidas lance a lance) */}
            {slide.type === "gameReplay" && (
              <div style={{
                order: isMobile && showBoard ? 1 : 2,
                display: "flex", justifyContent: "center",
              }}>
                <GameReplay
                  slide={slide}
                  slideIdx={slideIdx}
                  isMobile={isMobile}
                  viewport={viewport}
                  voice={voice}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controles inferior */}
      <div style={{
        backgroundColor: C.parchment, borderTop: `1px solid ${C.creamDark}`,
        padding: isMobile ? "12px 14px" : "16px 28px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 10,
        position: "sticky", bottom: 0,
      }}>
        <button
          onClick={goPrev}
          disabled={slideIdx === 0}
          style={{
            background: "transparent",
            border: `2px solid ${slideIdx === 0 ? C.creamDark : C.sepia}`,
            borderRadius: 12, padding: isMobile ? "10px 14px" : "12px 18px",
            cursor: slideIdx === 0 ? "not-allowed" : "pointer",
            color: slideIdx === 0 ? C.creamDark : C.sepia,
            fontSize: 15, fontFamily: "Crimson Text, serif",
            display: "flex", alignItems: "center", gap: 6,
            WebkitTapHighlightColor: "transparent",
            minHeight: 44,
          }}
        >
          <ChevronLeft size={18}/>
          {!isMobile && "Anterior"}
        </button>

        <div style={{
          fontFamily: "Crimson Text, serif", color: C.sepia, fontSize: 13,
          textAlign: "center", flex: isMobile ? "0 0 auto" : 1,
        }}>
          {slideIdx + 1} / {aula.slides.length}
        </div>

        <button
          onClick={goNext}
          style={{
            backgroundColor: isLast ? C.gold : C.moss,
            color: isLast ? C.ink : C.cream,
            border: `2px solid ${C.sepiaDeep}`,
            borderRadius: 12, padding: isMobile ? "10px 16px" : "12px 22px",
            cursor: "pointer",
            fontSize: 15, fontFamily: "Crimson Text, serif",
            fontWeight: 500,
            display: "flex", alignItems: "center", gap: 6,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            WebkitTapHighlightColor: "transparent",
            minHeight: 44,
          }}
        >
          {hasInteraction && !interactionDone && !isLast ? "Pular" : (isLast ? "Concluir" : "Próximo")}
          {isLast ? <Award size={18}/> : <ChevronRight size={18}/>}
        </button>
      </div>
    </div>
  );
}

// ───────────────────────── APP PRINCIPAL ─────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [currentLesson, setCurrentLesson] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const progress = useProgress();
  const voice = useVoice();
  const viewport = useViewport();

  // Carrega vozes
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const onChange = () => {};
      window.speechSynthesis.onvoiceschanged = onChange;
      window.speechSynthesis.getVoices();
    }
  }, []);

  function startCourse() {
    setCurrentLesson(1);
    progress.setLastLesson(1, 0);
    setScreen("lesson");
  }
  function continueCourse() {
    const last = progress.lastLesson || 1;
    setCurrentLesson(last);
    setScreen("lesson");
  }
  function selectLesson(n) {
    setCurrentLesson(n);
    progress.setLastLesson(n, progress.getSlideForLesson(n));
    setScreen("lesson");
  }
  function completeLesson() {
    progress.markComplete(currentLesson);
    voice.stop();
    setMenuOpen(true); // abre menu para escolher próxima
    if (currentLesson < AULAS.length) {
      // sugere a próxima
      const next = currentLesson + 1;
      progress.setLastLesson(next, 0);
      setCurrentLesson(next);
      setScreen("lesson");
    } else {
      setScreen("home");
    }
  }
  function exitToHome() {
    voice.stop();
    setScreen("home");
  }

  if (screen === "home") {
    return (
      <>
        <HomeScreen
          onStart={startCourse}
          onContinue={continueCourse}
          hasProgress={progress.completed.size > 0 || progress.lastLesson !== null}
          completedCount={progress.completed.size}
          isMobile={viewport.isMobile}
          voice={voice}
        />
        <AulasMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          aulas={AULAS}
          progress={progress}
          onSelectLesson={selectLesson}
          isMobile={viewport.isMobile}
        />
      </>
    );
  }

  if (screen === "lesson") {
    const aula = AULAS.find(a => a.n === currentLesson);
    if (!aula) {
      setScreen("home");
      return null;
    }
    return (
      <>
        <LessonPlayer
          aula={aula}
          onComplete={completeLesson}
          onExit={exitToHome}
          voice={voice}
          onMenu={() => setMenuOpen(true)}
          isMobile={viewport.isMobile}
          viewport={viewport}
          savedSlideIdx={progress.getSlideForLesson(currentLesson)}
          onSlideChange={(idx) => progress.setLastLesson(currentLesson, idx)}
        />
        <AulasMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          aulas={AULAS}
          progress={progress}
          onSelectLesson={selectLesson}
          isMobile={viewport.isMobile}
        />
      </>
    );
  }

  return null;
}
