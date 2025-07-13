import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Brain, Activity } from "lucide-react";

interface BiometricSyncProps {
  userId?: number;
}

export function BiometricSync({ userId = 1 }: BiometricSyncProps) {
  const [heartRate, setHeartRate] = useState(142);
  const [emotionAccuracy, setEmotionAccuracy] = useState(97);

  useEffect(() => {
    // Simulate real-time biometric updates
    const interval = setInterval(() => {
      setHeartRate(prev => {
        const change = (Math.random() - 0.5) * 10;
        return Math.max(60, Math.min(180, prev + change));
      });
      
      setEmotionAccuracy(prev => {
        const change = (Math.random() - 0.5) * 4;
        return Math.max(85, Math.min(99, prev + change));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getHeartRateColor = (rate: number) => {
    if (rate < 100) return "text-blue-500";
    if (rate < 140) return "text-green-500";
    if (rate < 160) return "text-yellow-500";
    return "text-red-500";
  };

  const getHeartRateZone = (rate: number) => {
    if (rate < 100) return "Resting";
    if (rate < 140) return "Fat Burn";
    if (rate < 160) return "Cardio";
    return "Peak";
  };

  return (
    <div className="bg-spotify-gray/30 rounded-2xl p-6 border border-spotify-gray/20">
      <h3 className="text-lg font-semibold mb-4 text-white">Biometric Sync</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 60 / heartRate, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="w-5 h-5 text-red-500" />
              </motion.div>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Heart Rate</p>
              <p className="text-xs text-spotify-light">
                {getHeartRateZone(heartRate)} Zone
              </p>
            </div>
          </div>
          <div className="text-right">
            <motion.p
              key={heartRate}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className={`text-lg font-bold ${getHeartRateColor(heartRate)}`}
            >
              {Math.round(heartRate)}
            </motion.p>
            <p className="text-xs text-spotify-light">BPM</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-5 h-5 text-blue-500" />
              </motion.div>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Emotion AI</p>
              <p className="text-xs text-spotify-light">Analyzing mood</p>
            </div>
          </div>
          <div className="text-right">
            <motion.p
              key={emotionAccuracy}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-sm font-medium text-blue-500"
            >
              {Math.round(emotionAccuracy)}%
            </motion.p>
            <p className="text-xs text-spotify-light">Accuracy</p>
          </div>
        </div>

        <div className="bg-spotify-gray/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-4 h-4 text-spotify-green" />
            <span className="text-sm font-medium text-white">Activity Sync</span>
          </div>
          <p className="text-xs text-spotify-light">
            Music recommendations adapting to your workout intensity
          </p>
        </div>
      </div>
    </div>
  );
}
