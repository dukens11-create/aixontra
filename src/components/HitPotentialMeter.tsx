/**
 * Hit Potential Meter Component
 * 
 * Displays comprehensive hit potential analysis including:
 * - Overall hit potential score
 * - Hook catchiness, timing, repetition, energy scores
 * - Viral moment detection
 * - Improvement suggestions
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HitPotentialScore } from "@/lib/services/hitPotentialAnalyzer";
import { Target, TrendingUp, Clock, Repeat, Zap, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

interface HitPotentialMeterProps {
  score: HitPotentialScore;
}

export function HitPotentialMeter({ score }: HitPotentialMeterProps) {
  const getOverallLabel = (value: number): string => {
    if (value >= 80) return "VERY STRONG";
    if (value >= 65) return "STRONG";
    if (value >= 50) return "GOOD";
    if (value >= 35) return "FAIR";
    return "NEEDS WORK";
  };

  const getOverallColor = (value: number): string => {
    if (value >= 80) return "text-green-600";
    if (value >= 65) return "text-blue-600";
    if (value >= 50) return "text-yellow-600";
    return "text-orange-600";
  };

  const getScoreIcon = (value: number) => {
    if (value >= 70) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <span>Hit Potential</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-bold ${getOverallColor(score.overall)}`}>
              {score.overall}/100
            </span>
            <Badge 
              variant={score.overall >= 65 ? "default" : "secondary"}
              className="text-xs"
            >
              {getOverallLabel(score.overall)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hook Catchiness */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getScoreIcon(score.hookCatchiness)}
                <Sparkles className="h-4 w-4" />
                <span className="font-medium text-sm">Hook Catchiness</span>
              </div>
              <span className="font-semibold text-sm">{score.hookCatchiness}/100</span>
            </div>
            <Progress value={score.hookCatchiness} className="h-2" />
            <p className="text-xs text-muted-foreground">{score.breakdown.hookCatchiness}</p>
          </div>

          {/* Hook Timing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getScoreIcon(score.hookTiming)}
                <Clock className="h-4 w-4" />
                <span className="font-medium text-sm">Hook Timing</span>
              </div>
              <span className="font-semibold text-sm">{score.hookTiming}/100</span>
            </div>
            <Progress value={score.hookTiming} className="h-2" />
            <p className="text-xs text-muted-foreground">{score.breakdown.hookTiming}</p>
          </div>

          {/* Repetition */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getScoreIcon(score.repetition)}
                <Repeat className="h-4 w-4" />
                <span className="font-medium text-sm">Repetition</span>
              </div>
              <span className="font-semibold text-sm">{score.repetition}/100</span>
            </div>
            <Progress value={score.repetition} className="h-2" />
            <p className="text-xs text-muted-foreground">{score.breakdown.repetition}</p>
          </div>

          {/* Energy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getScoreIcon(score.energy)}
                <Zap className="h-4 w-4" />
                <span className="font-medium text-sm">Energy</span>
              </div>
              <span className="font-semibold text-sm">{score.energy}/100</span>
            </div>
            <Progress value={score.energy} className="h-2" />
            <p className="text-xs text-muted-foreground">{score.breakdown.energy}</p>
          </div>
        </div>

        {/* Viral Moment */}
        {score.viralMoment && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <h4 className="font-semibold">Viral Moment Detected</h4>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Timeframe</span>
                <span className="text-sm font-mono">
                  {formatTime(score.viralMoment.start)} - {formatTime(score.viralMoment.end)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Viral Score</span>
                <Badge variant="secondary">{score.viralMoment.score}/100</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                This section has the highest potential for social media virality
              </p>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {score.suggestions.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Suggestions for Improvement
            </h4>
            <ul className="space-y-2">
              {score.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span className="text-muted-foreground">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Overall Assessment */}
        {score.overall >= 65 && (
          <div className="pt-4 border-t bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-medium">
                This song has strong commercial potential! 🎉
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
