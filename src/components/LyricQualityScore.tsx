/**
 * Lyric Quality Score Display Component
 * 
 * Shows detailed analysis of lyric quality including:
 * - Overall score
 * - Individual metric scores (emotion, originality, imagery, coherence)
 * - Poetic devices detected
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LyricScore } from "@/lib/services/lyricAnalyzer";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

interface LyricQualityScoreProps {
  score: LyricScore;
}

export function LyricQualityScore({ score }: LyricQualityScoreProps) {
  const getScoreColor = (value: number): string => {
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-blue-600";
    if (value >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (value: number) => {
    if (value >= 70) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (value >= 50) return <Info className="h-4 w-4 text-blue-600" />;
    return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  };

  const getScoreLabel = (value: number): string => {
    if (value >= 85) return "Excellent";
    if (value >= 70) return "Strong";
    if (value >= 55) return "Good";
    if (value >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Lyric Quality Score</span>
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-bold ${getScoreColor(score.overall)}`}>
              {score.overall}/100
            </span>
            <Badge variant={score.overall >= 70 ? "default" : "secondary"}>
              {getScoreLabel(score.overall)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Individual Metrics */}
        <div className="space-y-4">
          {/* Emotion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getScoreIcon(score.emotion)}
                <span className="font-medium">Emotion</span>
              </div>
              <span className={`font-semibold ${getScoreColor(score.emotion)}`}>
                {score.emotion}/100
              </span>
            </div>
            <Progress value={score.emotion} className="h-2" />
            <p className="text-sm text-muted-foreground">{score.breakdown.emotion}</p>
          </div>

          {/* Originality */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getScoreIcon(score.originality)}
                <span className="font-medium">Originality</span>
              </div>
              <span className={`font-semibold ${getScoreColor(score.originality)}`}>
                {score.originality}/100
              </span>
            </div>
            <Progress value={score.originality} className="h-2" />
            <p className="text-sm text-muted-foreground">{score.breakdown.originality}</p>
          </div>

          {/* Imagery */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getScoreIcon(score.imagery)}
                <span className="font-medium">Imagery</span>
              </div>
              <span className={`font-semibold ${getScoreColor(score.imagery)}`}>
                {score.imagery}/100
              </span>
            </div>
            <Progress value={score.imagery} className="h-2" />
            <p className="text-sm text-muted-foreground">{score.breakdown.imagery}</p>
          </div>

          {/* Coherence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getScoreIcon(score.coherence)}
                <span className="font-medium">Coherence</span>
              </div>
              <span className={`font-semibold ${getScoreColor(score.coherence)}`}>
                {score.coherence}/100
              </span>
            </div>
            <Progress value={score.coherence} className="h-2" />
            <p className="text-sm text-muted-foreground">{score.breakdown.coherence}</p>
          </div>
        </div>

        {/* Poetic Devices */}
        {score.poeticDevices.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Poetic Devices Used</h4>
            <div className="flex flex-wrap gap-2">
              {score.poeticDevices.map((device, index) => (
                <Badge key={index} variant="outline">
                  {device}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
