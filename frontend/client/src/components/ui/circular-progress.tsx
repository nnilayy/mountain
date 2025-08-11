interface CircularProgressProps {
  value: number;
  total: number;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  showFraction?: boolean;
  className?: string;
}

export function CircularProgress({ 
  value, 
  total, 
  size = 'md', 
  showPercentage = true,
  showFraction = false,
  className = "" 
}: CircularProgressProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const circumference = 2 * Math.PI * 16; // radius = 16
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const sizeConfig = {
    sm: { container: 'w-8 h-8', text: 'text-[10px]', svg: 'w-8 h-8' },
    md: { container: 'w-12 h-12', text: 'text-xs', svg: 'w-12 h-12' },
    lg: { container: 'w-16 h-16', text: 'text-sm', svg: 'w-16 h-16' }
  };
  
  const config = sizeConfig[size];
  
  return (
    <div className={`relative inline-flex items-center justify-center ${config.container} ${className}`}>
      <svg 
        className={`transform -rotate-90 ${config.svg}`} 
        viewBox="0 0 40 40"
      >
        {/* Inner background circle with green theme */}
        <circle
          cx="20"
          cy="20"
          r="12"
          fill="currentColor"
          className="text-green-100 dark:text-green-900/30"
        />
        {/* Background circle */}
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-green-500 transition-all duration-300 ease-in-out"
        />
      </svg>
      
      {/* Text overlay with green theme */}
      <div className={`absolute inset-0 flex items-center justify-center ${config.text} font-medium text-green-700 dark:text-green-300`}>
        {showFraction ? (
          <span>{value}/{total}</span>
        ) : showPercentage ? (
          <span>{percentage}%</span>
        ) : (
          <span>{value}</span>
        )}
      </div>
    </div>
  );
}