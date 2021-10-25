class Battle {
  constructor(against, myPoke, wild) {
    this.pokemons = against;
    this.mine = myPoke;
    this.myIndex = 0;
    this.againstIndex = 0;
    this.wild = wild;
    this.started = false;
    this.getMoves();
    this.enemySprite;
    this.mySpritesLoaded = 0;
    this.initiated = false;
    this.getMySprites();
    this.myTurn = true;
    this.ground = document.querySelector(".ground");
    this.aiWaitingMove = false;
    this.outcome = "none";
    this.pokeballThrown = false;
    this.pokeballAnimationFrame = 0;
    this.pokeballCaught = false;
    this.pokeballsSprite = document.getElementById("pokeballs");
    this.pokeballAnimationRunningFor = 0;
  };

  getMoves() {
    for (let j=0; j<this.pokemons.length; j++) {
      this.pokemons[j].moves = [];
      const xhr = new XMLHttpRequest();
      xhr.open("GET", this.pokemons[j].url);
      xhr.onload = () => {
        let res = JSON.parse(xhr.response);
        this.pokemons[j].sprite = res.sprites.front_default;
        let moveChoices = res.moves.filter(m => m.version_group_details[0].move_learn_method.name == "level-up" && m.version_group_details[0].level_learned_at <= this.pokemons[j].level);

        let moves = [];
        let moveLen = 4;
        if (moveChoices.length < 4) {
          moveLen = moveChoices.length;
        }

        for (let i=0; i<moveLen; i++) {
          let ind = Math.floor(Math.random() * moveChoices.length);
          moves.push(moveChoices[ind].move);
          moveChoices.splice(ind, 1);
        }

        let moveCount = 0;
        moves.forEach(m => {
          const x = new XMLHttpRequest();
          x.open("GET", m.url);
          x.onload = () => {
            moveCount += 1;
            let stats = JSON.parse(x.response);
            let move = {name: m.name, accuracy: stats.accuracy, statChanges: stats.stat_changes, type: stats.type.name, power: stats.power};
            this.pokemons[j].moves.push(move)
            if (moveCount == moves.length && j == this.pokemons.length - 1) {
              this.start();
            }
          };

          x.send();
        })
      };

      xhr.send();
    }
  }

  getMySprites() {
    for (let j=0; j<this.mine.length; j++) {
      let url = this.mine[j].url;
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onload = () => {
        let res = JSON.parse(xhr.response);
        document.querySelector("#images").innerHTML += `<img src="${res.sprites.back_default}" class="mine ${this.mine[j].name}"/>`;

        document.querySelector(`.${this.mine[j].name}`).onload = () => {
          this.mine[j].sprite = document.querySelector(`.${this.mine[j].name}`);
          this.mySpritesLoaded += 1;
        }
      }
      xhr.send()
    }
  }

  start() {
    console.log("Start")
    this.getAgainstSprite();
    this.init();
  }

  getAgainstSprite() {
    let url = this.pokemons[this.againstIndex].sprite;
    document.querySelector("#images").innerHTML += `<img src="${url}" class="against ${this.againstIndex}"/>`;
    document.querySelector(".against").onload = () => {
      this.enemySprite = document.querySelector(".against");
      this.started = true;
    }
  }

  draw(ctx) {
    if (this.started) {
      ctx.drawImage(this.ground, 0, 0, 512, 512);
      if (this.enemySprite != undefined && this.mySpritesLoaded >= this.mine.length) {
        if (!this.pokeballThrown) {
          ctx.drawImage(this.enemySprite, 270, 120, 200, 200);
        }
        ctx.drawImage(this.mine[this.myIndex].sprite, 130, 330, 200, 200);
      }
    }
  }

  getHp() {
    let againstHp = 100 + (this.pokemons[this.againstIndex].level * 3);
    let myHp = 100 + (this.mine[this.myIndex].level * 3);
    if (this.pokemons[this.againstIndex].hp == undefined) {
      this.pokemons[this.againstIndex].hp = againstHp;
    }
    if (this.mine[this.myIndex].hp == undefined) {
      this.mine[this.myIndex].hp = myHp;
    }

    let myHealth = this.mine[this.myIndex].hp;
    let againstHealth = this.pokemons[this.againstIndex].hp;
    let myPokeName = this.mine[this.myIndex].name;
    let againstPoke = this.pokemons[this.againstIndex].name;
    let againstLevel = this.pokemons[this.againstIndex].level;
    let myLevel = this.mine[this.myIndex].level;
    let myHealthPc = Math.floor((myHealth / myHp) * 100);
    let againstHpPc = Math.floor((againstHealth / againstHp) * 100);
    document.getElementById("battleStats").innerHTML = `<p class="pokemonStat">${myPokeName} lvl ${myLevel}: <span class="hpContainer"><span class="hp myHp" style="width: ${myHealthPc}% "></span></span> hp</p><br><p class="pokemonStat">${againstPoke} lvl ${againstLevel}: <span class="hpContainer"><span class="hp againstHp" style="width: ${againstHpPc}% "></span></span> hp</p>`
  };

  updateHp() {
    let againstHp = 100 + (this.pokemons[this.againstIndex].level * 3);
    let myHp = 100 + (this.mine[this.myIndex].level * 3);
    if (this.pokemons[this.againstIndex].hp == undefined) {
      this.pokemons[this.againstIndex].hp = againstHp;
    }
    if (this.mine[this.myIndex].hp == undefined) {
      this.mine[this.myIndex].hp = myHp;
    }

    let myHealth = this.mine[this.myIndex].hp;
    let againstHealth = this.pokemons[this.againstIndex].hp;
    let myPokeName = this.mine[this.myIndex].name;
    let againstPoke = this.pokemons[this.againstIndex].name;
    let againstLevel = this.pokemons[this.againstIndex].level;
    let myLevel = this.mine[this.myIndex].level;
    let myHealthPc = Math.floor((myHealth / myHp) * 100);
    let againstHpPc = Math.floor((againstHealth / againstHp) * 100);
    document.querySelector(".myHp").style.width = `${myHealthPc}%`;
    document.querySelector(".againstHp").style.width = `${againstHpPc}%`;
  }

  init() {
    let availableMoves = this.mine[this.myIndex].moves
    while (availableMoves.length < 4) {
      availableMoves.push({name: "", type: ""})
    }
    document.getElementById(`movesCont1`).innerHTML = "";
    document.getElementById(`movesCont2`).innerHTML = "";
    for (let i=0; i<availableMoves.length; i++) {
      let selected;
      if (i % 2 == 0) {
        selected = document.getElementById(`movesCont1`)
      } else {
        selected = document.getElementById(`movesCont2`)
      }
      let moveName = availableMoves[i].name;
      let type = availableMoves[i].type;
      moveName = moveName.split("-");
      moveName = moveName.join(" ");
      if (availableMoves[i].power === null) {
        availableMoves[i].power = 30;
      }
      selected.innerHTML += `<div onClick="currentBattle.attack(true, ${availableMoves[i].power}, '${moveName}')" class="move ${type}"><p>${moveName}</p></div>`;
    }

    document.getElementById("controlContainer").innerHTML = `<div class="bagBtn" onclick="currentBattle.openBag()">Bag</div><div class="runBtn" onclick="currentBattle.run()">Run</div>`

    this.getHp();
  }

  attack(me, damage, name) {
    if (me && this.myTurn && damage != undefined && !this.pokeballThrown) {
      this.pokemons[this.againstIndex].hp -= damage;
      if (this.pokemons[this.againstIndex].hp <= 0) {
        this.pokemons[this.againstIndex].hp = 0;
      }
      this.myTurn = false;
      this.updateHp();
      let myName = this.mine[this.myIndex].name
      writeDialog(`${myName} used ${name}!`);
    } else if (!me && !this.myTurn && !this.pokeballThrown) {
      if (damage == undefined) {
        damage = 30;
      }
      this.mine[this.myIndex].hp -= damage;
      if (this.mine[this.myIndex].hp <= 0) {
        this.mine[this.myIndex].hp = 0;
      }
      this.myTurn = true;
      this.aiWaitingMove = false;
      this.updateHp();
      let againstName = this.pokemons[this.againstIndex].name;
      writeDialog(`${againstName} used ${name}!`);
    }

    if (this.pokemons[this.againstIndex].hp <= 0) {
      this.die(false);
    }

    if (this.mine[this.myIndex].hp <= 0) {
      this.die(true);
    }
  }

  aiMakeMove() {
    let moveOptions = this.pokemons[this.againstIndex].moves;
    let m = Math.floor(Math.random() * moveOptions.length);
    let move = moveOptions[m];
    this.attack(false, move.power, move.name);
  }

  die(me) {
    if (me) {
      if (this.mine.find(p => p.hp === undefined || p.hp > 0) == undefined) {
        this.lose();
      } else {
        this.myIndex += 1;
        writeDialog(this.mine[this.myIndex-1].name + ` has fainted. Go ${this.mine[this.myIndex].name}!`);
      }
    } else {
      if (this.mine[this.myIndex].xp == undefined) {
        this.mine[this.myIndex].xp = 40;
      } else {
        this.mine[this.myIndex].xp += 40;
      }

      if (this.mine[this.myIndex].xp >= 100) {
        this.mine[this.myIndex].level += 1;
        this.mine[this.myIndex].xp = this.mine[this.myIndex].xp - 100;
        this.levelUp();
      }

      if (this.pokemons.find(p => p.hp === undefined || p.hp > 0) == undefined) {
        this.win()
      } else {
        console.log("ASDF");
        document.querySelector(".against").outerHTML = "";
        this.enemySprite = "";
        this.againstIndex += 1;
        let url = this.pokemons[this.againstIndex].sprite;
        document.getElementById("images").innerHTML += `<img src="${url}" class="against ${this.againstIndex}"/>`;
        this.enemySprite = document.querySelector(".against");
      }
    }
    this.init();
  }

  lose() {
    this.outcome = "lose";
  }

  win() {
    this.outcome = "win";
  }

  static end() {
    document.getElementById("images").innerHTML = "";
    document.getElementById("battleStats").innerHTML = "";
    document.querySelectorAll(".movesCont").forEach(c => {
      c.innerHTML = ""
    });
    document.getElementById("controlContainer").innerHTML = "";
    document.getElementById("bagContainer").innerHTML = "";
 }

  run() {
    if (this.pokeballThrown == false && this.wild) {
      this.outcome = "run";
    }

    if (!this.wild) {
      writeDialog("You cannot run from this battle.");
    }
  }

  openBag() {
    document.getElementById("movesContainer").style.display = "none";
    document.getElementById("bagContainer").style.display = "block";
    document.getElementById("controlContainer").innerHTML = `<div class="bagBackBtn" onClick="currentBattle.closeBag()">Back</div>`;
    userData.bag.forEach(item => {
      if (item.amount > 0) {
        document.getElementById("bagContainer").innerHTML += `<div class="bagItem" onclick="currentBattle.useItem('${item.name}')"><label>${item.name}</label><label>x${item.amount}</label></div>`;
      }
    })
  }

  closeBag() {
    document.getElementById("movesContainer").style.display = "flex";
    document.getElementById("bagContainer").style.display = "none";
    document.getElementById("controlContainer").innerHTML = `<div class="bagBtn" onclick="currentBattle.openBag()">Bag</div><div class="runBtn" onclick="currentBattle.run()">Run</div>`;
    document.getElementById("bagContainer").innerHTML = "";
  }

  useItem(itemName) {
    for (let i=0; i<userData.bag.length; i++) {
      if (userData.bag[i].name == itemName) {
        userData.bag[i].amount -= 1;
      }
    }

    if (itemName == "pokeball" && this.pokeballThrown == false) {
      this.throwPokeball(itemName, 255);
    }
  }

  throwPokeball(name, rate) {
    if (this.wild) {
      let maxHp = 100 + (this.pokemons[this.againstIndex].level * 3);
      let hpPc = this.pokemons[this.againstIndex].hp / maxHp;
      let chanceChange = 1 - hpPc;
      chanceChange *= 100;
      let catchProb = Math.floor(Math.random() * rate);
      catchProb -= chanceChange
      if (catchProb <= 30) {
        this.pokeballCaught = true;
        this.runCatchAnimation(true);
      } else {
        this.pokeballCaught = false;
        this.runCatchAnimation(false);
      }
    }
  }

  runCatchAnimation(caught) {
    if (this.pokeballThrown == false) {
      this.pokeballThrown = true;
    }
    this.pokeballAnimationFrame += 1;
    let frame = 10 + Math.floor(this.pokeballAnimationFrame / 8);
    if (frame == 15) {
      this.pokeballAnimationFrame = 9;
      this.pokeballAnimationRunningFor += 1;
      if (this.pokeballAnimationRunningFor == 3) {
        console.log(caught);
        if (caught) {
          this.caught();
        } else {
          this.pokeballThrown = false;
          this.pokeballAnimationFrame = 0;
          this.pokeballAnimationRunningFor = 0;
          this.pokeballCaught = false;
          this.myTurn = false;
        }
      }
    }
    console.log(frame);
    ctx.drawImage(this.pokeballsSprite, 0, 7 + (frame * 29), 32, 28, 340, 230, 32, 32);
  }

  caught() {
    this.outcome = "caught";
  }

  levelUp() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", this.mine[this.myIndex].url);

    xhr.onload = () => {
      let res = JSON.parse(xhr.response);
      res = res.moves;
      let lvl = this.mine[this.myIndex].level
      let moves = res.filter(m => m.version_group_details[0].move_learn_method.name == "level-up");
      moves = moves.filter(m => m.version_group_details[0].level_learned_at <= lvl);
      let sorted = moves.sort((a, b) => {
        let r = a.version_group_details[0].level_learned_at;
        let l = b.version_group_details[0].level_learned_at;
        if (r < l) {
          return 1;
        } else if (r > l) {
          return -1;
        } else {
          return 0;
        }
      });
      let chosenMoves = [];
      let l = sorted.length;
      if (l >= 4) {
        l = 4
      }
      for (let i=0; i<l; i++) {
        chosenMoves.push(sorted[i])
      };

      let output = [];
      chosenMoves.forEach((m) => {
        let url = m.move.url;
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = () => {
          let res = JSON.parse(xhr.response);
          let m = {
            accuracy: res.accuracy,
            name: res.name,
            power: res.power,
            statChanges: res.stat_changes,
            type: res.type.name
          };
          output.push(m);
          if (output.length == l) {
            console.log(output);
            this.mine[this.myIndex].moves = output;
            this.init();
            saveData();
          }
        };

        xhr.send();
      });
    };

    xhr.send();
  }
}