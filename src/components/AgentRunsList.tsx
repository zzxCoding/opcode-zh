import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Clock, Hash, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { formatISOTimestamp } from "@/lib/date-utils";
import type { AgentRunWithMetrics } from "@/lib/api";
import { AGENT_ICONS } from "./CCAgents";

interface AgentRunsListProps {
  /**
   * Array of agent runs to display
   */
  runs: AgentRunWithMetrics[];
  /**
   * Callback when a run is clicked
   */
  onRunClick?: (run: AgentRunWithMetrics) => void;
  /**
   * Optional className for styling
   */
  className?: string;
}

const ITEMS_PER_PAGE = 5;

/**
 * AgentRunsList component - Displays a paginated list of agent execution runs
 * 
 * @example
 * <AgentRunsList
 *   runs={runs}
 *   onRunClick={(run) => console.log('Selected:', run)}
 * />
 */
export const AgentRunsList: React.FC<AgentRunsListProps> = ({
  runs,
  onRunClick,
  className,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate pagination
  const totalPages = Math.ceil(runs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRuns = runs.slice(startIndex, endIndex);
  
  // Reset to page 1 if runs change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [runs.length]);
  
  const renderIcon = (iconName: string) => {
    const Icon = AGENT_ICONS[iconName as keyof typeof AGENT_ICONS] || Bot;
    return <Icon className="h-4 w-4" />;
  };
  
  const formatDuration = (ms?: number) => {
    if (!ms) return "N/A";
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  const formatTokens = (tokens?: number) => {
    if (!tokens) return "0";
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}k`;
    }
    return tokens.toString();
  };
  
  if (runs.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No execution history yet</p>
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        {currentRuns.map((run, index) => (
          <motion.div
            key={run.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <Card
              className={cn(
                "transition-all hover:shadow-md cursor-pointer",
                onRunClick && "hover:shadow-lg hover:border-primary/50 active:scale-[0.99]"
              )}
              onClick={() => onRunClick?.(run)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5">
                      {renderIcon(run.agent_icon)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{run.task}</p>
                        <Badge variant="outline" className="text-xs">
                          {run.model === 'opus' ? 'Claude 4 Opus' : 'Claude 4 Sonnet'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="truncate">by {run.agent_name}</span>
                        {run.completed_at && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDuration(run.metrics?.duration_ms)}</span>
                            </div>
                          </>
                        )}
                        {run.metrics?.total_tokens && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              <span>{formatTokens(run.metrics?.total_tokens)}</span>
                            </div>
                          </>
                        )}
                        {run.metrics?.cost_usd && (
                          <>
                            <span>•</span>
                            <span>${run.metrics?.cost_usd?.toFixed(4)}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatISOTimestamp(run.created_at)}
                      </p>
                    </div>
                  </div>
                  {!run.completed_at && (
                    <Badge variant="secondary" className="text-xs">
                      Running
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}; 