import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Circle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover } from "@/components/ui/popover";
import { api, type ClaudeVersionStatus } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface TopbarProps {
  /**
   * Callback when CLAUDE.md is clicked
   */
  onClaudeClick: () => void;
  /**
   * Callback when Settings is clicked
   */
  onSettingsClick: () => void;
  /**
   * Callback when Usage Dashboard is clicked
   */
  onUsageClick: () => void;
  /**
   * Callback when MCP is clicked
   */
  onMCPClick: () => void;
  /**
   * Callback when Info is clicked
   */
  onInfoClick: () => void;
  /**
   * Callback when Agents is clicked
   */
  onAgentsClick?: () => void;
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Topbar component with status indicator and navigation buttons
 * 
 * @example
 * <Topbar
 *   onClaudeClick={() => setView('editor')}
 *   onSettingsClick={() => setView('settings')}
 *   onUsageClick={() => setView('usage-dashboard')}
 *   onMCPClick={() => setView('mcp')}
 * />
 */
export const Topbar: React.FC<TopbarProps> = ({
  onSettingsClick,
  className,
}) => {
  const { t } = useTranslation();
  const [versionStatus, setVersionStatus] = useState<ClaudeVersionStatus | null>(null);
  const [checking, setChecking] = useState(true);
  
  // Check Claude version on mount
  useEffect(() => {
    checkVersion();
  }, []);
  
  const checkVersion = async () => {
    try {
      setChecking(true);
      const status = await api.checkClaudeVersion();
      setVersionStatus(status);
      
      // If Claude is not installed and the error indicates it wasn't found
      if (!status.is_installed && status.output.includes("No such file or directory")) {
        // Emit an event that can be caught by the parent
        window.dispatchEvent(new CustomEvent('claude-not-found'));
      }
    } catch (err) {
      console.error("Failed to check Claude version:", err);
      setVersionStatus({
        is_installed: false,
        output: t('topbar.failed_to_check_version', 'Failed to check version'),
      });
    } finally {
      setChecking(false);
    }
  };
  
  const StatusIndicator = () => {
    if (checking) {
      return (
        <div className="flex items-center space-x-2 text-xs">
          <Circle className="h-3 w-3 animate-pulse text-muted-foreground" />
          <span className="text-muted-foreground">{t('common.checking', 'Checking...')}</span>
        </div>
      );
    }
    
    if (!versionStatus) return null;
    
    const statusContent = (
      <Button
        variant="ghost"
        size="sm"
        className="h-auto py-1 px-2 hover:bg-accent"
        onClick={onSettingsClick}
      >
        <div className="flex items-center space-x-2 text-xs">
          <Circle
            className={cn(
              "h-3 w-3",
              versionStatus.is_installed 
                ? "fill-green-500 text-green-500" 
                : "fill-red-500 text-red-500"
            )}
          />
          <span>
            {versionStatus.is_installed && versionStatus.version
              ? `Claude Code v${versionStatus.version}`
              : "Claude Code"}
          </span>
        </div>
      </Button>
    );
    
    if (!versionStatus.is_installed) {
      return (
        <Popover
          trigger={statusContent}
          content={
            <div className="space-y-3 max-w-xs">
              <p className="text-sm font-medium">{t('topbar.claude_not_found', 'Claude Code not found')}</p>
              <div className="rounded-md bg-muted p-3">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {versionStatus.output}
                </pre>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onSettingsClick}
              >
                {t('topbar.select_claude_installation', 'Select Claude Installation')}
              </Button>
              <a
                href="https://www.anthropic.com/claude-code"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-xs text-primary hover:underline"
              >
                <span>{t('topbar.install_claude_code', 'Install Claude Code')}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          }
          align="start"
        />
      );
    }
    
    return statusContent;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      {/* Status Indicator */}
      <StatusIndicator />
      
      {/* Spacer - Navigation moved to titlebar */}
      <div></div>
    </motion.div>
  );
}; 