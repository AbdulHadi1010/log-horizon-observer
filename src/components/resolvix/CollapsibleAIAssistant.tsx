
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, ChevronLeft, ChevronRight } from "lucide-react";
import { type ChatMessage } from "../../services/ticketService";

interface CollapsibleAIAssistantProps {
  ticketId: string;
  chatMessages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
}

export function CollapsibleAIAssistant({ 
  chatMessages, 
  onSendMessage 
}: CollapsibleAIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;

    setIsLoadingAi(true);
    await onSendMessage(aiQuery);
    setAiQuery("");
    setIsLoadingAi(false);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const aiMessages = chatMessages.filter(msg => msg.type === 'ai');

  return (
    <>
      {/* AI Tab - Always visible */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-30">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`rounded-l-lg rounded-r-none bg-card border-r-0 px-2 py-6 transition-all duration-300 ${
            isExpanded ? 'shadow-lg' : 'shadow-md hover:shadow-lg'
          }`}
          aria-label={isExpanded ? "Collapse AI Assistant" : "Expand AI Assistant"}
        >
          <div className="flex flex-col items-center gap-1">
            <Bot className="w-4 h-4" />
            <span className="text-xs writing-mode-vertical text-vertical">AI</span>
            {isExpanded ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronLeft className="w-3 h-3" />
            )}
          </div>
        </Button>
      </div>

      {/* AI Assistant Panel - Slides out */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-background border-l shadow-xl z-20 transition-transform duration-300 ${
        isExpanded ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <Card className="h-full rounded-none border-0">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              AI Assistant
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="ml-auto"
                aria-label="Close AI Assistant"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full p-0">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {aiMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Ask the AI about this ticket...</p>
                </div>
              ) : (
                aiMessages.map((message) => (
                  <div key={message.id} className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">AI Assistant</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm mt-1 bg-secondary/50 rounded-lg p-3">
                        {message.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="border-t p-4 space-y-3">
              <Textarea
                placeholder="Ask the AI about this ticket..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                rows={3}
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    handleAiQuery();
                  }
                }}
              />
              <Button 
                onClick={handleAiQuery}
                disabled={isLoadingAi || !aiQuery.trim()}
                className="w-full"
              >
                {isLoadingAi ? "Thinking..." : "Ask AI"}
              </Button>
              <div className="text-xs text-muted-foreground">
                AI can help with error analysis, suggested fixes, and finding related tickets.
                <br />
                <kbd className="bg-muted px-1 rounded">Ctrl+Enter</kbd> to send
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backdrop when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}
