export type ValueOf<T extends Object> = T[keyof T];

export type UserId = string;
export type User = { name: string; pos: { x: number; y: number } };
export type Room = {
  users: Record<UserId, User>;
};
