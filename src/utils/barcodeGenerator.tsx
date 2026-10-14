import React from 'react';

// Code39 pattern dictionary (Standard barcode used in ID badges)
const CODE39_PATTERNS: Record<string, string> = {
  '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
  '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
  '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
  'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
  'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
  'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
  'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
  'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
  'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
  '-': '010000101', '.': '110000100', ' ': '011000100', '$': '010101000',
  '/': '010100010', '+': '010001010', '%': '000101010', '*': '010010100',
};

interface BarcodeSvgProps {
  value: string;
  width?: number;
  height?: number;
  showText?: boolean;
  className?: string;
}

export const BarcodeSvg: React.FC<BarcodeSvgProps> = ({
  value,
  width = 240,
  height = 70,
  showText = true,
  className = '',
}) => {
  // Normalize string to valid Code39 chars
  const normalized = `*${value.toUpperCase().replace(/[^A-Z0-9\-\. \$\/\+\%]/g, '')}*`;

  // Build bars: 1 = wide (3px), 0 = narrow (1.2px)
  const barElements: React.ReactNode[] = [];
  let currentX = 10;
  const narrowW = 1.6;
  const wideW = 3.6;
  const gapW = 1.4;
  const barH = showText ? height - 20 : height - 8;

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS['*'];

    for (let b = 0; b < pattern.length; b++) {
      const isBar = b % 2 === 0;
      const isWide = pattern[b] === '1';
      const w = isWide ? wideW : narrowW;

      if (isBar) {
        barElements.push(
          <rect
            key={`${i}-${b}`}
            x={currentX}
            y={4}
            width={w}
            height={barH}
            fill="#0f172a"
          />
        );
      }
      currentX += w;
    }
    currentX += gapW; // inter-character space
  }

  const totalWidth = currentX + 10;

  return (
    <div className={`inline-flex flex-col items-center bg-white p-2.5 rounded-lg shadow-sm border border-slate-200 ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        width={width}
        height={height}
        className="max-w-full"
      >
        <rect width={totalWidth} height={height} fill="#ffffff" rx={4} />
        {barElements}
      </svg>
      {showText && (
        <span className="font-mono text-xs tracking-widest font-semibold text-slate-800 mt-1 selection:bg-none">
          {value}
        </span>
      )}
    </div>
  );
};

// Compact deterministic QR Code SVG generator
// Produces standard 21x21 or 25x25 QR style visual matrix with finder patterns
export const QRCodeSvg: React.FC<{ value: string; size?: number; className?: string }> = ({
  value,
  size = 120,
  className = '',
}) => {
  // Simple deterministic visual matrix generator with standard QR corners
  const matrixSize = 25;
  const grid: boolean[][] = Array.from({ length: matrixSize }, () =>
    Array(matrixSize).fill(false)
  );

  // Helper to add Finder Pattern at (row, col)
  const addFinderPattern = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          i === 0 || i === 6 || j === 0 || j === 6 ||
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        ) {
          grid[r + i][c + j] = true;
        } else {
          grid[r + i][c + j] = false;
        }
      }
    }
  };

  // Top-left, top-right, bottom-left finders
  addFinderPattern(0, 0);
  addFinderPattern(0, matrixSize - 7);
  addFinderPattern(matrixSize - 7, 0);

  // Timing lines
  for (let i = 8; i < matrixSize - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Generate deterministic payload cells from string hash
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  let seed = hash;
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Skip finder zones
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= matrixSize - 8;
      const inBottomLeft = r >= matrixSize - 8 && c < 8;
      const inTiming = (r === 6 && (c >= 8 && c < matrixSize - 8)) || (c === 6 && (r >= 8 && r < matrixSize - 8));

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        grid[r][c] = (seed % 100) > 46;
      }
    }
  }

  const cellSize = 100 / matrixSize;

  return (
    <div className={`inline-flex flex-col items-center bg-white p-2 rounded-lg shadow-sm border border-slate-200 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="max-w-full block"
      >
        <rect width="100" height="100" fill="#ffffff" rx="4" />
        {grid.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize + 0.1}
                height={cellSize + 0.1}
                fill="#0f172a"
              />
            ) : null
          )
        )}
      </svg>
      <span className="font-mono text-[10px] tracking-wider font-semibold text-slate-700 mt-1">
        {value}
      </span>
    </div>
  );
};
