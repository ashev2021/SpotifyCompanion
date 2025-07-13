import { Mic } from "lucide-react";

interface VoiceCommand {
  title: string;
  example: string;
  icon: React.ReactNode;
}

export function VoiceCommands() {
  const commands: VoiceCommand[] = [
    {
      title: "Mood Discovery",
      example: "Play something energetic",
      icon: <Mic className="w-4 h-4 text-spotify-green" />
    },
    {
      title: "Activity Music",
      example: "Find workout songs",
      icon: <Mic className="w-4 h-4 text-spotify-green" />
    },
    {
      title: "Playlist Control",
      example: "Create a chill playlist",
      icon: <Mic className="w-4 h-4 text-spotify-green" />
    }
  ];

  return (
    <div className="bg-spotify-gray/30 rounded-2xl p-6 border border-spotify-gray/20">
      <h3 className="text-lg font-semibold mb-4 text-white">Voice Commands</h3>
      <div className="space-y-3">
        {commands.map((command, index) => (
          <div key={index} className="bg-spotify-gray/50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              {command.icon}
              <span className="text-sm font-medium text-white">{command.title}</span>
            </div>
            <p className="text-xs text-spotify-light">"{command.example}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}
