import { useMemo } from 'react';
import { getThemeForLevel } from '@/hooks/useTetris';

interface StarBackgroundProps {
  level: number;
}

export const StarBackground = ({ level }: StarBackgroundProps) => {
  const theme = getThemeForLevel(level);
  
  const stars = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 2}s`,
    }));
  }, []);

  return (
    <>
      {/* Gradient background that changes with level */}
      <div 
        className="fixed inset-0 transition-all duration-1000"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, hsl(${theme.hue} 80% 15% / 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, hsl(${theme.hue + 60} 70% 10% / 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, hsl(${theme.hue} 50% 5%) 0%, hsl(220 20% 4%) 100%)
          `,
        }}
      />
      
      {/* Grid overlay */}
      <div 
        className="fixed inset-0 opacity-[0.03] transition-opacity duration-1000"
        style={{
          backgroundImage: `
            linear-gradient(hsl(${theme.hue} 100% 50% / 0.5) 1px, transparent 1px),
            linear-gradient(90deg, hsl(${theme.hue} 100% 50% / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />
      
      {/* Stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full star"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              backgroundColor: `hsl(${theme.hue} 100% 80%)`,
              boxShadow: `0 0 ${star.size * 2}px hsl(${theme.hue} 100% 60%)`,
              '--duration': star.duration,
              '--delay': star.delay,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  );
};
