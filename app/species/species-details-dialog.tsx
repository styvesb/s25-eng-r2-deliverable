"use client";

import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image"; // <-- Make sure this import is present
import type { Database } from "@/lib/schema";

type Species = Database["public"]["Tables"]["species"]["Row"];

interface SpeciesDetailsDialogProps {
  species: Species;
}

export function SpeciesDetailsDialog({ species }: SpeciesDetailsDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-3 w-full">Learn More</Button>
      </DialogTrigger>

      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{species.scientific_name}</DialogTitle>
          <DialogDescription>
            {species.common_name ?? "No common name provided."}
          </DialogDescription>
        </DialogHeader>

        {/* IMAGE SECTION */}
        {species.image && (
          <div className="relative mt-4 mb-4 h-60 w-full">
            <Image
              src={species.image}
              alt={species.scientific_name}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        )}

        <div className="mt-4">
          <p>
            <strong>Kingdom:</strong> {species.kingdom}
          </p>
          {species.total_population !== null && (
            <p>
              <strong>Total Population:</strong> {species.total_population}
            </p>
          )}
          {species.description && (
            <p className="mt-3 whitespace-pre-line">{species.description}</p>
          )}
        </div>

        <DialogClose asChild>
          <Button className="mt-6 w-full" variant="secondary">
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
