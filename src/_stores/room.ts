import PartySocket from "partysocket";
import { createMutable } from "solid-js/store";
import {
  ClientAction,
  createActionCaller,
  ServerActions,
} from "~/_lib/actions";
import { Room } from "~/_lib/types";
import { wsHost } from "~/_lib/utils";
import jsonpatch from "fast-json-patch";
import { batch, createEffect } from "solid-js";

export type RoomState =
  | { status: "pending" }
  | { status: "error"; error: Error }
  | { status: "ready"; room: Room; id: string };

export const roomState = createMutable<RoomState>({ status: "pending" });

/////////////////////////////////////////////////////

let websocket: PartySocket | null = null;

export const websocketEffect = (id: string) => {
  createEffect(() => {
    if (websocket) {
      Object.assign(roomState, { status: "pending" });
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
          Object.assign(roomState, {
            status: "ready",
            room: action.room,
            id: websocket?._pk,
          });
        } else if (action.type === "PATCH" && roomState.status === "ready") {
          batch(() =>
            jsonpatch.applyPatch(roomState.room, action.data, false, true)
          );
        }
      };
      websocket.onclose = () =>
        Object.assign(roomState, {
          status: "error",
          error: new Error("Disconnected"),
        });
      websocket.onerror = () =>
        Object.assign(roomState, {
          status: "error",
          error: new Error("Connection error"),
        });
    }
  });
};

export const serverAction = createActionCaller<ServerActions>((action) => {
  websocket?.send(JSON.stringify(action));
});
