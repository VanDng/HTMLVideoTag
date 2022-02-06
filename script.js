window.onload = function() {

	VVideoInitialization();

	let ignoredVideo = document.getElementById('ignored-video')
	VVideoInitialization(ignoredVideo);
	
	async function VVideoInitialization(videoElement)
	{
		var vVideos = [];
		
		let ignoranceCheck = true;

		if (videoElement != null && videoElement != 'undefined' && videoElement instanceof Element)
		{
		    vVideos = [ videoElement ];
			ignoranceCheck = false;
		}
		else
		{
		    vVideos = Array.from(document.querySelectorAll('div.v-video-container:not([v-ignore])'));
		}

		console.log('v-video-count ' + vVideos.length);

		await Promise.all(vVideos.map(async (videoContainer) => {
			if (videoContainer.hasAttribute('v-ignore') && ignoranceCheck == true)
			{
				return;
			}
			else
			{
				videoContainer.setAttribute('v-ignore', '');
			}

			//
			// Insert custom video element
			//

			var elementContent = `
			<video id="v-video">
				<p>
					Your browser doesn't support HTML5 video.
				</p>
			</video>

			<div id="v-rotation" class="v-decoration">
				<button id="v-rotator" type="button">&#8635;</button>
			</div>

			<div id="v-video-controls" class="v-decoration">
				<div id="v-play-container">
					<button type="button" id="v-play-pause" class="v-play">&#9658;</button>
					<input type="range" id="v-seek-bar" value="0">
					<div style=" clear: both;"></div>
				</div>
				<button type="button" id="v-mute">&#128266;</button>
				<input type="range" id="v-volume-bar" min="0" max="1" step="0.1" value="1">
				<button type="button" id="v-full-screen">&#9974;</button>
				<button type="button" id="v-loop">&#8904;</button>
				<!-- <button type="button" id="v-autoplay">&#9673;</button> -->
			</div>
			`;

			videoContainer.innerHTML = elementContent;

			//
			// Inject CSS
			//

			let fullCss = `
			.v-video-container {
				position: relative;
				background: #c2c2c2;
				width: fit-content;
			}
			
			.v-decoration {
				-webkit-transition: opacity .3s;
				-moz-transition: opacity .3s;
				-o-transition: opacity .3s;
				-ms-transition: opacity .3s;
				transition: opacity .3s;
				background-image: linear-gradient(bottom, rgb(39,39,39) 13%, rgb(69,69,69) 100%);
				background-image: -o-linear-gradient(bottom, rgb(39,39,398) 13%, rgb(69,69,69) 100%);
				background-image: -moz-linear-gradient(bottom, rgb(39,39,39) 13%, rgb(69,69,69) 100%);
				background-image: -webkit-linear-gradient(bottom, rgb(39,39,39) 13%, rgb(69,69,69) 100%);
				background-image: -ms-linear-gradient(bottom, rgb(39,39,39) 13%, rgb(69,69,69) 100%);
			
				background-image: -webkit-gradient(
					linear,
					left bottom,
					left top,
					color-stop(0.13, rgb(39,39,39)),
					color-stop(1, rgb(69,69,69))
				);
			}
			
			#v-rotation {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				opacity: 0;
				height: 38px;
			}
			
			#v-rotator {
				position: absolute;
				top: 2px;
				right: 3px;
				font-size: 25px;
			}
			
			#v-rotator:hover {
				cursor: pointer;
			}
			
			.v-video-container:hover #v-rotation{
				opacity: .9;
			}
			
			#v-video {
				display: flex;
				margin: 0px auto;
			}
			
			#v-video-controls {
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				padding: 5px;
				opacity: 0;
			}
			
			.v-video-container:hover #v-video-controls{
				opacity: .9;
			}
			
			.v-video-container button {
				background: rgba(0,0,0,.5);
				border: 0;
				color: #EEE;
				-webkit-border-radius: 3px;
				-moz-border-radius: 3px;
				-o-border-radius: 3px;
				border-radius: 3px;
			}
			
			.v-video-container button:hover {
				cursor: pointer;
			}
			
			#v-seek-bar {
				width: 100%
			}
			
			#v-mute {
				font-size: 17px;
				height: 25px;
				width: 42px;
			}
			
			#v-volume-bar {
				width: 60px;
			}
			
			#v-play-container {
				display: flex;
				flex-direction: row;
				align-content: center;
				justify-content: flex-start;
				margin-bottom: 3px;
			}
			
			#v-play-pause {
				width: 47px;
				height: 25px;
			}
			
			#v-full-screen {
				font-size: 17px;
				height: 25px;
				width: 42px;
			}
			
			#v-loop {
				font-size: 20px;
				height: 25px;
				width: 42px;
			}
			
			#v-autoplay {
				font-size: 20px;
				height: 25px;
				width: 42px;
			}
			`;

			var style = document.createElement('style');

			if (style.styleSheet) {
				style.styleSheet.cssText = fullCss;
			} else {
				style.appendChild(document.createTextNode(fullCss));
			}

			document.getElementsByTagName('head')[0].appendChild(style);

			//
			// Get video parameters
			//

			var videoProperties = {
				height: videoContainer.hasAttribute("video-height") ? videoContainer.getAttribute('video-height') : null,
				source: videoContainer.hasAttribute("video-src") ? videoContainer.getAttribute('video-src') : null,
			}

			//
			// Initialize video properties
			// 

			var video = videoContainer.querySelector('video#v-video');
			video.setAttribute('src', videoProperties.source);

			if (videoProperties.height)
			{
				video.style.setProperty('height', videoProperties.height);
			}

			//
			// Register events for video controls
			//

			// Video
			video.onplaying = function() {
				playButton.innerHTML = "&#10074;&#10074;";
			};
			video.onpause = function() {
				playButton.innerHTML = "&#9658;";
			};
			video.addEventListener("timeupdate", function() {
				var value = (100 / video.duration) * video.currentTime;
				seekBar.value = value;
			});

			// Rotator
			var videoDimensionReverse = false;

			var rotator = videoContainer.querySelector('#v-rotator');
			rotator.addEventListener('click', function() {
				if (video.style.hasOwnProperty('transform'))
				{
					let nextDegree = '';
					let currentDegree = video.style.getPropertyValue('transform');
				
					switch(currentDegree)
					{
						case '':
						case 'rotate(0deg)':
							nextDegree = 'rotate(90deg)';
							videoDimensionReverse = true;
							break;
						case 'rotate(90deg)':
							nextDegree = 'rotate(180deg)';
							videoDimensionReverse = false;
							break;
						case 'rotate(180deg)':
							nextDegree = 'rotate(270deg)';
							videoDimensionReverse = true;
							break;
						case 'rotate(270deg)':
							nextDegree = 'rotate(0deg)';
							videoDimensionReverse = false;
							break;
					}
					video.style.setProperty('transform', nextDegree);
				}
				else
				{
					video.style.setProperty('transform', 'rotate(90deg)');
					videoDimensionReverse = true;
				}
				
				if (videoDimensionReverse)
				{
					videoContainer.style.setProperty('width', video.offsetWidth + 'px');
					video.style.setProperty('width', videoProperties.height);
				}
				else
				{
					videoContainer.style.removeProperty('width');
					video.style.removeProperty('width');
					video.style.setProperty('height', videoProperties.height);
				}
			});

			// Play
			var playButton = videoContainer.querySelector("#v-play-pause");
			playButton.addEventListener("click", function() {
				if (video.paused == true) {
					video.play();
					playButton.innerHTML = "&#10074;&#10074;";
				} else {
					video.pause();
					playButton.innerHTML = "&#9658;";
				}
			});

			// Video progress
			var seekBar = videoContainer.querySelector("#v-seek-bar");
			seekBar.addEventListener("change", function() {
				var time = video.duration * (seekBar.value / 100);
				video.currentTime = time;
			});
			seekBar.addEventListener("mousedown", function() {
				video.pause();
			});
			seekBar.addEventListener("mouseup", function() {
				video.play();
			});
			
			// Mute
			var muteButton = videoContainer.querySelector("#v-mute");
			muteButton.addEventListener("click", function() {
				if (video.muted == false) {
					video.muted = true;
					muteButton.innerHTML = "&#128264;";
				} else {
					video.muted = false;
					muteButton.innerHTML = "&#128266;";
				}
			});

			// Volum
			var volumeBar = videoContainer.querySelector("#v-volume-bar");
			volumeBar.addEventListener("change", function() {
				video.volume = volumeBar.value;
			});

			// Full screen
			var fullScreenButton = videoContainer.querySelector("#v-full-screen");
			fullScreenButton.addEventListener("click", function() {
				if (video.requestFullscreen) {
					video.requestFullscreen();
				} else if (video.mozRequestFullScreen) {
					video.mozRequestFullScreen(); // Firefox
				} else if (video.webkitRequestFullscreen) {
					video.webkitRequestFullscreen(); // Chrome and Safari
				}
			});

			// Loop
			var loopButton = videoContainer.querySelector("#v-loop");
			loopButton.addEventListener("click", function() {
				if (video.hasAttribute('loop'))
				{
					video.removeAttribute('loop');
					loopButton.style.setProperty('background', 'rgba(0,0,0,0.5)');
				}
				else
				{
					video.setAttribute('loop', '');
					loopButton.style.setProperty('background', 'rgba(0,0,0,1)');
				}
			});

			// Auto play
			// var autoplayButton = videoContainer.querySelector("#v-autoplay");
			// autoplayButton.addEventListener("click", function() {
			// 	if (video.hasAttribute('autoplay'))
			// 	{
			// 		video.removeAttribute('autoplay');
			// 		autoplayButton.style.setProperty('background', 'rgba(0,0,0,0.5)');
			// 	}
			// 	else
			// 	{
			// 		video.setAttribute('autoplay', '');
			// 		autoplayButton.style.setProperty('background', 'rgba(0,0,0,1)');
			// 	}
			// });
		}));
	}
}