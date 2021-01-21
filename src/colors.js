
function interpolateColors(colorA, colorB, percentDecimal) {
	colorA = colorA.substring(1);
	let ra = parseInt(colorA.substring(0, 2), 16);
	let ga = parseInt(colorA.substring(2, 4), 16);
	let ba = parseInt(colorA.substring(4, 6), 16);
	let hsla = convertRGBToHSL(ra, ga, ba);
	
	colorB = colorB.substring(1);
	let rb = parseInt(colorB.substring(0, 2), 16);
	let gb = parseInt(colorB.substring(2, 4), 16);
	let bb = parseInt(colorB.substring(4, 6), 16);
	let hslb = convertRGBToHSL(rb, gb, bb);

	let difference = [
		hsla[0] - hslb[0],
		hsla[1] - hslb[1],
		hsla[2] - hslb[2]
	];
	let change = [
		difference[0] * percentDecimal,
		difference[1] * percentDecimal,
		difference[2] * percentDecimal
	];
	let interpolation = [
		(hsla[0] - change[0]),	
		(hsla[1] - change[1]),	
		(hsla[2] - change[2])	
	];
	return `hsl(${interpolation[0]}, ${interpolation[1]}%, ${interpolation[2]}%)`;
}

//https://stackoverflow.com/questions/39118528/rgb-to-hsl-conversion
//https://en.wikipedia.org/wiki/HSL_and_HSV
function convertRGBToHSL(r, g, b) {
	let h, s, l;

	let max = Math.max(Math.max(r, g), b);
	let min = Math.min(Math.min(r, g), b);
	let c = max - min;
	if(c == 0)
		h = 0;
	else if(max == r)
		h = (g-b)/c % 6 * 60;
	else if(max == g)
		h = ((b-r)/c + 2) * 60;
	else if(max == b)
		h = ((r-g)/c + 4) * 60;
	else
		h = 0;

	l = ((max-min)/2)/255;
	if(l == 0 || l == 1) 
		s = l;
	else 
		s = c/(1- Math.abs(2 * l - 1))/255;
	//console.log(`${h}, ${s}, ${l}`);
	return [h, s * 100, l * 100];
}
//not sure about this one
function convertHSLToRGB(h, s, l){
	let r,g,b;

	let c = (1 - Math.abs(2*l - 1)) * s;

	let hprime = h/60;
	let x = c *(1 - Math.abs(hprime % 2 - 1));

	if(0<=h<=1){
		r = c;
		g = x;
		b = 0;
	}
	else if(1<=h<=2){
		r = x;
		g = c;
		b = 0;
	}
	else if(2<=h<=3){
		r = 0;
		g = c;
		b = x;
	}
	else if(3<=h<=4){
		r = 0;
		g = x;
		b = c;
	}
	else if(4<=h<=5){
		r = x;
		g = 0;
		b = c;
	}
	else if(5<=h<=6){
		r = c;
		g = 0;
		b = x;
	}
	else {
		r = g = b = 0;
	}
	let m = l - c/2;
	r += m;
	g += m;
	b += m;
	return[r, g, b];
}

export{convertHSLToRGB, convertRGBToHSL, interpolateColors}