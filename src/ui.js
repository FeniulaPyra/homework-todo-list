import * as dateFormats from "./date-time-format.js";
import * as colors from "./colors.js";

function switchToPanel(panelID) {
	let panels = document.querySelectorAll("aside");
	for(let panel of panels) {
		panel.style.display = "none";
	}
	let openPanel = document.querySelector("aside#" + panelID);
	openPanel.style.display = panelID=="main"? "grid" : "flex";
}

export {switchToPanel}