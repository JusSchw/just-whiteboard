import { api } from "@convex/api";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
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
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const whiteboards = useQuery(api.whiteboard.list);
  const create = useMutation(api.whiteboard.create);
  const enter = useMutation(api.whiteboard.enter);

  if (whiteboards === undefined) return <></>;
  const { discover, owned } = whiteboards;

  return (
    <main>
      <section className="grid grid-cols-3 p-4 gap-2">
        {whiteboards && (
          <>
            {owned.map((whiteboard) => (
              <Item>
                <ItemContent>
                  <ItemTitle>{whiteboard.name}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Button>Enter</Button>
                </ItemActions>
              </Item>
            ))}
            {owned.length < 3 && (
              <>
                <Item variant={"muted"}>
                  <ItemMedia className="flex items-center h-full">
                    <Plus />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Create Whiteboard</ItemTitle>
                    <ItemDescription>
                      Create a new whiteboard{" "}
                      <span className="">{owned.length} / 3</span>
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      variant={"outline"}
                      onClick={() => create({ name: "test" })}
                    >
                      Create
                    </Button>
                  </ItemActions>
                </Item>
                {Array.from({ length: 2 - owned.length }, () => (
                  <Item className="border border-accent border-dashed" />
                ))}
              </>
            )}
          </>
        )}
      </section>
      <Separator />
      <section className="grid grid-cols-3 p-4">
        {discover.map((whiteboard) => (
          <Item>
            <ItemContent>
              <ItemTitle>{whiteboard.name}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <Button>Enter</Button>
            </ItemActions>
          </Item>
        ))}
      </section>
    </main>
  );
}
