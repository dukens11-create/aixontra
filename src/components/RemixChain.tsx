'use client';

import { motion } from 'framer-motion';
import type { RemixNode } from '@/lib/services/viralGrowthService';
import { buildRemixChain } from '@/lib/services/viralGrowthService';

const depthColors = [
  'border-purple-500 bg-purple-500/10',
  'border-cyan-500 bg-cyan-500/10',
  'border-green-500 bg-green-500/10',
  'border-yellow-500 bg-yellow-500/10',
  'border-pink-500 bg-pink-500/10',
];

type RemixChainProps = {
  nodes: RemixNode[];
  /** Song ID to highlight */
  highlightSongId?: string;
};

export function RemixChainView({ nodes, highlightSongId }: RemixChainProps) {
  const chain = buildRemixChain(nodes);

  // Group by depth for a tree-like display
  const byDepth: Map<number, RemixNode[]> = new Map();
  for (const node of chain.nodes) {
    const arr = byDepth.get(node.depth) ?? [];
    arr.push(node);
    byDepth.set(node.depth, arr);
  }

  const maxDepth = chain.totalDepth;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>🔀 Remix chain — {nodes.length} tracks · {maxDepth} generation{maxDepth !== 1 ? 's' : ''} deep</span>
      </div>

      {/* Depth levels */}
      {Array.from({ length: maxDepth + 1 }, (_, depth) => {
        const levelNodes = byDepth.get(depth) ?? [];
        const colorClass = depthColors[depth % depthColors.length];
        return (
          <div key={depth} className="flex flex-col gap-2">
            {/* Connector arrow */}
            {depth > 0 && (
              <div className="flex items-center gap-2 pl-6">
                <div className="h-px w-4 bg-border" />
                <span className="text-xs text-muted-foreground">Gen {depth}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}

            <div className="flex flex-wrap gap-2 pl-4">
              {levelNodes.map((node) => (
                <motion.div
                  key={node.songId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: depth * 0.08 }}
                  className={`flex flex-col gap-1 rounded-xl border px-3 py-2 text-sm max-w-xs ${colorClass} ${node.songId === highlightSongId ? 'ring-2 ring-primary' : ''}`}
                >
                  <span className="font-semibold truncate">{node.title}</span>
                  <span className="text-xs text-muted-foreground">by {node.creatorName}</span>
                  {node.parentSongId && (
                    <span className="text-xs text-muted-foreground/60">
                      remixed from: {nodes.find((n) => n.songId === node.parentSongId)?.title ?? node.parentSongId}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
