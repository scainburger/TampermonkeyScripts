// ==UserScript==
// @name        Embed Youtube on Twitch
// @namespace   Violentmonkey Scripts
// @match       https://www.twitch.tv/*
// @version     1.0
// @author      scainburg
// @grant       GM_xmlhttpRequest
// @description Replace the Twitch player with a YouTube embed from a specified channel
// ==/UserScript==

(function () {
    'use strict';

    function fetchLiveVideoId(channelHandle) {
        const normalizedHandle = channelHandle.startsWith('@') ? channelHandle : `@${channelHandle}`;
        const youtubeUrl = `https://www.youtube.com/${normalizedHandle}/streams`;

        console.log("trying to get " + youtubeUrl)

        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: youtubeUrl,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                },
                onload: function (response) {
                    const html = response.responseText;
                    const videoIdRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/;
                    const match = videoIdRegex.exec(html);
                    if (match && match[1]) {
                        resolve(match[1]);
                    } else {
                        resolve(null);
                    }
                },
                onerror: function (error) {
                    resolve(null);
                }
            });
        });
    }

    function initToolbarButton() {
        var youtubeSVG = '<svg xmlns="http://www.w3.org/2000/svg" id="yt-ringo2-svg_yt11" width="29" height="20" viewBox="0 0 29 20" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><g><path d="M14.4848 20C14.4848 20 23.5695 20 25.8229 19.4C27.0917 19.06 28.0459 18.08 28.3808 16.87C29 14.65 29 9.98 29 9.98C29 9.98 29 5.34 28.3808 3.14C28.0459 1.9 27.0917 0.94 25.8229 0.61C23.5695 0 14.4848 0 14.4848 0C14.4848 0 5.42037 0 3.17711 0.61C1.9286 0.94 0.954148 1.9 0.59888 3.14C0 5.34 0 9.98 0 9.98C0 9.98 0 14.65 0.59888 16.87C0.954148 18.08 1.9286 19.06 3.17711 19.4C5.42037 20 14.4848 20 14.4848 20Z" fill="black"></path><path d="M19 10L11.5 5.75V14.25L19 10Z" fill="white"></path></g></svg>';
        document.querySelector('div.chat-input__buttons-container').firstChild.insertAdjacentHTML('afterbegin', '<button id="ytEmbedButton">' + youtubeSVG + '</button>');
        document.querySelector("#ytEmbedButton").addEventListener('click', async () => {
            var youtubeChannelName = prompt("Enter YouTube stream ID")

            document.querySelector("#ytEmbedButton").remove();
            var theaterButton = document.querySelector("button[aria-label*='Theat']");
            document.querySelector('div.chat-input__buttons-container').firstChild.prepend(theaterButton);
            
            var videoContainer = document.querySelector("div.video-player__container");
            var videoId = await fetchLiveVideoId(youtubeChannelName);
            const youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

            const iframe = document.createElement('iframe');
            iframe.src = youtubeEmbedUrl;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.allowFullscreen = true;
            iframe.frameBorder = '0';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.aspectRatio = '16 / 9';

            videoContainer.innerHTML = null;
            videoContainer.appendChild(iframe);
        })
    }

    var checkCount = 0;
    var existCondition = setInterval(function () {
        if (document.querySelector("button[aria-label*='Theat']") && document.querySelector("div.video-player__container") && document.querySelector('div.chat-input__buttons-container').firstChild) {
            clearInterval(existCondition);
            initToolbarButton();
        }
        if (checkCount > 10) {
            console.error("YouTube embed timed out")
            clearInterval(existCondition);
        }
        checkCount++;
    }, 1000);

})();
