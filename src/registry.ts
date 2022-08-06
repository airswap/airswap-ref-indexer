import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
const app = express();

let peers: string[] = [];
const EXPRESS_PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ peers });
});

app.post("/", (req, res) => {
  if (req?.body?.url && peers.indexOf(req?.body?.url) === -1) {
    peers.push(req.body.url);
    res.sendStatus(204);
  } else {
    res.sendStatus(403);
  }
});

app.delete("/:url", (req, res) => {
  if (req?.params?.url) {
    const decodedUrl = Buffer.from(req?.params?.url, 'base64').toString('ascii');
    peers = peers.filter((url) => url != decodedUrl);
    res.sendStatus(204);
  } else {
    res.sendStatus(403);
  }
});

app.listen(EXPRESS_PORT, () => {
  console.log(`Server listening on port ${EXPRESS_PORT}`);
});
