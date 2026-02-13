/**
 * Flow Analysis Display Component
 * 
 * Shows rhyme & flow analysis including:
 * - Syllable count and distribution
 * - Rhyme scheme
 * - Flow score
 * - Improvement suggestions
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FlowAnalysis } from "@/lib/services/rhymeEngine";
import { Music2, TrendingUp, AlertCircle } from "lucide-react";

interface FlowAnalysisDisplayProps {
  analysis: FlowAnalysis;
  bpm?: number;
}

export function FlowAnalysisDisplay({ analysis, bpm }: FlowAnalysisDisplayProps) {
  const getFlowLabel = (score: number): string => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  const getFlowColor = (score: number): string => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music2 className="h-5 w-5" />
            <span>Flow Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getFlowColor(analysis.flowScore)}`}>
              {analysis.flowScore}/100
            </span>
            <Badge variant={analysis.flowScore >= 60 ? "default" : "secondary"}>
              {getFlowLabel(analysis.flowScore)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Syllables</p>
            <p className="text-2xl font-bold">{analysis.totalSyllables}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg Per Line</p>
            <p className="text-2xl font-bold">{analysis.averageSyllablesPerLine}</p>
          </div>

          {bpm && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">BPM</p>
              <p className="text-2xl font-bold">{bpm}</p>
            </div>
          )}
        </div>

        {/* Flow Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Flow Consistency</span>
            <span className={`font-semibold ${getFlowColor(analysis.flowScore)}`}>
              {analysis.flowScore}/100
            </span>
          </div>
          <Progress value={analysis.flowScore} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {analysis.flowScore >= 80
              ? "Excellent syllable consistency and rhythm"
              : analysis.flowScore >= 60
              ? "Good flow with minor variations"
              : analysis.flowScore >= 40
              ? "Flow could be more consistent"
              : "Flow needs significant improvement"}
          </p>
        </div>

        {/* Rhyme Scheme */}
        {analysis.rhymeScheme && (
          <div className="space-y-2">
            <h4 className="font-medium">Rhyme Scheme</h4>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="font-mono text-lg tracking-wider text-center">
                {analysis.rhymeScheme}
              </p>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Pattern: {analysis.rhymeScheme.length > 0 ? analysis.rhymeScheme : "No clear pattern"}
              </p>
            </div>
          </div>
        )}

        {/* Syllable Distribution */}
        {analysis.syllableDistribution && analysis.syllableDistribution.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Syllable Distribution</h4>
            <div className="flex items-end gap-1 h-24">
              {analysis.syllableDistribution.slice(0, 20).map((count, index) => {
                const maxCount = Math.max(...analysis.syllableDistribution);
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div
                    key={index}
                    className="flex-1 bg-primary rounded-t transition-all hover:bg-primary/80"
                    style={{ height: `${height}%` }}
                    title={`Line ${index + 1}: ${count} syllables`}
                  />
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Each bar represents syllable count per line
              {analysis.syllableDistribution.length > 20 && ` (showing first 20 of ${analysis.syllableDistribution.length})`}
            </p>
          </div>
        )}

        {/* Suggestions */}
        {analysis.suggestions && analysis.suggestions.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Suggestions
            </h4>
            <ul className="space-y-2">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
