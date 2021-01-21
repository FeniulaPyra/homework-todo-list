import * as database from "./firebase.js";
import * as ui from "./ui.js";
import * as colors from "./colors.js";
import * as dnd from "./dnd.js";
import * as dates from "./date-time-format.js";

let sortOrderStorageID = "lep2738-sortOrder";
let filtersStorageID = "lep2738-classFilters";
let dateFormatStorageID = "lep2738-dateFormat";
let timeFormatStorageID = "lep2738-timeFormat";
//let completedStorageID = "lep2738-showHideCompleted";

let monthKey = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];

function init() {
	dnd.setupDND();
}
let app = new Vue({
	el: "main",
	data: {
		//hwKey is outside of hw to make it easier to update the Firebase Database
		hwKey: "",
		hw: {
			name: "",
			date: "",
			time: "",
			priority: 3,
			classKey: ""
		},
		
		//to iterate thru hws
		hwKeys: [],
		hws: {},
		hwFormInvalid: true,
		
		
		//classkey is outside of classInfo to make it easier to update the Firebase Database
		classKey: "",
		classInfo: {
			name: "",
			color: "",
			building: "",
			room: "",
			time: "",
			days: {
					monday: false,
					tuesday: false,
					wednesday: false,
					thursday: false,
					friday: false,
					saturday: false,
					sunday: false
			}
		},
		repeater: {
			reapeats: false,
			days: {
				monday: false,
				tuesday: false,
				wednesday: false,
				thursday: false,
				friday: false,
				saturday: false,
				sunday: false
			}
		},
	
		//to iterate thru classes
		classKeys: [],
		classes: {},
		classFormInvalid: true,
		
		
		sortOrder: [
			"Due Date",
			"Priority",
			"Class",
			"Name"
		],
		dateFormat: "m/d/Y",
		timeFormat: "g:ia",
		showCompletedHWs: false,
		
		user: {
			name: "anon",
			weapon: {},
			gold: 0,
			exp: 0,
		},
		monster: {
			//imgurl: "",
			name: "",
			hp: 0,
			reward: {}
		},
		showAcceptReward: "hidden",
		
		maxPriority: 10,
		priorityColors: ["#FF0000", "#00FF00"],

		appStatus: "LOADING MONSTERS..."
		
	},
	methods: {
		startAddHW() {
			ui.switchToPanel("addHW");
		},
		isHWFormValid() {
			
			if(this.hw.name != ""  && this.hw.date != ""  && this.hw.time != ""  && this.hw.classKey != "") {
				this.hwFormInvalid = false;

			}
			else {
				this.hwFormInvalid = true;
			}
		},
		addHW() {
			if(this.hw.priority > 10)
				this.hw.priority = 10;
			if(this.hw.priority <= 0)
				this.hw.priority = 1;
			database.addHW(this.hw, this.repeater);
		},
		editHW(e) {
			this.startAddHW();
			
			this.hwFormInvalid = false;
			document.querySelector("#deleteHW").style.display="block";
			document.querySelector("#updateHW").style.display="block";
			document.querySelector("#addNewHW").style.display="none";
			
			let hw = e.target.parentElement;
			this.hw.name = hw.querySelector("h2").innerHTML;
			this.hw.classKey = hw.getAttribute("id");
			this.hw.date = hw.getAttribute("data-date");
			this.hw.time = hw.getAttribute("data-time");
			this.hwKey = hw.getAttribute("data-key");
			this.hw.priority = hw.getAttribute("data-priority");
		},
		updateHW() {
			if(this.hw.priority > 10)
				this.hw.priority = 10;
			if(this.hw.priority <= 0)
				this.hw.priority = 1;
			database.editHW(this.hw, this.hwKey);
		},
		deleteHW() {
			database.deleteHW(this.hwKey);
		},
		resetHWForm() {
			this.hw.name = "";
			this.hw.date = "";
			this.hw.time = "";
			this.hw.priority = 3;
			//this.hw.className = "";
			this.hw.classKey = "";
			this.hwKey = "";
			
			document.querySelector("#addNewHW").style.display="inline";
			this.hwFormInvalid = true;
			document.querySelector("#updateHW").style.display="none";
			document.querySelector("#deleteHW").style.display="none";
		},
		completeHW(e) {
			//in case the user just clicked the button, in which case we don't
			//actually want it to complete
			if(e.target.tagName == "BUTTON") 
				return;
			
			//in case the user clicks on the title or something else by accident, 
			//we still want to be able to complete it
			let hwEl = e.target.closest(".hwli");
			let hwKey = hwEl.getAttribute("data-key");
			
			let completedHW = this.hws[hwKey];
			completedHW.completed = !completedHW.completed;
			database.editHW(completedHW, hwKey);
			
			
			//alright so do all that and then
			
			//I know I know this isn't how rolls work
			let damage = parseInt(this.user.weapon.dmgMultiplier) * Math.floor(Math.random() * parseInt(this.user.weapon.maxDmg) + 1);

			if(completedHW.completed) {
				//do damage to monster
				this.monster.hp -= damage;

				//check if monster is dead
				if(this.monster.hp <= 0){
					//if dead, show popup with weapon reward asking if user would like to take it
					this.showAcceptReward = "visible";
					//get a new monster and a new reward, display them in the ui
				}
				//update monster info.
				database.updateCurrentMonster(this.monster);
			}
			
		},
		reward(taken) {
			if(taken) {
				this.user.weapon = this.monster.reward;
				database.updateUserWeapon(this.user.weapon);
			}
			this.showAcceptReward = "hidden";
			//gets a new monster
			this.getNewMonster();
		},
		getNewMonster() {
			database.updateUserStats(this.user.exp + this.monster.exp, this.user.gold + Math.ceil(this.monster.exp / 10));
			this.monster = dnd.getMonster();
			database.updateCurrentMonster(this.monster);
		},
		
		startAddClass() {
			ui.switchToPanel("addClass");
		},
		isClassFormValid() {
			if(this.classInfo.name != "" 
			   && isNaN(this.classInfo.name[0]) 
			   && !this.classInfo.name.includes(".") 
			   && !this.classInfo.name.includes("#") 
			   && !this.classInfo.name.includes("$")  
			   && !this.classInfo.name.includes("[")  
			   && !this.classInfo.name.includes("]")) {
				this.classFormInvalid = false;
			}
			else {
				this.classFormInvalid = true;
			}
		},
		addClass() {
			database.addClass(this.classInfo);
		},
		editClass(e) {
			let clss = e.target.parentElement;
			
			this.classFormInvalid = false; 
			document.querySelector("#deleteClass").style.display="block";
			this.classFormInvalid = false;
			
			document.querySelector("#updateClass").style.display="block";
			document.querySelector("#addNewClass").style.display="none";

			this.classInfo.name = clss.firstChild.nextElementSibling.innerHTML;
			this.classInfo.building = clss.getAttribute("data-building");
			this.classInfo.room = clss.getAttribute("data-room");
			this.classInfo.time = clss.getAttribute("data-time");
			this.classInfo.days.monday = clss.getAttribute("monday");
			this.classInfo.days.tuesday = clss.getAttribute("tuesday");
			this.classInfo.days.wednesday = clss.getAttribute("wednesday");
			this.classInfo.days.thursday = clss.getAttribute("thursday");
			this.classInfo.days.friday = clss.getAttribute("friday");
			this.classInfo.days.saturday = clss.getAttribute("saturday");
			this.classInfo.days.sunday = clss.getAttribute("sunday");
			this.classKey = clss.firstChild.id;
			
			let rgb = clss.style.background.substring(4, clss.style.background.length - 1);
			rgb = rgb.split(",");
			
			let r = parseInt(rgb[0]).toString(16);
			if(r.length < 2) r = "0" + r;
			let g = parseInt(rgb[1]).toString(16);
			if(g.length < 2) g = "0" + g;
			let b = parseInt(rgb[2]).toString(16);
			if(b.length < 2) b = "0" + b;
			
			this.classInfo.color = "#"+r+g+b;
			this.startAddClass();
		},
		updateClass(){
			database.editClass(this.classInfo, this.classKey);
		},
		deleteClass() {
			database.deleteClass(this.classKey);
		},
		resetClassForm() {
			this.classInfo.name = "";
			this.classInfo.color = "#000000";
			this.classInfo.building = "";
			this.classInfo.room = "";
			this.classInfo.time = "";
			this.classInfo.days.monday = false;
			this.classInfo.days.tuesday = false;
			this.classInfo.days.wednesday = false;
			this.classInfo.days.thursday = false;
			this.classInfo.days.friday = false;
			this.classInfo.days.saturday = false;
			this.classInfo.days.sunday = false;
			
			document.querySelector("#deleteClass").style.display = "none";
			this.classFormInvalid = true;
		},
		
		showMainForm() {
			document.querySelector("#deleteHW").style.display="none";
			document.querySelector("#deleteClass").style.display="none";
			this.classFormInvalid = true;
			this.hwFormInvalid = true;
			document.querySelector("#updateHW").style.display="none";
			document.querySelector("#addNewHW").style.display="block";
			document.querySelector("#updateClass").style.display="none";
			document.querySelector("#addNewClass").style.display="block";
			ui.switchToPanel("main");
		},
		
		sort(e) {
			let button = e.target;
			let sortItem = button.id;
			let direction = parseInt(button.innerHTML + "1") * -1;
			let sortIndex = this.sortOrder.indexOf(sortItem);
			
			if((direction < 0 && sortIndex > 0) || (direction > 0 && sortIndex < 3)) {
				let nextIndex = sortIndex + direction;
				this.sortOrder.splice(sortIndex, 1, this.sortOrder[nextIndex]);
				this.sortOrder.splice(nextIndex, 1, sortItem);
			}
			localStorage.setItem(sortOrderStorageID, this.sortOrder);
			this.sortHW();
			
		},
		sortHW() {
			let sortDictionary = {
				"Class": (a, b) => app.classes[a.classKey].name.localeCompare(app.classes[b.classKey].name),
				"Priority": (a, b) => b.priority - a.priority,
				"Due Date": (a, b) => Date.parse(a.date +" " + a.time) - Date.parse(b.date + " " + b.time),//ui.orderByDate(a, b),
				"Name": (a, b) => a.name.localeCompare(b.name),
				/*"Completion":(a,b) => {if(a.getAttribute("complete") == "true") return -1; 
									   else if(b.getAttribute("complete") == "true") return 1;})*/
			}
			let sorting = this.sortOrder;
			let hwList = this.hws;
			this.hwKeys.sort(function(a,b) {
				if(hwList[a].completed == true)
				if(hwList[a].completed == true)
					return 1;
				else if(hwList[b].completed == true)
					return -1;
				//completed tasks go at the bottom
				//sorts things in the order given by the html order of sort options
				for(let i = 0; i < sorting.length; i++) {
					if(sortDictionary[sorting[i]](hwList[a], hwList[b]) != 0) {
						return sortDictionary[sorting[i]](hwList[a], hwList[b]);
					}
				}
				return 0;
			});
		},
		
		filterByClassElement(e) {
			this.filterByClass(e.target.id, e.target.checked);
		},
		filterByClass(classID, checked) {
			let relevantHWs = document.querySelectorAll("#todolist #" + classID);
			for(let hw of relevantHWs) {
					hw.style.display = checked && (this.showCompletedHWs || !(hw.getAttribute("data-completed")=="true")) ? "grid" : "none";
			}
			//localStorage.setItem("lep2738-"+classID, checked);
			this.classes[classID].selected = checked;
		},
		/*
		showHideCompleted(e) {
			let completedHWs = document.querySelectorAll("[data-completed='true']");
			//localStorage.setItem(completedStorageID, e.target.checked);
			for(let hw of completedHWs) {
				hw.style.display= e.target.checked ? "grid" : "none";
			}
		},
		*/
		selectAllFilters(){
			let filters = document.querySelectorAll("#classFilters input[type='checkbox']");
			for(let filter of filters) {
				filter.checked = true;
				filter.dispatchEvent(new Event("click"));
			}
		},
		
		googleLogin() {
			database.googleLogin();
		},
		
		getPriorityColor(p) {
			return colors.interpolateColors(this.priorityColors[0], this.priorityColors[1], p/this.maxPriority);
		},
		
		formattedDate(date) {
			
			localStorage.setItem(dateFormatStorageID, app.dateFormat);

			let dateObj = new Date(date);
			let dayOfMonth = dateObj.getDate();
			
			
			let month = dateObj.getMonth();
			let year = dateObj.getFullYear();
			
			if(dayOfMonth < 10)
				dayOfMonth = "0" + dayOfMonth;
			
			let newDate = app.dateFormat;
			console.log(newDate);
			
			newDate = newDate.replace("m", month + 1 < 10 ? "0" + (month + 1) : month + 1);
			newDate = newDate.replace("d", dayOfMonth);
			newDate = newDate.replace("Y", year);
			newDate = newDate.replace("F", monthKey[month]);
			
			return newDate;
		},
		formattedTime(datetime) {
			localStorage.setItem(timeFormatStorageID, app.timeFormat);
			
			let dateObj = new Date(datetime);
			let newTime = app.timeFormat;
			
			let hour = dateObj.getHours();
			let ampm = hour >= 12 ? 'pm' : 'am';
			let minute = dateObj.getMinutes();
			
			if(hour < 10)
				hour = "0" + hour;
			
			newTime = newTime.replace("H", hour);
			if(hour >= 12 && !isNaN(hour))
				hour -= 12;
			
			newTime = newTime.replace("g", hour);
			newTime = newTime.replace("i", minute < 10 ? "0" + minute : minute);
			newTime = newTime.replace("a", ampm);
			return newTime;
		},
		
		canShowHW(hwCompleted) {
			if(!this.showCompletedHWs && hwCompleted)
				return "none";
			else 
				return "grid";
		}
	}
});

let localStorageSortOrder = localStorage.getItem(sortOrderStorageID);
if(localStorageSortOrder != null && localStorageSortOrder != "") {
	app.sortOrder = localStorageSortOrder.split(",");
}
else {
	localStorage.setItem(sortOrderStorageID, app.sortOrder);
}

let localStorageDateFormat = localStorage.getItem(dateFormatStorageID);
if(localStorageDateFormat != null && localStorageDateFormat != "") {
	app.dateFormat = localStorageDateFormat;
}
else {
	localStorage.setItem(dateFormatStorageID, app.dateFormat);
}

let localStorageTimeFormat = localStorage.getItem(timeFormatStorageID);
if(localStorageTimeFormat != null && localStorageTimeFormat != "") {
	app.timeFormat = localStorageTimeFormat;
}
else {
	localStorage.setItem(timeFormatStorageID, app.timeFormat);
}

export {init, app};