class Player {
	constructor(username, exp, gold, weapon) {
		this.name = username;
		//I'll add levels and stuff if I want each
		//level to have a different amount of exp,
		//but for now, vue can do it
		//this.level = Math.floor(exp/100);
		this.exp = exp; //% 100;
		
		this.gold = gold;
		this.weapon	= weapon;
	}
}

class Weapon {
	constructor(id, name, maxDmg, dmgMultiplier) {
		this.id = id;
		this.name = name;
		this.maxDmg = maxDmg;
		this.dmgMultiplier = dmgMultiplier;
	}
}

class Monster {
	constructor(id, name, hp, exp, reward) {
		this.id = id;
		this.name = name;
		this.hp = hp;
		this.exp = exp;
		this.reward = reward;
	}
}
export{Weapon, Monster, Player}