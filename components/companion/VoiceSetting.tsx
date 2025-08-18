"use client"

import { useState, useEffect } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { getCompanionVoice } from "@/lib/voice.sdk"

interface VoiceSettingProps {
  onSettingsChange?: (settings: VoiceConfig) => void;
  initialSettings?: Partial<VoiceConfig>;
}

export function VoiceSetting({ onSettingsChange, initialSettings }: VoiceSettingProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [settings, setSettings] = useState<VoiceConfig>({
    voice: initialSettings?.voice || "",
    rate: initialSettings?.rate || 1.0,
    pitch: initialSettings?.pitch || 1.0,
    volume: initialSettings?.volume || 1.0,
  })

  const companionVoice = getCompanionVoice();

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices()
      setVoices(availableVoices)

      if (availableVoices.length > 0 && !settings.voice) {
        const defaultVoice = availableVoices[0].name;
        const newSettings = { ...settings, voice: defaultVoice };
        setSettings(newSettings);
        updateVoiceSDK(newSettings);
      }
    }

    loadVoices()
    speechSynthesis.addEventListener("voiceschanged", loadVoices)

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", loadVoices)
    }
  }, [])

  // Update SDK whenever settings change
  const updateVoiceSDK = (newSettings: VoiceConfig) => {
    companionVoice.updateVoiceSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const updateSetting = <K extends keyof VoiceConfig>(
    key: K, 
    value: VoiceConfig[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateVoiceSDK(newSettings);
  };

  const resetToDefaults = () => {
    const defaultSettings: VoiceConfig = {
      voice: voices.length > 0 ? voices[0].name : "",
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
    };
    setSettings(defaultSettings);
    updateVoiceSDK(defaultSettings);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit" align="center">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Voice Settings</h4>
            <p className="text-sm text-muted-foreground">Configure speech synthesis properties</p>
          </div>

          <Separator />

          {/* Voice Selection */}
          <div className="space-y-2">
            <Label htmlFor="voice-select">Voice</Label>
            <Select
              value={settings.voice}
              onValueChange={(value) => updateSetting('voice', value)}
            >
              <SelectTrigger id="voice-select">
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rate Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="rate-slider">Rate</Label>
              <span className="text-sm text-muted-foreground">{settings.rate.toFixed(1)}</span>
            </div>
            <Slider
              id="rate-slider"
              min={0.1}
              max={10.0}
              step={0.1}
              value={[settings.rate]}
              onValueChange={(value) => updateSetting('rate', value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.1</span>
              <span>10.0</span>
            </div>
          </div>

          {/* Pitch Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="pitch-slider">Pitch</Label>
              <span className="text-sm text-muted-foreground">{settings.pitch.toFixed(1)}</span>
            </div>
            <Slider
              id="pitch-slider"
              min={0.0}
              max={2.0}
              step={0.1}
              value={[settings.pitch]}
              onValueChange={(value) => updateSetting('pitch', value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.0</span>
              <span>2.0</span>
            </div>
          </div>

          {/* Volume Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="volume-slider">Volume</Label>
              <span className="text-sm text-muted-foreground">{settings.volume.toFixed(1)}</span>
            </div>
            <Slider
              id="volume-slider"
              min={0.0}
              max={1.0}
              step={0.1}
              value={[settings.volume]}
              onValueChange={(value) => updateSetting('volume', value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.0</span>
              <span>1.0</span>
            </div>
          </div>

          <Separator />
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={resetToDefaults}
          >
            Reset
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}