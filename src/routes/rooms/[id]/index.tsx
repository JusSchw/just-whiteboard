import { useParams } from "@solidjs/router";
import { ErrorBoundary, Match, Switch } from "solid-js";
import { RoomState, roomState, websocketEffect } from "~/_stores/room";

export default function Page() {
  const params = useParams();

  websocketEffect(params.id);

  return (
    <ErrorBoundary fallback={<Error />}>
      <Switch fallback={<Error />}>
        <Match when={roomState.status === "pending"}>
          <Loading />
        </Match>
        <Match when={roomState.status === "ready"}>
          <Whiteboard roomState={roomState as any} />
        </Match>
      </Switch>
    </ErrorBoundary>
  );
}

function Whiteboard(props: {
  roomState: Extract<RoomState, { status: "ready" }>;
}) {
  const { room, id } = props.roomState;

  return <main></main>;
}

function Loading() {
  return <main>Loading...</main>;
}

function Error() {
  return <main>Error!</main>;
}
