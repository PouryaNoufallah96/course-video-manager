import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2Icon, Trash2Icon } from "lucide-react";

type FileMetadata = {
  path: string;
  size: number;
  defaultEnabled: boolean;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function StandaloneFileTree(props: {
  files: FileMetadata[];
  enabledFiles: Set<string>;
  onEnabledFilesChange: (enabledFiles: Set<string>) => void;
  onEditFile: (filename: string) => void;
  onDeleteFile: (filename: string) => void;
  onFileClick?: (filename: string) => void;
}) {
  // Sort files alphabetically
  const sortedFiles = [...props.files].sort((a, b) =>
    a.path.localeCompare(b.path)
  );

  const handleToggle = (path: string, enabled: boolean) => {
    const newEnabledFiles = new Set(props.enabledFiles);
    if (enabled) {
      newEnabledFiles.add(path);
    } else {
      newEnabledFiles.delete(path);
    }
    props.onEnabledFilesChange(newEnabledFiles);
  };

  if (sortedFiles.length === 0) {
    return (
      <div className="text-sm text-muted-foreground px-2 py-4 text-center">
        No files yet. Click "Add File" to create one.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {sortedFiles.map((file) => {
        const isChecked = props.enabledFiles.has(file.path);

        return (
          <div
            key={file.path}
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-sm group"
          >
            <Checkbox
              checked={isChecked}
              onCheckedChange={(checked) => {
                handleToggle(file.path, !!checked);
              }}
            />
            <button
              className="text-sm flex-1 truncate font-mono text-left hover:underline cursor-pointer"
              onClick={() => props.onFileClick?.(file.path)}
            >
              {file.path}
            </button>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatFileSize(file.size)}
            </span>
            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => props.onEditFile(file.path)}
              >
                <Edit2Icon className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:text-destructive"
                onClick={() => props.onDeleteFile(file.path)}
              >
                <Trash2Icon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
