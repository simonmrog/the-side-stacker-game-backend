export class Player {
  public id: string;
  public color: string;

  constructor(id: string) {
    this.id = id;
    this.color = this.getRandomColor();
  }

  getRandomColor(): string {
    return "red";
  }
}
