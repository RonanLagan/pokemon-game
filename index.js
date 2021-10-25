const express = require("express");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const crypto = require("crypto");

let pokemons;
axios.get("https://pokeapi.co/api/v2/pokemon?limit=151").then((r) => {
  pokemons = r.data;
})

const app = express();
app.use(express.static(path.join(__dirname, "views")));
app.use(express.json())

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
  let cookie = req.headers["cookie"];
  if (cookie == undefined) {
    res.redirect("/connect");
  } else {
    res.sendFile(path.join(__dirname, "views", "main", "index.html"));
  }
});

app.get("/editor", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "editor", "index.html"));
});

app.get("/connect", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "connect", "index.html"));
});

app.post("/connect", (req, res) => {
  let {username, password} = req.body;
  if ((username == undefined || username == "") == false && (password == undefined || password == "") == false) {
    password = crypto.createHash("sha256").update(password).digest("hex");
    let dir = fs.readdirSync("./user-data");
    if (dir.includes(`${username}.json`) == false) {
      let id = crypto.createHash("sha256").update(`${password}---${username}`).digest("hex");
      let data = {username, password, pokemons: [], level: "test", bag: [], id};
      fs.writeFileSync(`./user-data/${username}.json`, JSON.stringify(data));
      fs.appendFileSync("./ids", `${id}:${username}\n`);
      res.setHeader("Set-Cookie", `id=${id}`);
      res.send("Ok");
    } else {
      let f = fs.readFileSync("./user-data/"+username+".json", "utf8");
      f = JSON.parse(f);
      if (f.password == password) {
        let id = f.id;
        res.setHeader("Set-Cookie", `id=${id}`);
        res.send("Ok");
      } else {
        res.send("Incorrect password");
      }
    }
  } else {
    res.send("Nom d'utilisateur ou mot de passe invalide");
  }
});

app.get("/user-data", (req, res) => {
  let id = req.headers["cookie"];
  if (id == undefined) {
    res.json({})
  } else {
    id = id.split("=")[1];
    let userIds = fs.readFileSync("./ids", "utf8");
    let uid = userIds.split("\n").find(u => u.includes(id));
    let user = uid.split(":")[1];
    let uData = JSON.parse(fs.readFileSync("./user-data/"+user+".json", "utf8"));
    res.json({username: uData.username, pokemons: uData.pokemons, level: uData.level, bag: uData.bag});
  }
})

app.post("/saveLevel", (req, res) => {
  console.log(req.body)
  fs.writeFileSync("./levels/"+req.body.name+".json", JSON.stringify(req.body));

  res.send("OK");
});

app.post("/save", (req, res) => {
  let baseData = fs.readFileSync(`./user-data/${req.body.username}.json`, "utf8");
  baseData = JSON.parse(baseData);
  baseData.pokemons = req.body.pokemons;
  baseData.bag = req.body.bag;
  baseData.level = req.body.level;
  console.log(baseData);
  fs.writeFileSync(`./user-data/${req.body.username}.json`, JSON.stringify(baseData));
  res.send("OK")
})

app.get("/level/:levelName", (req, res) => {
  let {levelName} = req.params;
  let level = fs.readFileSync(`./levels/${levelName}.json`, "utf8");

  res.send(level);
});

app.listen(4000, () => {
  console.log("Server started");
})