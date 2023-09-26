import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { Player } from "./Player";

@Entity("moves")
export class Move extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("int")
  row: number;

  @Column("text")
  side: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relation with the Player entity
  @ManyToOne(() => Player, (player: Player) => player.moves, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "player_id",
  })
  player: Player;
}
