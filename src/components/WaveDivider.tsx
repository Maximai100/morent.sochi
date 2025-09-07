interface WaveDividerProps {
  className?: string;
  variant?: 'primary' | 'gold' | 'subtle';
  flip?: boolean;
}

export const WaveDivider = ({ 
  className = "", 
  variant = 'primary',
  flip = false 
}: WaveDividerProps) => {
  const getWaveColor = () => {
    switch (variant) {
      case 'gold': return '#FDBB3B';
      case 'subtle': return 'rgba(0, 108, 255, 0.1)';
      default: return '#006CFF';
    }
  };

  return (
    <div className={`relative w-full h-16 overflow-hidden ${className}`}>
      <svg 
        className={`absolute inset-0 w-full h-full ${flip ? 'rotate-180' : ''}`}
        viewBox="0 0 1200 120" 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M0,80 C150,60 350,100 500,80 C650,60 850,100 1000,80 C1100,70 1150,75 1200,80 L1200,120 L0,120 Z" 
          fill={getWaveColor()}
          fillOpacity={variant === 'subtle' ? 0.15 : 0.2}
        />
        <path 
          d="M0,100 C200,85 400,115 600,100 C750,90 900,110 1050,100 C1125,95 1162,98 1200,100 L1200,120 L0,120 Z" 
          fill={getWaveColor()}
          fillOpacity={variant === 'subtle' ? 0.08 : 0.12}
        />
      </svg>
    </div>
  );
};