var gblock = 1;
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

var btcmain = "https://api.blockcypher.com/v1/btc/main/blocks/";
var btctest = "https://api.blockcypher.com/v1/bcy/test/blocks/";

var reverb = new Tone.Reverb({
	"decay": 5,
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

var countGetstringcalls = 0;
function getstring(searchstr, stringtype) {
	searchstr = document.getElementById("searchTB").value;
	stringtype = document.getElementById("stringtype").value;
	countGetstringcalls++;
	
	$.getJSON(btcmain + searchstr, function (data) {		
		var hash = `${data.hash}`;
		var root = `${data.mrkl_root}`;
		var info = `Now Playing: Height ${data.height}	Time: ${data.time}<br>				
				Merkle Root: ${data.mrkl_root}<br>
						Hash: ${data.hash}<br>
			Calls to Blockcypher (200 calls per hour): ${countGetstringcalls}`;

		
		$(".blockinfo").html(info);

		
		switch (stringtype) {

			case "root":

				document.getElementById('blockTB').value = root;
				document.getElementById('blockTB').readOnly = true;
				
				break;

			case "hash":
				document.getElementById('blockTB').value = hash;
				document.getElementById('blockTB').readOnly = true;
				break;
				
		}
		

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

//next height
function nextheight() {
	var h = document.getElementById("searchTB").value;
	h++;
	document.getElementById("searchTB").value = h;
	getstring(h);


	return h;

}
//previous height
function prevheight() {
	var h = document.getElementById("searchTB").value;
	h--;
	document.getElementById("searchTB").value = h;
	getstring(h);
	
}

function playstr() {
	selectslice();
	var s = slicestrg();
	var n = nextslice();	
	document.getElementById("slicedstrg").value = s;
	document.getElementById("indexvalue").value = n;
	
	instrument.triggerAttackRelease(s, '4n');
	//$(".blockinfo").css("color", "#" + s + n );
	
	
}
var f = false;
var t = true;


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

	if (p === "") {
		resetslice();
	}
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
	document.getElementById("testTB").value = "metrostart";
}
function metrostop() {
	Tone.Transport.stop();
}
function submitbpm() {
	var bpm = 100;
	Tone.Transport.bpm.value = bpm;
}
function loadplayground() {
	document.getElementById("stringindex").value = start + "," + end;
	document.getElementById("searchTB").value = gblock;	
	getstring(gblock);
	changevolume();
	changePan();
	changeEQ();
	pRecorder();

}
function armrecording() {
	
}


