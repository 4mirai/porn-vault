import express from "express";
import * as logger from "./logger";
import { ApolloServer, gql } from "apollo-server-express";
import Image from "./types/image";
import types from "./graphql/types";
import resolvers from "./graphql/resolvers";
import Scene from "./types/scene";
import * as path from "path";
import { libraryPath } from "./types/utility";
import debugHandler from "./debug_handler";
import { checkPassword, passwordHandler } from "./password";
import cors from "cors";
import { getConfig } from "./config/index";

export default async () => {
  const app = express();
  app.use(cors({ origin: "*" }));

  app.use((req, res, next) => {
    logger.http(
      `${req.method} ${req.originalUrl}: ${new Date().toLocaleString()}`
    );
    next();
  });

  app.use("/js", express.static("./app/dist/js"));
  app.use("/css", express.static("./app/dist/css"));
  app.use("/fonts", express.static("./app/dist/fonts"));

  app.get("/password", checkPassword);

  app.use(passwordHandler);

  app.get("/debug", debugHandler);

  app.get("/", (req, res) => {
    const file = path.join(process.cwd(), "app/dist/index.html");
    res.sendFile(file);
  });

  app.use("/scene/:scene", async (req, res, next) => {
    const scene = await Scene.getById(req.params.scene);

    if (scene && scene.path) {
      Scene.watch(scene);
      res.sendFile(await libraryPath(scene.path));
    } else next(404);
  });

  app.use("/image/:image", async (req, res, next) => {
    const image = await Image.getById(req.params.image);

    if (image && image.path) res.sendFile(await libraryPath(image.path));
    else next(404);
  });

  const server = new ApolloServer({ typeDefs: gql(types), resolvers });
  server.applyMiddleware({ app, path: "/ql" });

  app.use(
    (
      err: number,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (typeof err == "number") return res.sendStatus(err);
      return res.sendStatus(500);
    }
  );

  const port = (await getConfig()).PORT || 3000;

  app.listen(port, () => {
    console.log(`Server running in Port ${port}`);
  });
};
