"use client";

import Image from "next/image";
import type { Database } from "@/lib/schema";
import { SpeciesDetailsDialog } from "./species-details-dialog";
import { EditSpeciesDialog } from "./edit-species-dialog";
import { DeleteSpeciesDialog } from "./delete-species-dialog"; // <-- import it

type Species = Database["public"]["Tables"]["species"]["Row"];

interface SpeciesCardProps {
  species: Species;
  currentUserId: string;
  updateSpeciesInState?: (updatedSpecies: Species) => void;
  removeSpeciesFromState?: (speciesId: string) => void; // add optional for clarity
}

export default function SpeciesCard({
  species,
  currentUserId,
  removeSpeciesFromState,
}: SpeciesCardProps) {
  const isAuthor = species.author === currentUserId;

  return (
    <div className="m-4 w-72 min-w-72 flex-none rounded border-2 p-3 shadow flex flex-col">
      {species.image && (
        <div className="relative h-40 w-full">
          <Image
            src={species.image}
            alt={species.scientific_name}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
      )}
      <div className="flex-grow">
  <h3 className="mt-3 text-2xl font-semibold">{species.scientific_name}</h3>
  <h4 className="text-lg font-light italic">{species.common_name}</h4>
  <p>
    {species.description
      ? species.description.slice(0, 150).trim() + "..."
      : ""}
  </p>
</div>

      {/* "Learn More" Dialog */}
      <SpeciesDetailsDialog species={species} />

      {/* Only show "Edit" + "Delete" if current user is the author */}
      {isAuthor && (
  <div className="mt-3 flex items-center justify-between gap-2">
    <EditSpeciesDialog species={species} />
    {removeSpeciesFromState && (
      <DeleteSpeciesDialog
        speciesId={String(species.id)}
      />
    )}
  </div>
)}


    </div>
  );
}
