import { IConfig } from "../interfaces/config.interface";

function configFactory(): IConfig {
  return {
    ENV: process.env.NODE_ENV ?? "dev",
    PORT: process.env.PORT ? Number.parseInt(process.env.PORT!) : 4200,
  };
}

export default configFactory();
