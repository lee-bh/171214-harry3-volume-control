//simple Web audio library v1.0 by Lee Byoung Hak
//2017.12.14

function SoundBH(songTitle,channel){

    var theBuffer = null;
    var audioContext = null;
    var sourceNode = null;
    var gainNode = null;
    var analyser = null;
    var analyser2 = null;
    var javascriptNode;
    var splitter = null;
    var startStamp = 0;
    var stopStamp = 0;
    var paused = false;
    var lch = [];
    var rch = [];

    this.getLeft = function(){ return lch; }
    this.getRight = function(){ return rch; }
    this.getGain = function(){
        var l = lch.length;
        var gainT = 0;
        for(var i=0;i<l;i++){
            gainT += (lch[i] + rch[i]);
        }
        return gainT;
    }

    this.stop = function(){ stopSound(); };
    this.pause = function(){ pauseSound(); };
    this.play = function(){ playSound(theBuffer); };
    this.change = function(t){ stopSound();start(t);};
    this.vol = function(t){ chVol(t);  };

    start(songTitle);

    function start(sTitle) {
        if(audioContext != null){audioContext.close();}
        audioContext = new AudioContext();
        
        javascriptNode = audioContext.createScriptProcessor(0);
        javascriptNode.connect(audioContext.destination);
        
        analyser = audioContext.createAnalyser();
        analyser.smoothingTimeConstant = 0.3;
        analyser.fftSize = channel*2;

        analyser2 = audioContext.createAnalyser();
        analyser2.smoothingTimeConstant = 0.3;
        analyser2.fftSize = channel*2;  

        if(window.location.href.substr(0,4) == "file"){ 
            console.log( "local files can't be played cause of security issues, please use file input button."); 
        };
        var request = new XMLHttpRequest();
        request.open("GET", sTitle, true);
        request.responseType = "arraybuffer";
        request.onload = function() {
            audioContext.decodeAudioData(request.response, function(buffer) {
                theBuffer =  buffer;
                playSound();
            }, onError);
        }
        request.send();
    }

    function playSound() {
        sourceNode = audioContext.createBufferSource();
        gainNode = audioContext.createGain();
        splitter = audioContext.createChannelSplitter();
        
        sourceNode.connect(splitter);
        sourceNode.connect(gainNode);
        gainNode.connect(audioContext.destination);

        splitter.connect(analyser,0,0);
        splitter.connect(analyser2,1,0);

        analyser.connect(javascriptNode);

        sourceNode.buffer = theBuffer;
        if(paused == true){
            sourceNode.start(0, stopStamp - startStamp);
            console.log("resume");
            paused =  false;
        }else{ sourceNode.start(0); 
            console.log("start at:" + audioContext.currentTime);
            startStamp = audioContext.currentTime;
        }
        javascriptNode.addEventListener("audioprocess", startDraw, false);
    }

    function chVol(vol){
        if(gainNode != null){
            gainNode.gain.value = vol;
            console.log("volume has changed to " + vol);
        }else{
            console.log("sound has not been loaded yet");
        }
        
    }

    function startDraw(){
        lch =  new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(lch);
                
        rch =  new Uint8Array(analyser2.frequencyBinCount);
        analyser2.getByteFrequencyData(rch);
    }

    function stopSound(){
        if(sourceNode){
            sourceNode.stop(0);
            console.log("stopped at:" + audioContext.currentTime);
            stopStamp = audioContext.currentTime;
            javascriptNode.removeEventListener('audioprocess', startDraw);
        }
    }

    function pauseSound(){
        sourceNode.stop(0);
        console.log("paused at:" + audioContext.currentTime);
        stopStamp = audioContext.currentTime;
        javascriptNode.removeEventListener('audioprocess', startDraw);
        paused = true;
    }

    function sDraw(){
        lch = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(array);

        rch = new Uint8Array(analyser2.fftSize);
        analyser2.getByteTimeDomainData(array2);  
    }

    var onError = function(e){
        console.log(e);
    }
}