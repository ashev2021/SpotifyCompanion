import { motion } from "framer-motion";
import { Zap, Leaf, Moon } from "lucide-react";

interface MoodData {
  mood: string;
  percentage: number;
  color: string;
  icon: React.ReactNode;
}

interface MoodAnalysisProps {
  currentMood?: string;
  energyLevel?: number;
}

export function MoodAnalysis({ currentMood = "energetic", energyLevel = 85 }: MoodAnalysisProps) {
  const moods: MoodData[] = [
    {
      mood: "Energetic",
      percentage: currentMood === "energetic" ? energyLevel : 25,
      color: "from-red-500 to-orange-500",
      icon: <Zap className="w-4 h-4" />
    },
    {
      mood: "Calm",
      percentage: currentMood === "calm" ? energyLevel : 40,
      color: "from-teal-500 to-green-500",
      icon: <Leaf className="w-4 h-4" />
    },
    {
      mood: "Melancholic",
      percentage: currentMood === "melancholic" ? energyLevel : 15,
      color: "from-purple-500 to-indigo-500",
      icon: <Moon className="w-4 h-4" />
    }
  ];

  return (
    <div className="bg-spotify-gray/30 rounded-2xl p-6 border border-spotify-gray/20">
      <h3 className="text-lg font-semibold mb-4 text-white">Current Mood Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {moods.map((mood, index) => (
          <motion.div
            key={mood.mood}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${mood.color} rounded-xl p-4 text-center relative overflow-hidden`}
            style={{ 
              opacity: mood.percentage > 60 ? 1 : mood.percentage > 30 ? 0.7 : 0.4 
            }}
          >
            <motion.div
              className="absolute inset-0 bg-white/10"
              initial={{ scale: 0 }}
              animate={{ scale: mood.percentage > 60 ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
            
            <div className="relative z-10">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                {mood.icon}
              </div>
              <p className="font-medium text-sm text-white">{mood.mood}</p>
              <motion.p
                className="text-xs opacity-80 text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {mood.percentage}% Match
              </motion.p>
            </div>
            
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: mood.percentage / 100 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ transformOrigin: "left" }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
