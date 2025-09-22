import { useParams } from "@solidjs/router";
import { roomStore, websocketEffect } from "~/_stores/room";

export default function Page() {
  const params = useParams();

  websocketEffect(params.id);

  return <div>{JSON.stringify(roomStore)}</div>;
}
