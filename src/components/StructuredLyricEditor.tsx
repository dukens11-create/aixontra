/**
 * Structured Lyric Editor Component
 * 
 * Displays and edits lyrics with:
 * - Section labels (Verse, Chorus, Bridge, etc.)
 * - Syntax highlighting for sections
 * - Easy section insertion
 * - Professional lyric formatting
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, FileText } from "lucide-react";

interface StructuredLyricEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const SECTION_TYPES = [
  { label: "Intro", tag: "[Intro]" },
  { label: "Verse 1", tag: "[Verse 1]" },
  { label: "Verse 2", tag: "[Verse 2]" },
  { label: "Verse 3", tag: "[Verse 3]" },
  { label: "Pre-Chorus", tag: "[Pre-Chorus]" },
  { label: "Chorus", tag: "[Chorus]" },
  { label: "Hook", tag: "[Hook]" },
  { label: "Bridge", tag: "[Bridge]" },
  { label: "Outro", tag: "[Outro]" },
  { label: "Ad-libs", tag: "[Ad-libs]" },
];

export function StructuredLyricEditor({ 
  value, 
  onChange, 
  placeholder = "Enter your lyrics here...",
  rows = 12 
}: StructuredLyricEditorProps) {
  const [cursorPosition, setCursorPosition] = useState(0);

  const insertSection = (sectionTag: string) => {
    const textarea = document.getElementById('lyrics-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);

    // Add section tag with newlines
    const newText = `${textBefore}\n${sectionTag}\n\n${textAfter}`;
    onChange(newText);

    // Set cursor position after the inserted section
    setTimeout(() => {
      const newPosition = start + sectionTag.length + 3;
      textarea.focus();
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const parseLyrics = () => {
    const lines = value.split('\n');
    const sections: Array<{ type: string; content: string }> = [];
    let currentSection = { type: '', content: '' };

    for (const line of lines) {
      const sectionMatch = line.match(/^\[(.*?)\]$/);
      if (sectionMatch) {
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection });
        }
        currentSection = { type: sectionMatch[0], content: '' };
      } else {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection.content.trim() || currentSection.type) {
      sections.push(currentSection);
    }

    return sections;
  };

  const sections = parseLyrics();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>Lyrics</span>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SECTION_TYPES.map((section) => (
                <DropdownMenuItem
                  key={section.label}
                  onClick={() => insertSection(section.tag)}
                >
                  {section.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Section Overview */}
        {sections.length > 0 && sections.some(s => s.type) && (
          <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground mr-2">Structure:</span>
            {sections.map((section, index) => (
              section.type && (
                <Badge key={index} variant="secondary" className="text-xs">
                  {section.type.replace(/[\[\]]/g, '')}
                </Badge>
              )
            ))}
          </div>
        )}

        {/* Lyric Editor */}
        <Textarea
          id="lyrics-editor"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setCursorPosition(e.target.selectionStart);
          }}
          onSelect={(e) => {
            const target = e.target as HTMLTextAreaElement;
            setCursorPosition(target.selectionStart);
          }}
          placeholder={placeholder}
          rows={rows}
          className="font-mono text-sm resize-none"
          style={{
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
          }}
        />

        {/* Helper Text */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 Tips:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Use [Verse 1], [Chorus], [Bridge] tags to structure your song</li>
            <li>Each section should have 4-8 lines for best results</li>
            <li>Keep lines relatively consistent in length for better flow</li>
          </ul>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>Lines: {value.split('\n').filter(l => l.trim()).length}</span>
          <span>Words: {value.split(/\s+/).filter(w => w.trim()).length}</span>
          <span>Characters: {value.length}</span>
        </div>
      </CardContent>
    </Card>
  );
}
