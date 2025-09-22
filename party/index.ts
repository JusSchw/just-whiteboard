import { Room } from "~/_lib/types";
import type * as Party from "partykit/server";
import jsonpatch from "fast-json-patch";
import { ServerAction } from "~/_lib/actions";

export default class Server implements Party.Server {
  newState: Room;
  oldState: Room;

  constructor(readonly room: Party.Room) {
    this.newState = { users: {} };
    this.oldState = { users: {} };
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    this.room.broadcast(JSON.stringify({ type: "SYNC", room: this.newState }));

    this.newState.users[conn.id] = { name: conn.id, pos: { x: 0, y: 0 } };

    await this.syncClient();
  }

  async onClose(conn: Party.Connection) {
    delete this.newState.users[conn.id];

    await this.syncClient();
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const action: ServerAction = JSON.parse(message);

      if (action.type === "MOVE_CURSOR") {
        this.newState.users[sender.id].pos = action.pos;
      }

      await this.syncClient();
    } catch {}
  }

  async onAlarm() {
    if (this.broadcastPatches()) {
      await this.room.storage.setAlarm(Date.now() + 50);
    }
  }

  async syncClient() {
    const previousAlarm = await this.room.storage.getAlarm();
    if (!previousAlarm) {
      this.broadcastPatches();
      await this.room.storage.setAlarm(Date.now() + 50);
    }
  }

  broadcastPatches() {
    const data = jsonpatch.compare(this.oldState, this.newState);
    this.oldState = structuredClone(this.newState);

    if (data.length > 0) {
      this.room.broadcast(JSON.stringify({ type: "PATCH", data }));
      return true;
    }
    return false;
  }
}

Server satisfies Party.Worker;
