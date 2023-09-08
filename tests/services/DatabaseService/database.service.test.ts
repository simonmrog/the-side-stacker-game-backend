jest.mock("typeorm");

import {
  Entity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";

jest.mocked(Entity).mockImplementation(() => jest.fn());
jest.mocked(Column).mockImplementation(() => jest.fn());
jest.mocked(PrimaryColumn).mockImplementation(() => jest.fn());
jest.mocked(PrimaryGeneratedColumn).mockImplementation(() => jest.fn());
jest.mocked(CreateDateColumn).mockImplementation(() => jest.fn());
jest.mocked(UpdateDateColumn).mockImplementation(() => jest.fn());
jest.mocked(JoinColumn).mockImplementation(() => jest.fn());
jest.mocked(OneToMany).mockImplementation(() => jest.fn());
jest.mocked(ManyToOne).mockImplementation(() => jest.fn());

import databaseService from "../../../src/services/DatabaseService/database.service";

describe("DatabaseService tests", () => {
  test("should create an instance of DataSource", () => {
    expect(databaseService.dataSource).toBeDefined();
  });
});
