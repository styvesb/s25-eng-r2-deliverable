"use client";

import { useState } from "react";
import type { Database } from "@/lib/schema";
import { Separator } from "@/components/ui/separator";
import { TypographyH2 } from "@/components/ui/typography";
import AddSpeciesDialog from "./add-species-dialog";
import SpeciesCard from "./species-card";

type Species = Database["public"]["Tables"]["species"]["Row"];

interface ClientSpeciesListProps {
  initialSpecies: Species[];
  currentUserId: string;
}

export default function ClientSpeciesList({
  initialSpecies,
  currentUserId
}: ClientSpeciesListProps) {
  // 1. Store species in client-side state
  const [species, setSpecies] = useState<Species[]>(initialSpecies);

  // 2. Callback to remove the species from state
  const removeSpeciesFromState = (id: string) => {
    setSpecies((prev) => prev.filter((s) => s.id !== Number(id)));

  };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <TypographyH2>Species List</TypographyH2>
        <AddSpeciesDialog userId={currentUserId} />
      </div>

      <Separator className="my-4" />

      <div className="flex flex-wrap justify-center">
        {species.map((item) => (
          <SpeciesCard
            key={item.id}
            species={item}
            currentUserId={currentUserId}
            removeSpeciesFromState={removeSpeciesFromState}
          />
        ))}
      </div>
    </>
  );
}
