import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Version {
  id: string;
  name: string;
  createdAt: Date;
}

interface VersionSelectorModalProps {
  versions: Version[];
  selectedVersionId: string | undefined;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectVersion: (versionId: string) => void;
}

export function VersionSelectorModal({
  versions,
  selectedVersionId,
  isOpen,
  onOpenChange,
  onSelectVersion,
}: VersionSelectorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Version</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-4">
          {versions.map((version) => {
            const isSelected = version.id === selectedVersionId;
            return (
              <Button
                key={version.id}
                variant="ghost"
                className={cn(
                  "w-full justify-between",
                  isSelected && "bg-accent"
                )}
                onClick={() => {
                  onSelectVersion(version.id);
                  onOpenChange(false);
                }}
              >
                <span>
                  {version.name}{" "}
                  <span className="text-muted-foreground">
                    ({new Date(version.createdAt).toLocaleDateString()})
                  </span>
                </span>
                {isSelected && <Check className="w-4 h-4" />}
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
