export interface IPlayer {
  id: string;
  color: string;
}

export class Player implements IPlayer {
  public id: string;
  public color: string;

  constructor(id: string, color: string) {
    this.id = id;
    this.color = color;
  }
}
