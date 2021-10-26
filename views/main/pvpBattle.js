let againstPlayerPokemons;

document.getElementById("ignoreBattle").addEventListener("click", () => {
  document.getElementById("battleRequest").style.left = "-200px";
});

document.getElementById("acceptBattle").addEventListener("click", (e) => {
  document.getElementById("battleRequest").style.left = "-200px";
  let battleAgainst = e.target.parentElement.parentElement.querySelector("p").innerHTML.split(" ")[0];
  socket.emit("battleStart", {name: battleAgainst, pokemons: userData.pokemons});
  let name = [userData.username, battleAgainst];
  name.sort((a,b) => {
    if (a > b) {
      return -1;
    } else if (a < b) {
      return 1;
    } else {
      return 1;
    }
  });
  name = name[0];

  let battle = new Battle(againstPlayerPokemons, userData.pokemons, false);
  battle.isAi = false;
  if (name != userData.username) {
    battle.myTurn = false;
  }
  battle.againstName = battleAgainst;
  currentBattle = battle;
  inBattle = true;
});

socket.on("isOnline", (data) => {
  console.log(data)
});

socket.on("wantsBattle", (data) => {
  againstPlayerPokemons = data.pokemons;
  document.getElementById("battleRequest").style.left = "10px";
  document.querySelector("#battleRequest p").innerHTML = `${data.name} wants to battle`;
});

socket.on("battleStart", (data) => {
  let name = [data.name, userData.username];
  name.sort((a,b) => {
    if (a > b) {
      return -1;
    } else if (a < b) {
      return 1;
    } else {
      return 1;
    }
  });
  name = name[0];
  let battle = new Battle(data.pokemons, userData.pokemons, false);
  battle.isAi = false;
  battle.againstName = data.name;
  if (name != userData.username) {
    battle.myTurn = false;
  }
  currentBattle = battle;
  inBattle = true;
});

socket.on("attack", (data) => {
  if (currentBattle != undefined) {
    console.log(data);
    currentBattle.attack(false, data.damage, data.moveName)
  }
})

function startPvpBattle(user) {
  socket.emit("checkOnline", {name: user, pokemons: userData.pokemons});
}