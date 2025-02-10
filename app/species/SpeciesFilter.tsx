"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Species {
  id: number;
  scientific_name: string;
  common_name: string | null;
  kingdom: "Animalia" | "Plantae" | "Fungi" | "Protista" | "Archaea" | "Bacteria";
  total_population: number | null;
  image: string | null;
  description: string | null;
  author: string;
}

interface SpeciesFilterProps {
  species: Species[];
  setFilteredSpecies: React.Dispatch<React.SetStateAction<Species[]>>;
}

// You can extend the list of kingdoms (or other criteria) as needed.
// "All" is used as an option to show all species.
const kingdoms = ["All", "Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"];

export default function SpeciesFilter({ species, setFilteredSpecies }: SpeciesFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKingdom, setSelectedKingdom] = useState("All");

  useEffect(() => {
    let filtered = species;

    // Filter by search term in either scientific or common name
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.scientific_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.common_name && s.common_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by kingdom if a specific kingdom is selected
    if (selectedKingdom !== "All") {
      filtered = filtered.filter((s) => s.kingdom === selectedKingdom);
    }

    setFilteredSpecies(filtered);
  }, [searchTerm, selectedKingdom, species, setFilteredSpecies]);

  return (
    <div className="flex flex-wrap gap-4 mb-5">
      {/* Search Input */}
      <Input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-64"
      />

      {/* Kingdom Filter Dropdown */}
      <Select value={selectedKingdom} onValueChange={setSelectedKingdom}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by Kingdom" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {kingdoms.map((kingdom) => (
              <SelectItem key={kingdom} value={kingdom}>
                {kingdom}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
