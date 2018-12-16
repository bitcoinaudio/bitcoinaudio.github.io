var gblock = 0;
var vol = new Tone.Volume();
var eq3 = new Tone.EQ3({
	"low": 0,
	"mid": 0,
	"high": 0,
	"lowFrequency": 200,
	"highFrequency": 4500
});

var currentstring = document.getElementById('blockTB');
var currentstringlength = currentstring.length;
var start = -1;
var end = 1;
var reverb = new Tone.Reverb({
	"decay": 10,
	"preDelay": 0.01
}).toMaster();
var chorus = new Tone.Chorus(8, 5, 1).toMaster();
var pingpongdelay = new Tone.PingPongDelay({
	"delayTime": "16n",
	"feedback": 0.8,
	"wet": 0.5
}).toMaster();
var tremolo = new Tone.Tremolo();
var vibrato = new Tone.Vibrato({
	"maxDelay": 0.005,
	"frequency": 15,
	"depth": 0.1

}).toMaster();
var phaser = new Tone.Phaser({
	"frequency":8,
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
		case "raw":
			
			slice = slicestrg();			
			instrument.triggerAttackRelease(slice, '4n');
			$("#slicestrg").css('color', 'red', function (i) { return i + 25; });
			
			break;
		case "slice":
			
			slice = slicestrg();			
			instrument.triggerAttackRelease(slice, '8n');
			$("#slicestrg").css('color', 'red', function (i) { return i + 25; });
			
			break;

		case "next":
			slice = nextslice();			
			instrument.triggerAttackRelease(slice, '16n');
			$("#nextslice").css('color', 'green' , function (i) { return i + 25; });
			break;

		case "whole":
			slice = wholeslice();
			instrument.triggerAttackRelease(slice, '16n');
			$("#whole").css('color', 'blue' , function (i) { return i + 25; });
			break;

		case "half":
			slice = halfslice();
			instrument.triggerAttackRelease(slice, '32n');
			$("#half").css('color', 'purple' , function (i) { return i + 25; });

			break;		
	}
	return slice;

}
function changeeffect() {
	var s = instrument;
	var e = selecteffect();
	s.connect(e);
}
var blockstream = "https://blockstream.info/api/";
var countGetstringcalls = 0;
function getstring(searchstr, stringtype) {
	searchstr = document.getElementById("searchTB").value;
	stringtype = document.getElementById("stringtype").value;
	var stringtypetoggle = document.getElementById("stringtype").value;
	if (searchstr < 0) {

		alert("Please select a Height greater than 0");
		document.getElementById("searchTB").value = 0;
	}

	//GET block tip
	$.get(blockstream + "blocks/tip/height", function (data) {
		var getblocks =  `${data}`;
		document.getElementById('blocksTB').value =  getblocks.toString();	
	});


	$.get(blockstream + "block-height/" + searchstr, function (data) {
		var hash = `${data}`;

		$.get(blockstream + "block/" + hash, function (block) {
			var info = `Now Playing: Height ${block.height}	Timestamp: ${block.timestamp}<br>				
				Merkle Root: ${block.merkle_root}<br>
						Hash: ${hash}<br>
							Calling on Blockstream`;
			$(".blockinfo").html(info);

			switch (stringtype) {


				case "root":

					document.getElementById('blockTB').value = block.merkle_root;

					break;

				case "hash":
					document.getElementById('blockTB').value = hash;
					break;

			}

			
		});
	});

}

function slicestrg() {	
	var m = currentstring.value;
	var strgslice = m.slice(start, end);
	document.getElementById("slicestrg").value = strgslice;
	document.getElementById("stringindex").value = start + "," + end;
	return strgslice;

}
function nextslice() {
	var nextstart = start++;
	var nextend = end++;	
	var nextindex = slicestrg(nextstart, nextend);
	document.getElementById("nextslice").value = nextindex;

	return nextindex;
}
function prevslice() {
	var prevstart = start--;
	var prevend = end--;
	var previndex = slicestrg(prevstart, prevend);
	document.getElementById("testTB").value = previndex;

	return previndex;
}
function wholeslice() {	
	
	var wslice = nextslice();
	start++;
	end++;
	document.getElementById("whole").value = "whole = " + wslice;	
	return wslice;
	
}
function halfslice() {	
	var nexthalf = wholeslice();
	document.getElementById("half").value = "half = " + nexthalf;
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
	document.getElementById("searchTB").value = parseInt(h, 10) -100000;
	getstring(h);
}
function heightminus10k() {
	var h = document.getElementById("searchTB").value;
	document.getElementById("searchTB").value = parseInt(h, 10) -10000;
	getstring(h);
}
function heightminus1k() {
	var h = document.getElementById("searchTB").value;
	document.getElementById("searchTB").value = parseInt(h, 10) -1000;
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
function playselected() {
	var txt = "";
	if (window.getSelection) {
		txt = window.getSelection();
	}
	else if (document.getSelection) {
		txt = document.getSelection();
	}
	else if (document.getSelection) {
		txt = document.getSelection.createrange().text;
	}
	else return;
	
	document.getElementById("blockTB").value = txt;
	playseq();
	
}
function changevolume() {
	// Volume Slider[0]
	var audiosliders = document.getElementById("vol-panel");
	var sliders = audiosliders.getElementsByTagName('webaudio-slider');

	for (var i = 0; i < sliders.length; i++) {
		var slider = sliders[0];
		slider.addEventListener("change", function (e) {

			document.getElementById("testTB").value = this.value;
			vol.volume.value = this.value;
			instrument.chain(vol,  Tone.Master);

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
	
	if (Tone.Master.mute === false) {
		Tone.Master.mute === true;
	} else {
		Tone.Master.mute === false;
	}

}
var timeout;
function timer() {

	var timeMenu = document.getElementById("delay");
	delayTime = Number(timeMenu.options[timeMenu.selectedIndex].value);
	timeout = setTimeout(highlightslice, delayTime);
}
//PLAY*//
function playstr() {
	selectslice();
	var s = slicestrg();
	var n = nextslice();
	document.getElementById("slicedstrg").value = s;
	document.getElementById("indexvalue").value = n;
	instrument.triggerAttackRelease(s, '4n');
}
function playseq() {
		var n = nextslice();
	//var n = slicestrg();	
	var timeMenu = document.getElementById("delay");
	delayTime = Number(timeMenu.options[timeMenu.selectedIndex].value);
	timeout = setTimeout(playseq, delayTime);
	
	playstr();
	
	if (n === "") {		
		stoptimeout();
		loopseq();
	}
}
function playallheights() {
	var n = nextslice();
	//var n = slicestrg();	
	var timeMenu = document.getElementById("delay");
	delayTime = Number(timeMenu.options[timeMenu.selectedIndex].value);
	timeout = setTimeout(playallheights, delayTime);	
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
		nextheight();
	}
}
function clickbackseq() {
	var p = prevslice();	
	playstr(p);

	
}
function stoptimeout() {
	clearTimeout(timeout);
}
function metrostart() {
	var metro = new Tone.Player("http://localhost:8017/Metronome/Box_5_BD.mp3").toMaster();
	metro.autostart = true;
	Tone.Transport.bpm.value = 60;

	Tone.Buffer.onload = function () {
		Tone.Transport.setInterval(function (time) {
			metro.start(time);
		}, "4n");
		Tone.Transport.start();
	};
	Tone.Transport.start();
}
function metrostop() {
	Tone.Transport.stop();
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
	pRecorder();
	

}


