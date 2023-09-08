import { Entity, BaseEntity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";

import { GameStatus } from "../services/GameService/game.interface";
import { Player } from "./Player";

@Entity("games")
export class Game extends BaseEntity {
  @PrimaryColumn({
    type: "varchar",
  })
  id: string;

  @Column({
    type: "enum",
    enum: GameStatus,
  })
  status: GameStatus;

  // Stringify the board matrix to store the game as string
  @Column({
    type: "varchar",
    nullable: true,
  })
  board: string | null;

  @Column({
    type: "varchar",
    nullable: true,
  })
  current_player: string | null;

  @Column({
    type: "varchar",
    nullable: true,
  })
  winner_socket_id: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relation with Player entity
  @OneToMany(() => Player, player => player.game)
  players: Array<Player>;
}
