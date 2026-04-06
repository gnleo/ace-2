import { server } from "./server";

server.listen({ host: "0.0.0.0", port: 3333 }).then(() => {
  console.log(`HTTP server running at port ${process.env.PORT}`);
});
