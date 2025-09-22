import PartySocket from "partysocket";
import { createMutable } from "solid-js/store";
import { ClientAction } from "~/_lib/actions";
import { Room } from "~/_lib/types";
import { wsHost } from "~/_lib/utils";
import jsonpatch from "fast-json-patch";
import { createEffect } from "solid-js";

type RoomState =
  | { status: "pending" }
  | { status: "error"; error: Error }
  | { status: "ready"; room: Room; id: string };

const room = createMutable<RoomState>({ status: "pending" });
export const roomStore: Readonly<typeof room> = room;

/////////////////////////////////////////////////////

let websocket: PartySocket | null = null;

export const websocketEffect = (id: string) => {
  createEffect(() => {
    if (websocket) {
      Object.assign(room, { status: "pending" });
      websocket.updateProperties({ room: id });
      websocket.reconnect();
    } else {
      websocket = new PartySocket({
        host: wsHost,
        room: id,
      });

      websocket.onmessage = (message) => {
        const action: ClientAction = JSON.parse(message.data);
        if (action.type === "SYNC") {
          Object.assign(room, {
            status: "ready",
            room: action.room,
            id: websocket?._pk,
          });
        } else if (action.type === "PATCH" && room.status === "ready") {
          jsonpatch.applyPatch(room.room, action.data, false, true);
        }
      };
      websocket.onclose = () =>
        Object.assign(room, {
          status: "error",
          error: new Error("Disconnected"),
        });
      websocket.onerror = () =>
        Object.assign(room, {
          status: "error",
          error: new Error("Connection error"),
        });
    }
  });
};
