import { useParams } from "@solidjs/router";
import { Match, Switch } from "solid-js";
import { roomReady, roomState, websocketEffect } from "~/_stores/room";

export default function Page() {
  const params = useParams();

  websocketEffect(params.id);

  return (
    <Switch>
      <Match when={roomState.status === "error"}>
        <main>Error!</main>
      </Match>
      <Match when={roomState.status === "pending"}>
        <main>Loading...</main>
      </Match>
      <Match when={roomState.status === "ready"}>
        <WhiteBoard />
      </Match>
    </Switch>
  );
}

function WhiteBoard() {
  return <main></main>;
}
