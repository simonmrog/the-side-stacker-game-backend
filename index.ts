import config from "./src/config/config";
import App from "./src/server";

(async () => {
  const app = new App(config.PORT);
  await app.run();
})();
