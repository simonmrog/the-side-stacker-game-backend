export interface IPlayer {
  id: string;
  color: string;
}

export class Player implements IPlayer {
  public id: string;
  public color: string;

  constructor(id: string) {
    this.id = id;
    this.color = this.getRandomColor();
  }

  getRandomColor(): string {
    const randomCode = Math.floor(Math.random() * 16777215).toString(16);
    return `#${randomCode}`;
  }
}
