/**
 * Genre Recommendation Component
 * 
 * Suggests genres based on the user's prompt
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { getGenreRecommendations } from "@/lib/services/genreRules";

interface GenreRecommendationsProps {
  prompt: string;
  selectedGenres: string[];
  onGenreSelect: (genre: string) => void;
}

export function GenreRecommendations({ 
  prompt, 
  selectedGenres, 
  onGenreSelect 
}: GenreRecommendationsProps) {
  if (!prompt || prompt.trim().length < 10) return null;

  const recommendations = getGenreRecommendations(prompt);
  
  // Filter out already selected genres
  const newRecommendations = recommendations.filter(
    genre => !selectedGenres.includes(genre)
  );

  if (newRecommendations.length === 0) return null;

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-600" />
          <span>Suggested Genres</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">
          Based on your prompt, these genres might work well:
        </p>
        <div className="flex flex-wrap gap-2">
          {newRecommendations.map((genre) => (
            <Button
              key={genre}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onGenreSelect(genre)}
            >
              + {genre}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
