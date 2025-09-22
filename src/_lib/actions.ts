import { Operation } from "fast-json-patch";
import { Room } from "./types";

export type ClientAction =
  | { type: "SYNC"; room: Room }
  | { type: "PATCH"; data: Operation[] };

export type ServerAction = {
  type: "MOVE_CURSOR";
  pos: { x: number; y: number };
};
