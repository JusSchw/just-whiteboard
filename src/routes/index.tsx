import { api } from "@convex/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
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
import { Id } from "@convex/dataModel";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();
  const whiteboards = useQuery(api.whiteboard.list);
  const create = useMutation(api.whiteboard.create);
  const enter = useMutation(api.whiteboard.enter);

  const { discover, owned } = whiteboards ?? { discover: [], owned: [] };

  const clickEnter = (id: string) => async () => {
    await enter({ whiteboardId: id });
    navigate({ to: "/whiteboard" });
  };

  return (
    <main>
      {isAuthenticated && (
        <>
          <section>
            {owned && (
              <>
                <h2 className="p-4 text-2xl">Your Whiteboards</h2>
                <div className="grid md:grid-cols-3 grid-cols-1 p-4 gap-2">
                  {owned.map((whiteboard) => (
                    <WhiteboardDisplay
                      whiteboard={whiteboard}
                      isAuthed={isAuthenticated}
                      onClick={clickEnter(whiteboard._id)}
                    />
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
                            variant="outline"
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
                </div>
              </>
            )}
          </section>
          {discover.length > 0 && <Separator />}
        </>
      )}
      {discover.length > 0 && (
        <section>
          <h2 className="p-4 text-2xl">Discover Whiteboards</h2>
          <div className="grid md:grid-cols-3 grid-cols-1 p-4 gap-2">
            {discover.map((whiteboard) => (
              <WhiteboardDisplay
                whiteboard={whiteboard}
                isAuthed={isAuthenticated}
                onClick={clickEnter(whiteboard._id)}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function WhiteboardDisplay({
  whiteboard,
  onClick,
  isAuthed,
}: {
  whiteboard: {
    _id: Id<"whiteboards">;
    _creationTime: number;
    name: string;
    owner: Id<"users">;
    online: number;
  };
  onClick: () => void;
  isAuthed: boolean;
}) {
  return (
    <Item key={whiteboard._id} variant="outline">
      <ItemContent>
        <ItemTitle>{whiteboard.name}</ItemTitle>
        <ItemDescription>online: {whiteboard.online}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button onClick={onClick} disabled={!isAuthed}>
          Enter
        </Button>
      </ItemActions>
    </Item>
  );
}
