import { getThemeForLevel } from '@/hooks/useTetris';
import { cn } from '@/lib/utils';

interface ScorePanelProps {
  score: number;
  lines: number;
  level: number;
  combo: number;
  scorePop: boolean;
}

export const ScorePanel = ({ score, lines, level, combo, scorePop }: ScorePanelProps) => {
  const theme = getThemeForLevel(level);
  
  return (
    <div className="game-panel space-y-3">
      <div>
        <h3 className="text-[10px] text-primary neon-text mb-1">SCORE</h3>
        <p className={cn(
          "text-base text-accent tabular-nums",
          scorePop && "score-pop"
        )}>
          {score.toLocaleString()}
        </p>
      </div>
      <div>
        <h3 className="text-[10px] text-primary neon-text mb-1">LINES</h3>
        <p className="text-base text-foreground tabular-nums">{lines}</p>
      </div>
      <div>
        <h3 className="text-[10px] text-primary neon-text mb-1">LEVEL</h3>
        <p className="text-base text-secondary tabular-nums">{level}</p>
        <p className="text-[8px] text-muted-foreground mt-1">{theme.name}</p>
      </div>
      {combo > 1 && (
        <div>
          <h3 className="text-[10px] text-accent neon-text mb-1">COMBO</h3>
          <p className="text-base text-accent tabular-nums">x{combo}</p>
        </div>
      )}
    </div>
  );
};
