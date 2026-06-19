export enum InputType {
  PLACE,
  REMOVE,
  UP,
  DOWN,
  LEFT,
  RIGHT,
  PENCIL,
}

export interface Player {
  playerId: string;
  username: string;
  selectedCell: number;
  joined: number;
}
