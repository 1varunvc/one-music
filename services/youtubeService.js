const axios = require("axios");
const he = require("he");
const keys = require("../config/keys"); // Adjust the path as necessary

let ytQueryResult = "";
let ytCoverResult = "";
let ytLiveResult = "";

let ytQueryAppJs = [];

let ytCoverAppJs = [];
let ytCoverUniqueAppJs = [];

let ytLiveAppJs = [];
let ytLiveUniqueAppJs = [];

// Declaring variables for the function 'ytAxiosGetFunc'
let urlOfYtAxiosGetFunc = "";

// This function GETs data, parses it, allocates required values in an array.
async function ytAxiosGetFunc(queryOfYtAxiosGetFunc, maxResultsOfYtAxiosGetFunc) {

    let ytExtractedResult = [];
    let ytVideoId = [];
    let ytVideoThumb = [];
    let ytVideoTitle = [];
    let ytVideoChannel = [];
    urlOfYtAxiosGetFunc = "https://www.googleapis.com/youtube/v3/search?key=" + keys.google.apiKey[1] + "&part=snippet&order=relevance&type=video&videoEmbeddable=true";

    try {
        let ytResponse = await axios({
            url: urlOfYtAxiosGetFunc,
            method: "get",
            params: {
                q: queryOfYtAxiosGetFunc,
                maxResults: maxResultsOfYtAxiosGetFunc
            }
        })

        let ytResult = ytResponse.data;

        for (let i = 0; i < (ytResult.items).length; i++) {
            ytVideoId[i] = ytResult.items[i].id.videoId;
            ytVideoThumb[i] = ytResult.items[i].snippet.thumbnails.default.url;
            ytVideoTitle[i] = he.decode(ytResult.items[i].snippet.title);
            ytVideoChannel[i] = he.decode(ytResult.items[i].snippet.channelTitle);
        }

        return {
            id: ytVideoId,
            thumb: ytVideoThumb,
            title: ytVideoTitle,
            channel: ytVideoChannel
        };
    } catch (e) {
        console.log(e);
    }
}


// https://stackoverflow.com/a/14930567/14597561
function compareAndRemove(removeFromThis, compareToThis) {
    removeFromThis = removeFromThis.filter(val => !compareToThis.includes(val));
    return (removeFromThis);
}

async function fetchYouTubeResults(query) {
    // Fetching top results related to user's query and putting them in the array.
    ytQueryAppJs = await ytAxiosGetFunc(query, 4);
    console.log("ytQueryAppJs:");
    console.log(ytQueryAppJs);

    // Fetching 'cover' songs related to user's query and putting them in the array.
    if (query.includes("cover") === true) {
        ytCoverAppJs = await ytAxiosGetFunc(query, 8);
        console.log("ytCoverAppJs:");
        console.log(ytCoverAppJs);

        // Removing redundant values.
        ytCoverUniqueAppJs.id = compareAndRemove(ytCoverAppJs.id, ytQueryAppJs.id);
        ytCoverUniqueAppJs.thumb = compareAndRemove(ytCoverAppJs.thumb, ytQueryAppJs.thumb);
        ytCoverUniqueAppJs.title = compareAndRemove(ytCoverAppJs.title, ytQueryAppJs.title);
        ytCoverUniqueAppJs.channel = compareAndRemove(ytCoverAppJs.channel, ytQueryAppJs.channel);

        console.log("ytCoverUniqueAppJs:");
        console.log(ytCoverUniqueAppJs);
    } else if (query.includes("live") === true) {
        ytCoverAppJs = await ytAxiosGetFunc(query.replace("live", " cover "), 4);
        console.log("ytCoverAppJs:");
        console.log(ytCoverAppJs);

        // Removing redundant values.
        ytCoverUniqueAppJs.id = compareAndRemove(ytCoverAppJs.id, ytQueryAppJs.id);
        ytCoverUniqueAppJs.thumb = compareAndRemove(ytCoverAppJs.thumb, ytQueryAppJs.thumb);
        ytCoverUniqueAppJs.title = compareAndRemove(ytCoverAppJs.title, ytQueryAppJs.title);
        ytCoverUniqueAppJs.channel = compareAndRemove(ytCoverAppJs.channel, ytQueryAppJs.channel);

        console.log("ytCoverUniqueAppJs:");
        console.log(ytCoverUniqueAppJs);
    } else {
        ytCoverAppJs = await ytAxiosGetFunc(query + " cover", 4);
        console.log("ytCoverAppJs:");
        console.log(ytCoverAppJs);

        // Removing redundant values.
        ytCoverUniqueAppJs.id = compareAndRemove(ytCoverAppJs.id, ytQueryAppJs.id);
        ytCoverUniqueAppJs.thumb = compareAndRemove(ytCoverAppJs.thumb, ytQueryAppJs.thumb);
        ytCoverUniqueAppJs.title = compareAndRemove(ytCoverAppJs.title, ytQueryAppJs.title);
        ytCoverUniqueAppJs.channel = compareAndRemove(ytCoverAppJs.channel, ytQueryAppJs.channel);

        console.log("ytCoverUniqueAppJs:");
        console.log(ytCoverUniqueAppJs);
    }

    // Fetching 'live performances' related to user's query and putting them in the array.
    if (query.includes("live") === true) {
        ytLiveAppJs = await ytAxiosGetFunc(query, 8);
        console.log("ytLiveAppJs:");
        console.log(ytLiveAppJs);

        // Removing redundant values.
        ytLiveUniqueAppJs.id = compareAndRemove(ytLiveAppJs.id, (ytQueryAppJs.id).concat(ytCoverUniqueAppJs.id));
        ytLiveUniqueAppJs.thumb = compareAndRemove(ytLiveAppJs.thumb, (ytQueryAppJs.thumb).concat(ytCoverUniqueAppJs.thumb));
        ytLiveUniqueAppJs.title = compareAndRemove(ytLiveAppJs.title, (ytQueryAppJs.title).concat(ytCoverUniqueAppJs.title));
        ytLiveUniqueAppJs.channel = compareAndRemove(ytLiveAppJs.channel, (ytQueryAppJs.channel).concat(ytCoverUniqueAppJs.channel));

        console.log("ytLiveUniqueAppJs:");
        console.log(ytLiveUniqueAppJs);
    } else if (query.includes("cover") === true) {
        ytLiveAppJs = await ytAxiosGetFunc(query.replace("cover", " live "), 4);
        console.log("ytLiveAppJs:");
        console.log(ytLiveAppJs);

        // Removing redundant values.
        ytLiveUniqueAppJs.id = compareAndRemove(ytLiveAppJs.id, (ytQueryAppJs.id).concat(ytCoverUniqueAppJs.id));
        ytLiveUniqueAppJs.thumb = compareAndRemove(ytLiveAppJs.thumb, (ytQueryAppJs.thumb).concat(ytCoverUniqueAppJs.thumb));
        ytLiveUniqueAppJs.title = compareAndRemove(ytLiveAppJs.title, (ytQueryAppJs.title).concat(ytCoverUniqueAppJs.title));
        ytLiveUniqueAppJs.channel = compareAndRemove(ytLiveAppJs.channel, (ytQueryAppJs.channel).concat(ytCoverUniqueAppJs.channel));

        console.log("ytLiveUniqueAppJs:");
        console.log(ytLiveUniqueAppJs);
    } else {
        ytLiveAppJs = await ytAxiosGetFunc(query + " live", 4);
        console.log("ytLiveAppJs:");
        console.log(ytLiveAppJs);

        // Removing redundant values.
        ytLiveUniqueAppJs.id = compareAndRemove(ytLiveAppJs.id, (ytQueryAppJs.id).concat(ytCoverUniqueAppJs.id));
        ytLiveUniqueAppJs.thumb = compareAndRemove(ytLiveAppJs.thumb, (ytQueryAppJs.thumb).concat(ytCoverUniqueAppJs.thumb));
        ytLiveUniqueAppJs.title = compareAndRemove(ytLiveAppJs.title, (ytQueryAppJs.title).concat(ytCoverUniqueAppJs.title));
        ytLiveUniqueAppJs.channel = compareAndRemove(ytLiveAppJs.channel, (ytQueryAppJs.channel).concat(ytCoverUniqueAppJs.channel));

        console.log("ytLiveUniqueAppJs:");
        console.log(ytLiveUniqueAppJs);
    }

    console.log("Values to be sent for rendering: ");
    console.log("ytQueryAppJs");
    console.log(ytQueryAppJs);
    console.log("ytCoverUniqueAppJs");
    console.log(ytCoverUniqueAppJs);
    console.log("ytLiveUniqueAppJs");
    console.log(ytLiveUniqueAppJs);

    // The 'results' named EJS file is rendered and fed in response. The 'required' data is passed into it using the following variable(s).
    return {
        ytQueryAppJs: ytQueryAppJs,
        ytCoverUniqueAppJs: ytCoverUniqueAppJs,
        ytLiveUniqueAppJs: ytLiveUniqueAppJs
    };
}

module.exports = {fetchYouTubeResults};