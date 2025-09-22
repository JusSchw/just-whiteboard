import { Operation } from "fast-json-patch";
import { Room } from "./types";
import * as v from "valibot";

export type ClientAction =
  | { type: "SYNC"; room: Room }
  | { type: "PATCH"; data: Operation[] };

export const serverActions = v.object({
  moveCursor: v.object({ x: v.number(), y: v.number() }),
});

export type ServerActions = v.InferInput<typeof serverActions>;
export type ServerActionOutput = {
  [K in keyof ServerActions]: { type: K; data: ServerActions[K] };
}[keyof ServerActions];

export function createActionCaller<T extends Record<string, any>>(
  sendAction: (action: { type: string; data: any }) => void
) {
  return new Proxy({} as { [K in keyof T]: (data: T[K]) => void }, {
    get(_, prop: string) {
      return (data: any) => sendAction({ type: prop, data });
    },
  });
}
