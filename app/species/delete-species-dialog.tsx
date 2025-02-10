"use client";

import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";

interface DeleteSpeciesDialogProps {
  speciesId: string;
}

export function DeleteSpeciesDialog({ speciesId }: DeleteSpeciesDialogProps) {
  const [open, setOpen] = useState(false);
  const supabase = createBrowserSupabaseClient();

  const handleDelete = async () => {
    const { error } = await supabase
      .from("species")
      .delete()
      .eq("id", speciesId);

    if (error) {
      toast({
        title: "Error deleting species",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    // Show success toast
    toast({
      title: "Species Deleted",
      description: "The species has been successfully removed."
    });

    // Close the dialog
    setOpen(false);

    // Force a full page reload so that the species disappears from the UI.
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <p>
            Are you sure you want to delete this species? This action cannot be undone.
          </p>
        </DialogHeader>
        <div className="mt-4 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            className="w-full min-w-[100px]"
            onClick={() => void handleDelete()}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
