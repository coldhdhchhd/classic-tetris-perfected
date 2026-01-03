interface ScorePanelProps {
  score: number;
  lines: number;
  level: number;
}

export const ScorePanel = ({ score, lines, level }: ScorePanelProps) => {
  return (
    <div className="game-panel space-y-4">
      <div>
        <h3 className="text-xs text-primary neon-text mb-1">SCORE</h3>
        <p className="text-lg text-accent">{score.toLocaleString()}</p>
      </div>
      <div>
        <h3 className="text-xs text-primary neon-text mb-1">LINES</h3>
        <p className="text-lg text-foreground">{lines}</p>
      </div>
      <div>
        <h3 className="text-xs text-primary neon-text mb-1">LEVEL</h3>
        <p className="text-lg text-secondary">{level}</p>
      </div>
    </div>
  );
};
