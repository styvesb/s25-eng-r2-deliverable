"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const kingdoms = z.enum([
  "Animalia",
  "Plantae",
  "Fungi",
  "Protista",
  "Archaea",
  "Bacteria",
]);

const speciesSchema = z.object({
  scientific_name: z
    .string()
    .trim()
    .min(1)
    .transform((val) => val.trim()),
  common_name: z
    .string()
    .nullable()
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
  kingdom: kingdoms,
  total_population: z.number().int().positive().min(1).nullable(),
  image: z
    .string()
    .url()
    .nullable()
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
  description: z
    .string()
    .nullable()
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
});

type FormData = z.infer<typeof speciesSchema>;

// Default values for the form fields.
const defaultValues: Partial<FormData> = {
  scientific_name: "",
  common_name: null,
  kingdom: "Animalia",
  total_population: null,
  image: null,
  description: null,
};

// Define types for Wikipedia API responses.
interface WikipediaSearchResult {
  title: string;
}

interface WikipediaSearchResponse {
  query: {
    search: WikipediaSearchResult[];
  };
}

interface WikipediaSummaryResponse {
  extract?: string;
  thumbnail?: {
    source: string;
  };
}

export default function AddSpeciesDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState<boolean>(false);
  // State to hold the Wikipedia search query.
  const [wikipediaQuery, setWikipediaQuery] = useState<string>("");

  const form = useForm<FormData>({
    resolver: zodResolver(speciesSchema),
    defaultValues,
    mode: "onChange",
  });

  // Function to search Wikipedia and autofill description & image.
  const handleWikipediaSearch = async (): Promise<void> => {
    if (!wikipediaQuery.trim()) {
      toast({
        title: "Empty Search",
        description: "Please enter a species name to search.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Use the Wikipedia search API to find matching articles.
      const searchRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
          wikipediaQuery
        )}&format=json&origin=*`
      );
      const searchData = (await searchRes.json()) as WikipediaSearchResponse;

      if (!searchData.query.search || searchData.query.search.length === 0) {
        toast({
          title: "No Article Found",
          description: "No Wikipedia article matches your search term.",
          variant: "destructive",
        });
        return;
      }

      // Use the title of the first search result.
      const articleTitle = searchData.query.search[0]!.title;

      // Fetch the article summary from Wikipedia’s REST API.
      const summaryRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          articleTitle
        )}`
      );

      if (!summaryRes.ok) {
        toast({
          title: "Error Fetching Article",
          description: "Could not retrieve the article summary.",
          variant: "destructive",
        });
        return;
      }

      const summaryData = (await summaryRes.json()) as WikipediaSummaryResponse;

      // Autofill the form fields for description and image.
      const articleDescription = summaryData.extract ?? "";
      const articleImage = summaryData.thumbnail?.source ?? "";

      form.setValue("description", articleDescription);
      form.setValue("image", articleImage);

      toast({
        title: "Article Found",
        description: "Description and image fields have been autofilled.",
      });
    } catch (error) {
      console.error("Error searching Wikipedia:", error);
      toast({
        title: "Search Error",
        description:
          "An error occurred while searching Wikipedia. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (input: FormData) => {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from("species").insert([
      {
        author: userId,
        common_name: input.common_name,
        description: input.description,
        kingdom: input.kingdom,
        scientific_name: input.scientific_name,
        total_population: input.total_population,
        image: input.image,
      },
    ]);

    if (error) {
      toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Reset form values to the default.
    form.reset(defaultValues);
    setOpen(false);

    // Force a full page reload so the new species is visible.
    window.location.reload();

    toast({
      title: "New species added!",
      description: "Successfully added " + input.scientific_name + ".",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Icons.add className="mr-3 h-5 w-5" />
          Add Species
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Species</DialogTitle>
          <DialogDescription>
            Add a new species here. Click &quot;Add Species&quot; below when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        {/* Wikipedia Search Field */}
        <div className="mb-4 flex gap-2">
          <Input
            placeholder="Search Wikipedia for species info"
            value={wikipediaQuery}
            onChange={(e) => setWikipediaQuery(e.target.value)}
          />
          <Button type="button" onClick={() => void handleWikipediaSearch()}>
            Search
          </Button>
        </div>

        <Form {...form}>
          <form
            onSubmit={(e: BaseSyntheticEvent) =>
              void form.handleSubmit(onSubmit)(e)
            }
          >
            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="scientific_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scientific Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Cavia porcellus" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="common_name"
                render={({ field }) => {
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Common Name</FormLabel>
                      <FormControl>
                        <Input
                          value={value ?? ""}
                          placeholder="Guinea pig"
                          {...rest}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="kingdom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kingdom</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(kingdoms.parse(value))
                      }
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a kingdom" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {kingdoms.options.map((kingdom, index) => (
                            <SelectItem key={index} value={kingdom}>
                              {kingdom}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total_population"
                render={({ field }) => {
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Total population</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={value ?? ""}
                          placeholder="300000"
                          {...rest}
                          onChange={(event) =>
                            field.onChange(+event.target.value)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => {
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          value={value ?? ""}
                          placeholder="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/George_the_amazing_guinea_pig.jpg/440px-George_the_amazing_guinea_pig.jpg"
                          {...rest}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => {
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          value={value ?? ""}
                          placeholder="The guinea pig or domestic guinea pig, also known as the cavy or domestic cavy, is a species of rodent belonging to the genus Cavia in the family Caviidae."
                          {...rest}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <div className="flex">
                <Button type="submit" className="ml-1 mr-1 flex-auto">
                  Add Species
                </Button>
                <DialogClose asChild>
                  <Button type="button" className="ml-1 mr-1 flex-auto" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
