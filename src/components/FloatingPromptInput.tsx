import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Maximize2, 
  Minimize2,
  ChevronUp,
  Sparkles,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { FilePicker } from "./FilePicker";
import { type FileEntry } from "@/lib/api";

interface FloatingPromptInputProps {
  /**
   * Callback when prompt is sent
   */
  onSend: (prompt: string, model: "sonnet" | "opus") => void;
  /**
   * Whether the input is loading
   */
  isLoading?: boolean;
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
  /**
   * Default model to select
   */
  defaultModel?: "sonnet" | "opus";
  /**
   * Project path for file picker
   */
  projectPath?: string;
  /**
   * Optional className for styling
   */
  className?: string;
}

type Model = {
  id: "sonnet" | "opus";
  name: string;
  description: string;
  icon: React.ReactNode;
};

const MODELS: Model[] = [
  {
    id: "sonnet",
    name: "Claude 4 Sonnet",
    description: "Faster, efficient for most tasks",
    icon: <Zap className="h-4 w-4" />
  },
  {
    id: "opus",
    name: "Claude 4 Opus",
    description: "More capable, better for complex tasks",
    icon: <Sparkles className="h-4 w-4" />
  }
];

/**
 * FloatingPromptInput component - Fixed position prompt input with model picker
 * 
 * @example
 * <FloatingPromptInput
 *   onSend={(prompt, model) => console.log('Send:', prompt, model)}
 *   isLoading={false}
 * />
 */
export const FloatingPromptInput: React.FC<FloatingPromptInputProps> = ({
  onSend,
  isLoading = false,
  disabled = false,
  defaultModel = "sonnet",
  projectPath,
  className,
}) => {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<"sonnet" | "opus">(defaultModel);
  const [isExpanded, setIsExpanded] = useState(false);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [filePickerQuery, setFilePickerQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const expandedTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus the appropriate textarea when expanded state changes
    if (isExpanded && expandedTextareaRef.current) {
      expandedTextareaRef.current.focus();
    } else if (!isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  const handleSend = () => {
    if (prompt.trim() && !isLoading && !disabled) {
      onSend(prompt.trim(), selectedModel);
      setPrompt("");
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart || 0;
    
    // Check if @ was just typed
    if (projectPath?.trim() && newValue.length > prompt.length && newValue[newCursorPosition - 1] === '@') {
      console.log('[FloatingPromptInput] @ detected, projectPath:', projectPath);
      setShowFilePicker(true);
      setFilePickerQuery("");
      setCursorPosition(newCursorPosition);
    }
    
    // Check if we're typing after @ (for search query)
    if (showFilePicker && newCursorPosition >= cursorPosition) {
      // Find the @ position before cursor
      let atPosition = -1;
      for (let i = newCursorPosition - 1; i >= 0; i--) {
        if (newValue[i] === '@') {
          atPosition = i;
          break;
        }
        // Stop if we hit whitespace (new word)
        if (newValue[i] === ' ' || newValue[i] === '\n') {
          break;
        }
      }
      
      if (atPosition !== -1) {
        const query = newValue.substring(atPosition + 1, newCursorPosition);
        setFilePickerQuery(query);
      } else {
        // @ was removed or cursor moved away
        setShowFilePicker(false);
        setFilePickerQuery("");
      }
    }
    
    setPrompt(newValue);
    setCursorPosition(newCursorPosition);
  };

  const handleFileSelect = (entry: FileEntry) => {
    if (textareaRef.current) {
      // Replace the @ and partial query with the selected path (file or directory)
      const textarea = textareaRef.current;
      const beforeAt = prompt.substring(0, cursorPosition - 1);
      const afterCursor = prompt.substring(cursorPosition + filePickerQuery.length);
      const relativePath = entry.path.startsWith(projectPath || '') 
        ? entry.path.slice((projectPath || '').length + 1)
        : entry.path;
      
      const newPrompt = `${beforeAt}@${relativePath} ${afterCursor}`;
      setPrompt(newPrompt);
      setShowFilePicker(false);
      setFilePickerQuery("");
      
      // Focus back on textarea and set cursor position after the inserted path
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = beforeAt.length + relativePath.length + 2; // +2 for @ and space
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };
  
  const handleFilePickerClose = () => {
    setShowFilePicker(false);
    setFilePickerQuery("");
    // Return focus to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showFilePicker && e.key === 'Escape') {
      e.preventDefault();
      setShowFilePicker(false);
      setFilePickerQuery("");
      return;
    }
    
    if (e.key === "Enter" && !e.shiftKey && !isExpanded && !showFilePicker) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedModelData = MODELS.find(m => m.id === selectedModel) || MODELS[0];

  return (
    <>
      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-border rounded-lg shadow-lg w-full max-w-2xl p-4 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Compose your prompt</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(false)}
                  className="h-8 w-8"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
              
              <Textarea
                ref={expandedTextareaRef}
                value={prompt}
                onChange={handleTextChange}
                placeholder="Type your prompt here..."
                className="min-h-[200px] resize-none"
                disabled={isLoading || disabled}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Model:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModelPickerOpen(!modelPickerOpen)}
                    className="gap-2"
                  >
                    {selectedModelData.icon}
                    {selectedModelData.name}
                  </Button>
                </div>
                
                <Button
                  onClick={handleSend}
                  disabled={!prompt.trim() || isLoading || disabled}
                  size="sm"
                  className="min-w-[80px]"
                >
                  {isLoading ? (
                    <div className="rotating-symbol text-primary-foreground"></div>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Position Input Bar */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border",
        className
      )}>
        <div className="max-w-5xl mx-auto p-4">
          <div className="flex items-end gap-3">
            {/* Model Picker */}
            <Popover
              trigger={
                <Button
                  variant="outline"
                  size="default"
                  disabled={isLoading || disabled}
                  className="gap-2 min-w-[180px] justify-start"
                >
                  {selectedModelData.icon}
                  <span className="flex-1 text-left">{selectedModelData.name}</span>
                  <ChevronUp className="h-4 w-4 opacity-50" />
                </Button>
              }
              content={
                <div className="w-[300px] p-1">
                  {MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setModelPickerOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-start gap-3 p-3 rounded-md transition-colors text-left",
                        "hover:bg-accent",
                        selectedModel === model.id && "bg-accent"
                      )}
                    >
                      <div className="mt-0.5">{model.icon}</div>
                      <div className="flex-1 space-y-1">
                        <div className="font-medium text-sm">{model.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {model.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              }
              open={modelPickerOpen}
              onOpenChange={setModelPickerOpen}
              align="start"
              side="top"
            />
            
            {/* Prompt Input */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask Claude anything..."
                disabled={isLoading || disabled}
                className="min-h-[44px] max-h-[120px] resize-none pr-10"
                rows={1}
              />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(true)}
                disabled={isLoading || disabled}
                className="absolute right-1 bottom-1 h-8 w-8"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              
              {/* File Picker */}
              <AnimatePresence>
                {showFilePicker && projectPath && projectPath.trim() && (
                  <FilePicker
                    basePath={projectPath.trim()}
                    onSelect={handleFileSelect}
                    onClose={handleFilePickerClose}
                    initialQuery={filePickerQuery}
                  />
                )}
              </AnimatePresence>
            </div>
            
            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!prompt.trim() || isLoading || disabled}
              size="default"
              className="min-w-[60px]"
            >
              {isLoading ? (
                <div className="rotating-symbol text-primary-foreground"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line{projectPath?.trim() && ", @ to mention files"}
          </div>
        </div>
      </div>
    </>
  );
}; 