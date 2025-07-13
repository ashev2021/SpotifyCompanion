import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Copy, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SpotifySetupGuideProps {
  onClose: () => void;
}

export function SpotifySetupGuide({ onClose }: SpotifySetupGuideProps) {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState<string>("");
  const { toast } = useToast();

  // For Replit deployment, use HTTPS; for localhost, show both options
  const isReplit = window.location.hostname.includes('replit.app');
  const redirectUri = isReplit 
    ? `https://${window.location.host}/api/spotify/callback`
    : `http://localhost:5000/api/spotify/callback`;
  
  const additionalUri = !isReplit ? `https://your-replit-domain.replit.app/api/spotify/callback` : null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
    setTimeout(() => setCopied(""), 2000);
  };

  const steps = [
    {
      title: "Go to Spotify Developer Dashboard",
      description: "Open the Spotify Developer Dashboard and log in with your Spotify account.",
      action: (
        <Button
          onClick={() => window.open("https://developer.spotify.com/dashboard", "_blank")}
          className="bg-spotify-green hover:bg-spotify-green/80"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open Dashboard
        </Button>
      )
    },
    {
      title: "Create or Edit Your App",
      description: "Create a new app or click on your existing app to edit its settings.",
      action: null
    },
    {
      title: "Add Redirect URI",
      description: "In your app settings, add these exact redirect URIs:",
      action: (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-spotify-light mb-2">For development:</p>
            <div className="bg-black/20 rounded-lg p-3 font-mono text-sm text-spotify-green break-all">
              {redirectUri}
            </div>
            <Button
              onClick={() => copyToClipboard(redirectUri, "Development URI")}
              variant="outline"
              size="sm"
              className="w-full mt-2"
            >
              {copied === "Development URI" ? (
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              Copy Development URI
            </Button>
          </div>
          
          {additionalUri && (
            <div>
              <p className="text-xs text-spotify-light mb-2">For deployment:</p>
              <div className="bg-black/20 rounded-lg p-3 font-mono text-sm text-spotify-green break-all">
                {additionalUri}
              </div>
              <Button
                onClick={() => copyToClipboard(additionalUri, "Deployment URI")}
                variant="outline"
                size="sm"
                className="w-full mt-2"
              >
                {copied === "Deployment URI" ? (
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                Copy Deployment URI
              </Button>
            </div>
          )}
        </div>
      )
    },
    {
      title: "Enable Required APIs",
      description: "Make sure to select 'Web Playback SDK' when creating/editing your app.",
      action: null
    },
    {
      title: "Save Settings",
      description: "Click 'Save' in your Spotify app settings, then try connecting again.",
      action: (
        <Button
          onClick={onClose}
          className="bg-spotify-green hover:bg-spotify-green/80 w-full"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Done! Try Connecting
        </Button>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-spotify-gray/95 rounded-2xl p-6 max-w-md w-full border border-spotify-gray/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Spotify Setup Guide</h3>
          <Button
            onClick={onClose}
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0 text-spotify-light hover:text-white"
          >
            ×
          </Button>
        </div>

        <div className="space-y-6">
          {steps.map((stepData, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-lg p-4 ${
                step === index + 1
                  ? 'border-spotify-green bg-spotify-green/10'
                  : step > index + 1
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-spotify-gray/30 bg-spotify-gray/20'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step > index + 1
                    ? 'bg-green-500 text-white'
                    : step === index + 1
                    ? 'bg-spotify-green text-white'
                    : 'bg-spotify-gray text-spotify-light'
                }`}>
                  {step > index + 1 ? '✓' : index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">{stepData.title}</h4>
                  <p className="text-sm text-spotify-light mb-3">{stepData.description}</p>
                  {stepData.action}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <Button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <Button
            onClick={() => setStep(Math.min(steps.length, step + 1))}
            disabled={step === steps.length}
            size="sm"
            className="bg-spotify-green hover:bg-spotify-green/80"
          >
            Next
          </Button>
        </div>

        <div className="space-y-3 mt-4">
          <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-300">
                <strong>Security:</strong> Spotify requires HTTPS URLs for production. Use the deployment URI for live apps.
              </p>
            </div>
          </div>
          
          <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-300">
                <strong>Premium Required:</strong> You need a Spotify Premium subscription to use the Web Playback SDK for streaming music.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}