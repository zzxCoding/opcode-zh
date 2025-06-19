import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, FileQuestion, Terminal } from "lucide-react";

interface ClaudeBinaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function ClaudeBinaryDialog({ open, onOpenChange, onSuccess, onError }: ClaudeBinaryDialogProps) {
  const [binaryPath, setBinaryPath] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleSave = async () => {
    if (!binaryPath.trim()) {
      onError("Please enter a valid path");
      return;
    }

    setIsValidating(true);
    try {
      await api.setClaudeBinaryPath(binaryPath.trim());
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save Claude binary path:", error);
      onError(error instanceof Error ? error.message : "Failed to save Claude binary path");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileQuestion className="w-5 h-5" />
            Couldn't locate Claude Code installation
          </DialogTitle>
          <DialogDescription className="space-y-3 mt-4">
            <p>
              Claude Code was not found in any of the common installation locations. 
              Please specify the path to the Claude binary manually.
            </p>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <Terminal className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Tip:</span> Run{" "}
                <code className="px-1 py-0.5 bg-black/10 dark:bg-white/10 rounded">which claude</code>{" "}
                in your terminal to find the installation path
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Input
            type="text"
            placeholder="/usr/local/bin/claude"
            value={binaryPath}
            onChange={(e) => setBinaryPath(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isValidating) {
                handleSave();
              }
            }}
            autoFocus
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Common locations: /usr/local/bin/claude, /opt/homebrew/bin/claude, ~/.claude/local/claude
          </p>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => window.open("https://docs.claude.ai/claude/how-to-install", "_blank")}
            className="mr-auto"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Installation Guide
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isValidating}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isValidating || !binaryPath.trim()}>
            {isValidating ? "Validating..." : "Save Path"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 