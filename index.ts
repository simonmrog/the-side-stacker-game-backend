import { initServer } from "./src/server";

import config from "./src/config/config";

const server = initServer();

server.listen(config.PORT, () => console.log(`Server running on port ${config.PORT}`));
