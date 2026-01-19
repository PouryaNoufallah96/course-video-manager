import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { BannedPhrase } from "@/features/article-writer/lint-rules";
import { PlusIcon, TrashIcon, RotateCcwIcon } from "lucide-react";
import { useState } from "react";

export function BannedPhrasesModal(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phrases: BannedPhrase[];
  onAddPhrase: (
    pattern: string,
    readable: string,
    caseSensitive: boolean
  ) => void;
  onRemovePhrase: (index: number) => void;
  onUpdatePhrase: (index: number, updated: Partial<BannedPhrase>) => void;
  onResetToDefaults: () => void;
}) {
  const [newPattern, setNewPattern] = useState("");
  const [newReadable, setNewReadable] = useState("");
  const [newCaseSensitive, setNewCaseSensitive] = useState(false);

  const handleAdd = () => {
    if (!newPattern.trim()) return;
    props.onAddPhrase(
      newPattern.trim(),
      newReadable.trim() || newPattern.trim(),
      newCaseSensitive
    );
    setNewPattern("");
    setNewReadable("");
    setNewCaseSensitive(false);
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Banned Phrases</DialogTitle>
          <DialogDescription>
            Manage phrases that should be flagged in generated content.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {props.phrases.map((phrase, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded border bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-mono text-sm truncate"
                      title={phrase.pattern}
                    >
                      {phrase.pattern}
                    </p>
                    {phrase.readable !== phrase.pattern && (
                      <p
                        className="text-xs text-muted-foreground truncate"
                        title={phrase.readable}
                      >
                        {phrase.readable}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1">
                      <Checkbox
                        id={`case-${index}`}
                        checked={phrase.caseSensitive}
                        onCheckedChange={(checked) =>
                          props.onUpdatePhrase(index, {
                            caseSensitive: checked === true,
                          })
                        }
                      />
                      <Label
                        htmlFor={`case-${index}`}
                        className="text-xs cursor-pointer"
                      >
                        Aa
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => props.onRemovePhrase(index)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {props.phrases.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No banned phrases configured.
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <Label>Add New Phrase</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Pattern (e.g., 'game changer' or 'regex[?!]')"
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <div className="flex items-center gap-1 shrink-0">
              <Checkbox
                id="new-case-sensitive"
                checked={newCaseSensitive}
                onCheckedChange={(checked) =>
                  setNewCaseSensitive(checked === true)
                }
              />
              <Label
                htmlFor="new-case-sensitive"
                className="text-xs cursor-pointer"
              >
                Aa
              </Label>
            </div>
            <Button onClick={handleAdd} disabled={!newPattern.trim()}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          <Input
            placeholder="Description (optional, shown in fix message)"
            value={newReadable}
            onChange={(e) => setNewReadable(e.target.value)}
            className="text-sm"
          />
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={props.onResetToDefaults}>
            <RotateCcwIcon className="h-4 w-4 mr-1" />
            Reset to Defaults
          </Button>
          <Button onClick={() => props.onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
