jest.mock("../src/services/DatabaseService/database.service.ts");

import App from "../src/server";

jest.mock("../src/services/SocketService/socket.service"); // SoundPlayer is now a mock constructor
import SocketService from "../src/services/SocketService/socket.service";

describe("server tests", () => {
  jest.useFakeTimers();
  let app: App;

  beforeEach(() => {
    (SocketService as jest.Mock).mockImplementation(() => {
      return {
        run: jest.fn(),
      };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    app.close();
  });

  test("should create and run a socketService instance", async () => {
    app = new App(5000);

    app.run();

    expect(SocketService).toHaveBeenCalled();
  });
});
