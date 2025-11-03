import { api } from "@convex/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const whiteboards = useQuery(api.whiteboard.list);
  return (
    <main>
      <section className="grid grid-cols-3 p-4 gap-2">
        {whiteboards && (
          <>
            {whiteboards.owned.map((whiteboard) => (
              <Item>{whiteboard.name}</Item>
            ))}
            {whiteboards.owned.length < 3 && (
              <Item variant={"muted"}>
                <ItemMedia className="flex items-center h-full">
                  <Plus />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Create Whiteboard</ItemTitle>
                  <ItemDescription>
                    Create a new whiteboard{" "}
                    <span className="">{whiteboards.owned.length} / 3</span>
                  </ItemDescription>
                </ItemContent>
              </Item>
            )}
          </>
        )}
      </section>
      <Separator />
      <section className="grid grid-cols-3 p-4">
        {whiteboards && (
          <>
            {whiteboards.discover.map((whiteboard) => (
              <Item>{whiteboard.name}</Item>
            ))}
          </>
        )}
      </section>
    </main>
  );
}
