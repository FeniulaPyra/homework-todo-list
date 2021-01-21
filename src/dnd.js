import * as classes from "./classes.js";
import * as database from "./firebase.js";

//const URL = "https://www.dnd5eapi.co";
//const weaponURL = "https://www.dnd5eapi.co/api/equipment/";
//const monsterURL = "https://www.dnd5eapi.co/api/monsters/";

let weapons = [];
let monsters = [];

function setupDND() {
	//get all possible weapons
	//fetch(URL + "/api/equipment-categories/weapon")
		fetch("https://api.open5e.com/weapons/?format=json")
		.then(response=>{
			if(!response.ok) {
				throw Error(response.statusText);
			}
			return response.json();
		}).then(json => {
			weapons = json.results;
			return weapons;
		}).then(weapons=> {
			//get all possible monsters
			for(let i = 1; i <= 22; i++) {
				fetch("https://api.open5e.com/monsters/?format=json&page=" + i)
				.then(response => {
					if(!response.ok) {
						throw Error(response.statusText);
					}
					return response.json();
				}).then(json => {
					monsters = monsters.concat(json.results);
					if(monsters.length > 1050) {
						database.setup();
						database.getCurrentUser();
					}
				});
			}
		})
}

//leave id empty to get a random monster
function getWeapon(id) {
	let weapon;
	if(id == "" || !id) {
		let rand = Math.floor(Math.random() * weapons.length);
		weapon = weapons[rand];
	}
	else {
		weapon = weapons.filter(w => w.slug == id)[0];
	}
	
	let damageDice = weapon.damage_dice.split("d");
	
	
	let simpleWeapon = new classes.Weapon(weapon.slug, 
										  weapon.name, 
										  damageDice[1], 
										  damageDice[0]);
	
	return simpleWeapon;
}
//leave id empty to get a random monster
function getMonster(id, weapon="") {
	let monster;
	if(id == "" || !id) {
		let rand = Math.floor(Math.random() * monsters.length);
		monster = monsters[rand];
	}
	else {
		monster = monsters.filter(m => m.slug == id)[0];
	}
		
	//for now the exp is just equal to the hp :shrug:
	let simpleMon = new classes.Monster(monster.slug, monster.name, monster.hit_points, monster.hit_points, getWeapon(weapon));
	
	//simpleMon! gotta catch 'em all! or is it simp-lemon?
	return simpleMon;
}
function getRandomGoldAmount(max) {
	return Math.floor(Math.rand() * max);
}

export{setupDND, getMonster, getWeapon, getRandomGoldAmount}