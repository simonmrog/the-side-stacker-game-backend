export interface IPlayer {
  id: string;
  color: string;
  name: string;
}

export class Player implements IPlayer {
  public id: string;
  public color: string;
  public name: string;

  constructor(id: string, color: string, name: string) {
    this.id = id;
    this.color = color;
    this.name = name;
  }
}
