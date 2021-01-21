let url = "https://people.rit.edu/lep2738/330/projects/project-3/php/date-time-format.php?datetime=";

//returns a promise with the formatted date!
async function formatDate(date, format) {
//	let newDate = 
	return await fetch(url + date + "&format=" + format)
	.then(response => {
		return response.json();
	}).then(txt => {
		return txt;
	});

	//return newDate;
}
export {formatDate};