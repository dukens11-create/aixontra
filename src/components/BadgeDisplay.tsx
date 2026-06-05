'use client';

import { motion } from 'framer-motion';
import type { AchievementBadge, UserAchievement } from '@/lib/services/viralGrowthService';

const tierColors: Record<AchievementBadge['tier'], string> = {
  bronze: 'from-orange-700 to-orange-400 border-orange-500',
  silver: 'from-slate-500 to-slate-300 border-slate-400',
  gold: 'from-yellow-600 to-yellow-300 border-yellow-400',
  platinum: 'from-cyan-600 to-cyan-200 border-cyan-400',
  legendary: 'from-purple-700 via-pink-500 to-yellow-400 border-purple-400',
};

const tierGlow: Record<AchievementBadge['tier'], string> = {
  bronze: 'shadow-orange-500/40',
  silver: 'shadow-slate-400/40',
  gold: 'shadow-yellow-400/50',
  platinum: 'shadow-cyan-400/50',
  legendary: 'shadow-purple-500/60',
};

type BadgeDisplayProps = {
  badge: AchievementBadge;
  achievement?: UserAchievement;
  /** If true, show as locked / greyed out */
  locked?: boolean;
  /** Animate the unlock when first rendered */
  animateUnlock?: boolean;
};

export function BadgeDisplay({ badge, locked = false, animateUnlock = false }: BadgeDisplayProps) {
  const colors = tierColors[badge.tier];
  const glow = tierGlow[badge.tier];

  return (
    <motion.div
      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border ${locked ? 'opacity-40 grayscale border-border bg-card' : `bg-gradient-to-br ${colors} shadow-lg ${glow}`}`}
      initial={animateUnlock ? { scale: 0.5, opacity: 0, rotate: -10 } : false}
      animate={animateUnlock ? { scale: 1, opacity: 1, rotate: 0 } : false}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      whileHover={locked ? undefined : { scale: 1.06 }}
    >
      {/* Legendary shimmer ring */}
      {badge.tier === 'legendary' && !locked && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background:
              'conic-gradient(from 0deg, #a855f7, #ec4899, #eab308, #a855f7)',
            opacity: 0.25,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      )}

      <span className="relative text-4xl drop-shadow">{badge.icon}</span>

      <div className="relative text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-white/80">
          {badge.tier}
        </p>
        <p className="font-bold text-sm text-white leading-tight mt-0.5">{badge.name}</p>
      </div>

      {!locked && (
        <p className="relative text-xs text-white/70 text-center leading-snug">
          {badge.description}
        </p>
      )}

      {locked && (
        <p className="text-xs text-muted-foreground text-center">{badge.unlockTrigger}</p>
      )}

      <div className="relative flex items-center gap-1 mt-1">
        <span className="text-xs font-semibold text-white/80">+{badge.xpReward} XP</span>
      </div>
    </motion.div>
  );
}

type BadgeGridProps = {
  badges: AchievementBadge[];
  unlockedBadgeIds?: Set<string>;
  animateNew?: string | null; // badgeId to animate unlock for
};

export function BadgeGrid({ badges, unlockedBadgeIds, animateNew }: BadgeGridProps) {
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}
    >
      {badges.map((badge) => {
        const unlocked = !unlockedBadgeIds || unlockedBadgeIds.has(badge.id);
        return (
          <BadgeDisplay
            key={badge.id}
            badge={badge}
            locked={!unlocked}
            animateUnlock={badge.id === animateNew}
          />
        );
      })}
    </div>
  );
}
