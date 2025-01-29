import React from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { HelpCircle } from "lucide-react";

interface DefinitionDisplayProps {
  definition: string;
  hint1?: string;
  hint2?: string;
  showHint1?: boolean;
  showHint2?: boolean;
  roundNumber?: number;
  totalRounds?: number;
}

const DefinitionDisplay = ({
  definition = "A localized zone of low-pressure tactile compliance, engineered for cranial repose during periods of horizontal dormancy",
  hint1 = "Soft and squishy",
  hint2 = "Found on beds",
  showHint1 = false,
  showHint2 = false,
  roundNumber = 1,
  totalRounds = 5,
}: DefinitionDisplayProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-background p-6">
      <div className="flex justify-between items-center mb-4">
        <Badge variant="outline" className="text-lg">
          Round {roundNumber}/{totalRounds}
        </Badge>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-5 w-5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Try to guess the word from this definition!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Card className="p-6 mb-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-2 border-primary/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
        <p className="text-2xl font-serif text-center leading-relaxed text-card-foreground">
          {definition}
        </p>
      </Card>

      <div className="space-y-2">
        {showHint1 && (
          <Card className="p-4 bg-muted">
            <p className="text-sm font-medium">
              <span className="text-primary">Hint 1:</span> {hint1}
            </p>
          </Card>
        )}
        {showHint2 && (
          <Card className="p-4 bg-muted">
            <p className="text-sm font-medium">
              <span className="text-primary">Hint 2:</span> {hint2}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DefinitionDisplay;
