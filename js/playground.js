var gblock = 0;
var vol = new Tone.Volume();
var eq3 = new Tone.EQ3({
	"low": 0,
	"mid": 0,
	"high": 0,
	"lowFrequency": 200,
	"highFrequency": 4500
});
var searchstr = document.getElementById("searchTB").value;

var currentstring = document.getElementById('blockTB');
var currentstringlength = currentstring.length;
var start = currentstringlength - currentstringlength;
var end = start + 2;
var blockstream = "https://blockstream.info/api/";

var reverb = new Tone.Reverb({
	"decay": 5,
	"preDelay": 0.01
}).toMaster();
var chorus = new Tone.Chorus(8, 5, 1).toMaster();
var pingpongdelay = new Tone.PingPongDelay({
	"delayTime": "16n",
	"feedback": 0.8,
	"wet": 0.25
}).toMaster();
var tremolo = new Tone.Tremolo();
var vibrato = new Tone.Vibrato({
	"maxDelay": 0.005,
	"frequency": 15,
	"depth": 0.1

}).toMaster();
var phaser = new Tone.Phaser({
	"frequency": 8,
	"octaves": 4,
	"baseFrequency": 1000
}).toMaster();

function selecteffect(effect) {

	var effecttype = document.getElementById("effect").value;


	switch (effecttype) {

		case "reverb":

			effect = reverb;
			break;

		case "chorus":
			effect = chorus;
			break;

		case "pingpongdelay":
			effect = pingpongdelay;
			break;

		case "tremolo":
			effect = tremolo;
			break;

		case "vibrato":
			effect = vibrato;
			break;

		case "phaser":
			effect = phaser;
			break;

	}

	return effect;

}
function selectslice(slice) {

	var slicetype = document.getElementById("slice").value;

	switch (slicetype) {
		//case "raw":

		//	slice = slicestrg();			
		//	instrument.triggerAttackRelease(slice, '4n');
		//	$("#slicestrg").css('color', 'red', function (i) { return i + 25; });

		//	break;
		case "slice":

			slice = slicestrg();
			instrument.triggerAttackRelease(slice, '4n');

			break;

		case "next":
			slice = nextslice();
			instrument.triggerAttackRelease(slice, '4n');
			break;

		case "whole":
			slice = wholeslice();
			instrument.triggerAttackRelease(slice, '4n');
			break;

		case "half":
			slice = halfslice();
			instrument.triggerAttackRelease(slice, '4n');

			break;
	}
	return slice;

}

function changeeffect() {
	var s = instrument;
	var e = selecteffect();
	s.connect(e);
}


function getstring(stringtype, merkleroot, hash, getblocktip) {
	searchstr = document.getElementById("searchTB").value;
	stringtype = document.getElementById("stringtype").value;
	//GET block tip
	$.get(blockstream + "blocks/tip/height", function (data) {
		getblocktip = `${data}`;
		document.getElementById('blocksTB').value = "Highest Block: " + getblocktip;
		if (searchstr < 0) {

			alert("TOO LOW! Please select Height 0 to " + getblocktip);
			document.getElementById("searchTB").value = 0;
		}
		if (searchstr > parseInt(getblocktip)) {
			alert("TOO HIGH! Please select Height 0 to " + getblocktip);
			document.getElementById("searchTB").value = 0;
		}
	});


	//GET Root and Hash of Height
	$.get(blockstream + "block-height/" + searchstr, function (data) {
		hash = `${data}`;
		$.get(blockstream + "block/" + hash, function (block) {
			merkleroot = `${block.merkle_root}`;
			var timestamp = `${block.timestamp}`;
			var ts = timestamp.toString();
			var info = `Now Playing: Height ${block.height}	Timestamp: ${ts}<br>				
				Merkle Root: ${block.merkle_root}<br>
						Hash: ${hash}<br>
							Calling on Blockstream for blockchain info`;
			$(".blockinfo").html(info);

			

			switch (stringtype) {


				case "root":

					document.getElementById('blockTB').value = merkleroot;
					document.getElementById('clipTB').value = merkleroot;

					break;

				case "hash":
					document.getElementById('blockTB').value = hash;
					document.getElementById('clipTB').value = hash;
					break;

			}


		});
	});


}

function slicestrg() {
	//var m = currentstring.value;
	var m = document.getElementById('clipTB').value;
	var strgslice = m.slice(start, end);
	//document.getElementById("slicestrg").value = strgslice;
	document.getElementById("stringindex").value = start + "," + end;
	return strgslice;

}
function nextslice() {
	var nextstart = start++;
	var nextend = end++;
	var nextindex = slicestrg(nextstart, nextend);
	//document.getElementById("nextslice").value = nextindex;

	return nextindex;
}
function prevslice() {
	var prevstart = start--;
	var prevend = end--;
	var previndex = slicestrg(prevstart, prevend);
	//document.getElementById("testTB").value = previndex;

	return previndex;
}
function wholeslice() {

	var wslice = nextslice();
	start++;
	end++;
	//document.getElementById("whole").value = "whole = " + wslice;	
	return wslice;

}
function halfslice() {
	var nexthalf = wholeslice();
	//document.getElementById("half").value = "half = " + nexthalf;
}
function resetslice() {
	start = 0;
	end = start + 2;

	playstr();
}

function loopseq() {
	start = 0;
	end = start + 2;
	playseq();
}
function noloopseq() {
	start = 0;
	end = start + 2;
	playallheights();
}


function heightplus100k() {
	var h = document.getElementById("searchTB").value;
	document.getElementById("searchTB").value = 100000 + parseInt(h, 10);
	getstring(h);
}
function heightplus10k() {
	var h = document.getElementById("searchTB").value;
	document.getElementById("searchTB").value = 10000 + parseInt(h, 10);
	getstring(h);
}
function heightplus1k() {
	var h = document.getElementById("searchTB").value;
	document.getElementById("searchTB").value = 1000 + parseInt(h, 10);
	getstring(h);
}
function heightplus100() {
	var h = document.getElementById("searchTB").value;
	document.getElementById("searchTB").value = 100 + parseInt(h, 10);
	getstring(h);

}
function heightplus10() {
	var h = document.getElementById("searchTB").value;
	document.getElementById("searchTB").value = 10 + parseInt(h, 10);
	getstring(h);
}
//next height
function nextheight() {
	var h = document.getElementById("searchTB").value;
	h++;
	document.getElementById("searchTB").value = h;
	getstring(h);

}
//previous height
function prevheight() {
	var h = document.getElementById("searchTB").value;
	h--;
	document.getElementById("searchTB").value = h;
	getstring(h);


}
function heightminus100k() {
	var h = document.getElementById("searchTB").value;
	document.getElementById("searchTB").value = parseInt(h, 10) - 100000;
	getstring(h);
}
function heightminus10k() {
	var h = document.getElementById("searchTB").value;
	document.getElementById("searchTB").value = parseInt(h, 10) - 10000;
	getstring(h);
}
function heightminus1k() {
	var h = document.getElementById("searchTB").value;
	document.getElementById("searchTB").value = parseInt(h, 10) - 1000;
	getstring(h);
}
function heightminus100() {
	var h = document.getElementById("searchTB").value;
	document.getElementById("searchTB").value = parseInt(h, 10) - 100;
	getstring(h);
}
function heightminus10() {
	var h = document.getElementById("searchTB").value;
	document.getElementById("searchTB").value = parseInt(h, 10) - 10;
	getstring(h);
}

function wholeString() {
	var m = currentstring.value;
	var start = 0;
	var end = 64;
	var strgslice = m.slice(start, end);
	cliptb.value = strgslice;
	cliptb.select();
	cliptb.focus(); 

}
function halfString() {
	var m = currentstring.value;
	var start = 0;
	var end = 32;
	var strgslice = m.slice(start, end);
	cliptb.value = strgslice;
	cliptb.select();
	cliptb.focus();
}
function quarterString() {
	var m = currentstring.value;
	var start = 0;
	var end = 16;
	var strgslice = m.slice(start, end);
	cliptb.value = strgslice;
	cliptb.select();
	cliptb.focus();

}
function eighthString() {
	var m = currentstring.value;
	var start = 0;
	var end = 8;
	var strgslice = m.slice(start, end);
	cliptb.value = strgslice;
	cliptb.select();
	cliptb.focus();

}

var timeout;

function stoptimeout() {
	clearTimeout(timeout);
}


function playselected() {
	stoptimeout();

	var txt = "";
	if (document.getSelection) {
		txt = document.getSelection();
		document.getElementById("clipTB").value = txt;

	}
	cliptb.blur();
	playseq();

}

function playseq() {
	stoptimeout();
	var n = nextslice();
	//var n = slicestrg();	
	var timeMenu = document.getElementById("time");
	timeTime = Number(timeMenu.options[timeMenu.selectedIndex].value);
	timeout = setTimeout(playseq, timeTime);
	playstr();
	

	if (n === "") {
		loopseq();
	}
}
function playstr() {
	selectslice();
	var s = slicestrg();
	var n = nextslice();

	instrument.triggerAttackRelease(s, 0.5);
	
	//instrument.frequency.setValueAtTime(s);
}
var cliptb = document.getElementById('clipTB');



function changevolume() {
	// Volume Slider[0]
	var audiosliders = document.getElementById("vol-panel");
	var sliders = audiosliders.getElementsByTagName('webaudio-slider');

	for (var i = 0; i < sliders.length; i++) {
		var slider = sliders[0];
		slider.addEventListener("change", function (e) {

			document.getElementById("testTB").value = this.value;
			vol.volume.value = this.value;
			instrument.chain(vol, Tone.Master);

			vol.volume.rampTo(5, 1);
		});
	}
}
function changeEQ() {
	var eqbase = document.getElementById("right-panel");
	var eq = eqbase.getElementsByTagName('webaudio-slider');
	//document.getElementById("testTB").value = eq.length;
	for (var i = 0; i < eq.length; i++) {

		var eqlow = eq[0];
		var eqmid = eq[1];
		var eqhigh = eq[2];
		eqlow.addEventListener("change", function (e) {
			document.getElementById("testTB").value = this.value;
			eqlow = this.value;

		});
		eqmid.addEventListener("change", function (e) {
			document.getElementById("testTB").value = this.value;
			eqmid = this.value;

		});
		eqhigh.addEventListener("change", function (e) {
			document.getElementById("testTB").value = this.value;
			eqhigh = this.value;

		});


	}

	instrument.chain(eq3, vol, Tone.Master);

}
function changePan() {
	// Pan Slider[1]
	var audiosliders = document.getElementById("vol-panel");
	var sliders = audiosliders.getElementsByTagName('webaudio-slider');
	var panVol = new Tone.Panner();
	for (var i = 0; i < sliders.length; i++) {
		var slider = sliders[1];
		slider.addEventListener("change", function (e) {

			document.getElementById("testTB").value = this.value;
			panVol.pan.value = this.value;
			instrument.chain(panVol, vol, Tone.Master);
		});
	}

}

function muteaudio() {

	stoptimeout();
	//if (Tone.Master.mute === false) {
	//	Tone.Master.mute === true;
	//	stoptimeout();
	//} else {
	//	Tone.Master.mute === false;
	//	playseq();
	//}


}


function killswitch() {
	// Kill Restart[0]
	var toggleswitch = document.getElementById("powerswitch");
	var toggles = toggleswitch.getElementsByTagName('webaudio-switch');

	for (var i = 0; i < toggles.length; i++) {
		var killswitch = toggles[0];
		killswitch.addEventListener("change", function (e) {

			document.getElementById("testTB").value = "switched";
			resetaudio();
			loadplayground();
		});
	}

}

function playallheights() {
	var n = nextslice();
	//var n = slicestrg();	
	var timeMenu = document.getElementById("time");
	timeTime = Number(timeMenu.options[timeMenu.selectedIndex].value);
	timeout = setTimeout(playallheights, timeTime);
	playstr();

	if (n === "") {
		stoptimeout();
		nextheight();
		noloopseq();
	}
}

function clickthruseq() {
	var n = nextslice();
	playstr(n);

	if (n === "") {
		resetslice();
		//nextheight();
	}
}
function clickbackseq() {
	var p = prevslice();
	playstr(p);

	//if (p === "") {
	//	resetslice();
	//	prevheight();
	//}
}

function metrostart() {

	var metro = new Tone.Player("/Metronome/Box_5_BD.mp3").toMaster();
	metro.autostart = true;
	Tone.Transport.bpm.value = 30;

	Tone.Buffer.onload = function () {
		Tone.Transport.setInterval(function (time) {
			metro.start(time);
		}, "4n");
		Tone.Transport.start();
	};
	Tone.Transport.start();
}


function resetaudio() {
	//Tone.context.close();
	Tone.context = new AudioContext();
	stoptimeout();
}

function submitbpm() {
	var bpm = 100;
	Tone.Transport.bpm.value = bpm;
}
function loadplayground() {
	document.getElementById("searchTB").value = gblock;
	getstring(gblock);
	changevolume();
	changePan();
	changeEQ();
	killswitch();
}


