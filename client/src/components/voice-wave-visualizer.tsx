import { motion } from "framer-motion";

interface VoiceWaveVisualizerProps {
  isActive: boolean;
  barCount?: number;
  className?: string;
}

export function VoiceWaveVisualizer({ 
  isActive, 
  barCount = 7, 
  className = "" 
}: VoiceWaveVisualizerProps) {
  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {Array.from({ length: barCount }).map((_, index) => (
        <motion.div
          key={index}
          className="w-1 bg-spotify-green rounded-full"
          initial={{ height: 8 }}
          animate={{
            height: isActive ? [8, 24, 8] : 8,
            opacity: isActive ? [0.5, 1, 0.5] : 0.3
          }}
          transition={{
            duration: 1.5,
            delay: index * 0.1,
            repeat: isActive ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}
