import {
  Entity,
  BaseEntity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";

import { Game } from "./Game";
import { Move } from "./Move";

@Entity("players")
export class Player extends BaseEntity {
  @PrimaryColumn({
    type: "varchar",
  })
  id: string;

  @Column({
    type: "varchar",
  })
  name: string;

  @Column({
    type: "varchar",
  })
  color: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relation with the Game entity
  @ManyToOne(() => Game, (game: Game) => game.players, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "game_id",
  })
  game: Game;

  // Relation with Player entity
  @OneToMany(() => Move, move => move.player)
  moves: Array<Move>;
}
