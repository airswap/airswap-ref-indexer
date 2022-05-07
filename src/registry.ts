import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
const app = express();

let peers: string[] = [];
const EXPRESS_PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ ips: peers });
});

app.post("/", (req, res) => {
  if (req?.body?.ip && peers.indexOf(req?.body?.ip) === -1) {
    peers.push(req.body.ip);
    res.sendStatus(204);
  } else {
    res.sendStatus(403);
  }
});

app.delete("/:ip", (req, res) => {
  if (req?.params?.ip) {
    peers = peers.filter((ip) => ip != req.params.ip);
    res.sendStatus(204);
  } else {
    res.sendStatus(403);
  }
});

app.listen(EXPRESS_PORT, () => {
  console.log(`Server listening on port ${EXPRESS_PORT}`);
});
