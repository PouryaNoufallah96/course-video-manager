import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";

interface CreatePlanModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePlanModal({
  isOpen,
  onOpenChange,
}: CreatePlanModalProps) {
  const fetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);

  // Close modal after successful submission (fetcher redirects, so state becomes idle)
  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data === undefined &&
      formRef.current
    ) {
      // Reset form when modal closes
    }
  }, [fetcher.state, fetcher.data]);

  // Close modal when fetcher starts submitting (redirect will happen)
  useEffect(() => {
    if (fetcher.state === "submitting") {
      onOpenChange(false);
      formRef.current?.reset();
    }
  }, [fetcher.state, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Plan</DialogTitle>
        </DialogHeader>
        <fetcher.Form
          ref={formRef}
          method="post"
          action="/api/plans"
          className="space-y-4 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="plan-title">Plan Title</Label>
            <Input
              id="plan-title"
              name="title"
              placeholder="e.g., React Fundamentals Course"
              autoFocus
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={fetcher.state !== "idle"}>
              {fetcher.state !== "idle" ? "Creating..." : "Create Plan"}
            </Button>
          </div>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
