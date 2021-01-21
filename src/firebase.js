import * as ui from "./ui.js";
import * as main from "./main.js";
import * as classes from "./classes.js";
import * as dnd from "./dnd.js";

let database;
let userRef;
let user;
let uid = "anon";
let hwRefID, classRefID, userInfoRefID;


function setup() {
	var firebaseConfig = {
		apiKey: "AIzaSyDyjJXh5uOqotaMfGsR8PsAPqe7OITIOIg",
		authDomain: "homeworktool-5e54e.firebaseapp.com",
		databaseURL: "https://homeworktool-5e54e.firebaseio.com",
		projectId: "homeworktool-5e54e",
		storageBucket: "homeworktool-5e54e.appspot.com",
		messagingSenderId: "521110190191",
		appId: "1:521110190191:web:1243ff2ba505aeae76759a"
	};
	
	// Initialize Firebase
	firebase.initializeApp(firebaseConfig);
	
	database = firebase.database();
	setupUser();

}

function addHW(hw, repeater) {
	let hwRef = database.ref(hwRefID);// + "/");// + hw.name + "-" + hw.className);
	hwRef.push(hw);
}
function editHW(hw, key) {
	let hwRef = database.ref(hwRefID + "/" + key);
	hwRef.set(hw);
}
function deleteHW(key) {
	let hwRef = database.ref(hwRefID + "/" + key);
	hwRef.remove();
}

function addClass(clss) {
	let classRef = database.ref(classRefID);
	classRef.push(clss);
}
function editClass(clss, key) {
	let classRef = database.ref(classRefID + "/" + key);
	classRef.set(clss);
}
function deleteClass(classKey) {
	let classRef = database.ref(classRefID + "/" + classKey);
	classRef.remove();
	
	let relevantHW = document.querySelectorAll(".hwli#" + classKey);
	for(let hw of relevantHW) {
		deleteHW(hw.getAttribute("data-key"));
	}
}

function updateUserWeapon(weapon) {
	let weaponRef = database.ref(userInfoRefID + "/weapon");
	weaponRef.set(weapon);
}
function updateCurrentMonster(monster) {
	let monsterRef = database.ref(userInfoRefID + "/currentMonster");
	monsterRef.set(monster);
}
function updateUserStats(exp, gold) {
	let goldRef = database.ref(userInfoRefID + "/gold");
	goldRef.set(gold);
	let expRef = database.ref(userInfoRefID + "/exp");
	expRef.set(exp);
}

//auth stuff
function getCurrentUser() {
	firebase.auth().onAuthStateChanged(function(newUser) {
		user = newUser;
		if(user) uid = user.uid;
	});
}
function googleLogin() {
	//sets the auth provider to google - need to find a way to also do this for RIT login
	var provider = new firebase.auth.GoogleAuthProvider();

	//adds the scopes for this authentication - I only want to see their email to 
	//add a user key to their database node for their homework.
	provider.addScope('https://www.googleapis.com/auth/userinfo.email');

		
	//code copied from google firebase auth documentation - signs in with a popup
	firebase.auth().signInWithPopup(provider).then(function(result) {
		// This gives you a Google Access Token. You can use it to access the Google API.
		var token = result.credential.accessToken;
		// The signed-in user info.
		//definitely need this
		user = result.user;

		uid = user.uid;
		userRef = database.ref(uid);
		setupUser();

	}).catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		// The email of the user's account used.
		var email = error.email;
		// The firebase.auth.AuthCredential type that was used.
		var credential = error.credential;

		console.log(error);
	});
}

//TODO add auth for RIT
//TODO add auth for anonymous users by creating a random-generated key and saving it to local storage.

function setupUser() {
	main.app.appStatus = "Setting up user...";
	userRef = database.ref(uid);
	hwRefID = uid + "/hw/";
	classRefID = uid + "/classes/";	
	userInfoRefID = uid + "/userInfo/";	
	
	let username = user ? user.email.split("@")[0] : "anon";
	
	//this works better than seperating the two sections
	let ref = database.ref(uid);
	ref.on("value", (snapshot)=>{
		let data = snapshot.val();		
		if(data) {
			main.app.hws = data.hw;
			if(data.classes) {
				main.app.classes = data.classes;
				main.app.classKeys = Object.keys(data.classes);
			}
			else {
				main.app.classKeys = [];
			}
			
			if(data.hw) {
				main.app.hwKeys = Object.keys(data.hw);
				main.app.sortHW();
			}
			else {
				main.app.hwKeys = [];
			}
			return;
		}
		main.app.appStatus = "Class and homework data updated and loaded!";
	});
	
	let userInfoRef = database.ref(uid + "/userInfo");
	userInfoRef.on("value", (snapshot)=>{
		let data = snapshot.val();
		//return;
		//check for new users
		if(!data) {
			//sets username
			let newUser = new classes.Player(username, 0, 0, dnd.getWeapon("club"));
			newUser.currentMonster = dnd.getMonster("orc");
			userInfoRef.set(newUser);
			return;
		}
		let user = new classes.Player(data.name, parseInt(data.exp), parseInt(data.gold), data.weapon);
		main.app.user = user;
		main.app.monster = data.currentMonster;
		main.app.appStatus = "Player and game data updated and loaded!";
		if(data.currentMonster.hp <= 0) {
			main.app.appStatus = "You beat a monster! Congrats! Go claim your reward with the button in the red area!";
			main.app.showAcceptReward = "visible";
		}else {
			
			main.app.showAcceptReward = "hidden";
		}
	});
	
	getCurrentUser();
}

export {setup, addHW, addClass, deleteHW, editHW, deleteClass, editClass, getCurrentUser, googleLogin, updateUserWeapon, updateCurrentMonster, updateUserStats}