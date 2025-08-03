interface MountainLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MountainLogo({ className = "", size = 'md' }: MountainLogoProps) {
  const sizeConfig = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeConfig[size]} ${className}`}>
      <svg 
        viewBox="0 0 40 40" 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sky background */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="100%" stopColor="#E0F6FF" />
          </linearGradient>
          <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A5568" />
            <stop offset="50%" stopColor="#2D3748" />
            <stop offset="100%" stopColor="#1A202C" />
          </linearGradient>
          <linearGradient id="mountain2Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#718096" />
            <stop offset="100%" stopColor="#4A5568" />
          </linearGradient>
        </defs>
        
        {/* Sky background circle */}
        <circle cx="20" cy="20" r="20" fill="url(#skyGradient)" />
        
        {/* Back mountain */}
        <path 
          d="M 5 30 L 15 12 L 25 18 L 35 30 Z" 
          fill="url(#mountain2Gradient)"
        />
        
        {/* Front mountain */}
        <path 
          d="M 0 32 L 12 8 L 22 15 L 28 32 Z" 
          fill="url(#mountainGradient)"
        />
        
        {/* Snow caps */}
        <path 
          d="M 10 12 L 12 8 L 14 12 Z" 
          fill="#FFFFFF" 
          opacity="0.9"
        />
        <path 
          d="M 13 15 L 15 12 L 17 15 Z" 
          fill="#FFFFFF" 
          opacity="0.7"
        />
        
        {/* Greenery/Trees */}
        <ellipse cx="8" cy="28" rx="3" ry="4" fill="#22C55E" opacity="0.8" />
        <ellipse cx="14" cy="30" rx="2.5" ry="3" fill="#16A34A" opacity="0.9" />
        <ellipse cx="20" cy="29" rx="3.5" ry="4" fill="#22C55E" opacity="0.8" />
        <ellipse cx="26" cy="31" rx="2" ry="2.5" fill="#16A34A" opacity="0.9" />
        <ellipse cx="32" cy="28" rx="2.8" ry="3.5" fill="#22C55E" opacity="0.8" />
        
        {/* Tree trunks */}
        <rect x="7.5" y="30" width="1" height="3" fill="#8B4513" />
        <rect x="13.5" y="31" width="1" height="2" fill="#8B4513" />
        <rect x="19.5" y="31" width="1" height="2.5" fill="#8B4513" />
        <rect x="25.5" y="32" width="1" height="2" fill="#8B4513" />
        <rect x="31.5" y="30" width="1" height="3" fill="#8B4513" />
        
        {/* Small details - birds */}
        <path d="M 28 8 Q 30 6 32 8" stroke="#FFFFFF" strokeWidth="0.5" fill="none" opacity="0.6" />
        <path d="M 30 10 Q 32 8 34 10" stroke="#FFFFFF" strokeWidth="0.5" fill="none" opacity="0.6" />
      </svg>
    </div>
  );
}