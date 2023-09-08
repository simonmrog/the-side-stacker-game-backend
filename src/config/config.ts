import { IConfig } from "./config.interface";

import "dotenv/config";

function configFactory(): IConfig {
  return {
    ENV: process.env.NODE_ENV ?? "dev",
    PORT: process.env.PORT ? Number.parseInt(process.env.PORT!) : 4200,

    FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",

    POSTGRES_HOST: process.env.POSTGRES_HOST ?? "localhost",
    POSTGRES_USER: process.env.POSTGRES_USER ?? "root",
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ?? "root",
    POSTGRES_DB: process.env.POSTGRES_DB ?? "test_db",
    POSTGRES_PORT: process.env.POSTGRES_PORT ? Number.parseInt(process.env.POSTGRES_PORT!) : 5432,

    GAME_COLOR_BAG: [
      {
        hue: 10,
        saturation: 100,
        lightness: 63.5,
      },
      {
        hue: 208,
        saturation: 75.2,
        lightness: 42.7,
      },
      {
        hue: 43,
        saturation: 100,
        lightness: 60.6,
      },
      {
        hue: 105,
        saturation: 49.8,
        lightness: 45.3,
      },
      {
        hue: 270,
        saturation: 50,
        lightness: 60,
      },
    ],
  };
}

export default configFactory();
