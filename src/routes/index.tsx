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
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();
  const whiteboards = useQuery(api.whiteboard.list);
  const enter = useMutation(api.whiteboard.enter);

  const { discover, owned } = whiteboards ?? { discover: [], owned: [] };
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
                      key={whiteboard._id}
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
                            <span>{owned.length} / 3</span>
                          </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                          <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(true)}
                          >
                            Create
                          </Button>
                        </ItemActions>
                      </Item>
                      {Array.from({ length: 2 - owned.length }, (_, i) => (
                        <Item
                          key={i}
                          className="border border-accent border-dashed"
                        />
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
                key={whiteboard._id}
                whiteboard={whiteboard}
                isAuthed={isAuthenticated}
                onClick={clickEnter(whiteboard._id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Create Whiteboard Dialog */}
      <WhiteboardCreateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
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
interface WhiteboardCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhiteboardCreateDialog({
  open,
  onOpenChange,
}: WhiteboardCreateDialogProps) {
  const create = useMutation(api.whiteboard.create);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    try {
      await create({ name: name.trim() });
      setName("");
      onOpenChange(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Name your new whiteboard</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Enter whiteboard name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isCreating}
          />
        </div>

        <DialogFooter>
          <Button onClick={handleCreate} disabled={!name.trim() || isCreating}>
            {isCreating ? "Creating..." : "Create"}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
