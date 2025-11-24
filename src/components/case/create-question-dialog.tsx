"use client";

import { useState } from "react";
import { apiPost } from "@/action/server";
import { API_ENDPOINTS } from "@/action/endpoint";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateQuestionDialogProps {
  caseId: string;
  onQuestionCreated?: () => void;
  trigger?: React.ReactNode;
}

export function CreateQuestionDialog({ caseId, onQuestionCreated, trigger }: CreateQuestionDialogProps) {
  const [open, setOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [priority, setPriority] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim()) {
      toast.error("Question text is required");
      return;
    }

    if (!priority || isNaN(Number(priority))) {
      toast.error("Valid priority number is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiPost(API_ENDPOINTS.CREATE_QUESTION, {
        body: {
          question_text: questionText.trim(),
          priority: Number(priority),
          caseId: caseId,
        },
        includeAuth: true,
      });

      if (response.success) {
        toast.success("Question created successfully");

        // Reset form
        setQuestionText("");
        setPriority("");
        setOpen(false);

        // Notify parent component to refresh questions
        if (onQuestionCreated) {
          onQuestionCreated();
        }
      } else {
        toast.error(response.error || "Failed to create question");
      }
    } catch (error) {
      toast.error("Failed to create question");
      console.error("Error creating question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen);
      if (!newOpen) {
        // Reset form when closing
        setQuestionText("");
        setPriority("");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Question</DialogTitle>
            <DialogDescription>
              Add a new question to this case. Questions are displayed in order of priority.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="questionText">
                Question <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="questionText"
                placeholder="Enter your question here..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                disabled={isLoading}
                required
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {questionText.length}/1000 characters
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">
                Priority <span className="text-destructive">*</span>
              </Label>
              <Input
                id="priority"
                type="number"
                placeholder="e.g., 1"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={isLoading}
                required
                min={1}
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first (1 = highest priority)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !questionText.trim() || !priority}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Question
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
