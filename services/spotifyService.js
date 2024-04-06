const axios = require("axios");
// The library to encode/decode weird text returned from API endpoint.
const he = require("he");

function removeDuplicatesFromResults(arr) {
    var obj = {};
    var ret_arr = [];
    for (var i = 0; i < arr.length; i++) {
        obj[arr[i]] = true;
    }
    for (var key in obj) {
        ret_arr.push(key);
    }
    arr = ret_arr;
    return arr;
}

// https://stackoverflow.com/a/14930567/14597561
function compareAndRemove(removeFromThis, compareToThis) {
    removeFromThis = removeFromThis.filter(val => !compareToThis.includes(val));
    return (removeFromThis);
}

async function fetchSpotifyResults(query, accessToken) {
    // Variables to store the data fetched from API endpoint.
    let spotifyResult = "";
    // let spotifyTrackArtistResult = "";

    let j = 0;
    let k = 0;

    const br1C = "\x1b[36m%s\x1b[0m"
    const br2C = "\x1b[35m%s\x1b[0m"
    const br1 = "-------------------------------";
    const br2 = "---------------------------------------------------------------------------------------------";

    let spotifyTrackId = [];
    let spotifyTrackThumb = [];
    let spotifyTrackTitle = [];
    let spotifyTrackArtist = [];

    let spotifyTrackArtistId = [];
    let spotifyTrackArtistThumb = [];
    let spotifyTrackArtistName = [];

    let spotifyQueryArtistId = [];
    let spotifyQueryArtistThumb = [];
    let spotifyQueryArtistName = [];

    let spotifyUniqueTrackArtistId = [];
    let spotifyUniqueTrackArtistThumb = [];
    let spotifyUniqueTrackArtistName = [];

    let spotifyUniqueQueryArtistId = [];
    let spotifyUniqueQueryArtistThumb = [];
    let spotifyUniqueQueryArtistName = [];

    let spotifyAlbumId = [];
    let spotifyAlbumThumb = [];
    let spotifyAlbumName = [];
    let spotifyTrackAlbumArtist = [];
    let spotifyQueryAlbumArtist = [];

    let spotifyUniqueAlbumId = [];
    let spotifyUniqueAlbumThumb = [];
    let spotifyUniqueAlbumName = [];
    // let spotifyUniqueTrackAlbumArtist = [];
    let spotifyUniqueQueryAlbumArtist = [];
    let spotifyUniqueAlbumArtist = [];

    // Follow procedure here to get access_token and refresh_token: https://benwiz.com/blog/create-spotify-refresh-token/
    let searchUrl = "https://api.spotify.com/v1/search?q=" + query + "&type=track%2Calbum%2Cartist&limit=4&market=IN";

    //Using Axios to fetch data. It gets parsed to JSON automatically.
    await axios.get(searchUrl, {
        headers: {
            // This user.accessToken gets stored in req, after the completion of oAuth process.
            'Authorization': "Bearer " + accessToken,
        }
    })
        .then(async (resAxios) => {

            // console.log(resAxios.data)
            spotifyResult = resAxios.data;
            // console.log(spotifyResult.tracks.items[0].artists);

            //Extracting required data from 'result'.

            // Allocating values to Track 00, 01, 02, 03.
            if ((spotifyResult.tracks.items).length > 0) {
                console.log("\n");
                for (i = 0; i < (spotifyResult.tracks.items).length; i++) {
                    spotifyTrackId[i] = spotifyResult.tracks.items[i].id;

                    if ((spotifyResult.tracks.items[i].album.images).length > 0)
                        spotifyTrackThumb[i] = spotifyResult.tracks.items[i].album.images[2].url;
                    else
                        spotifyTrackThumb[i] = "./img/defaults/album" + i + ".png";

                    spotifyTrackTitle[i] = he.decode(spotifyResult.tracks.items[i].name);
                    spotifyTrackArtist[i] = he.decode(spotifyResult.tracks.items[i].artists[0].name);
                    console.groupCollapsed("\x1b[32m%s\x1b[0m", "Track 0" + i + ":");
                    console.info(spotifyTrackId[i]);
                    console.info(spotifyTrackThumb[i]);
                    console.info(spotifyTrackTitle[i]);
                    console.info(spotifyTrackArtist[i]);
                    console.groupEnd();
                }
            }

            // Values are allocated only if the values exist.
            if ((spotifyResult.tracks.items).length > 0 && (spotifyResult.tracks.items).length > 0 && (spotifyResult.tracks.items).length > 0) {
                console.log(br2C, br2);
                // Allocating values to all the artists of Track 00.
                for (i = 0; i < (spotifyResult.tracks.items[0].artists).length; i++) {
                    spotifyTrackArtistId[i] = spotifyResult.tracks.items[0].artists[i].id; //It is not able to set values for tracks with nore than 3 artists. e.g., Girls by Rita Ora.

                    await axios.get("https://api.spotify.com/v1/artists/" + spotifyTrackArtistId[i], {
                        headers: {
                            'Authorization': "Bearer " + accessToken,
                        }
                    }).then((resTrackArtistResult) => {
                        // console.log(resTrackArtistResult);
                        if ((resTrackArtistResult.data.images).length > 0)
                            spotifyTrackArtistThumb[i] = resTrackArtistResult.data.images[2].url;
                        else
                            spotifyTrackArtistThumb[i] = "./img/defaults/artist" + i + ".png";
                    })

                    spotifyTrackArtistName[i] = he.decode(spotifyResult.tracks.items[0].artists[i].name);

                    console.groupCollapsed("\x1b[32m%s\x1b[0m", "Track 00 Artist 0" + i + ":");
                    console.info(spotifyTrackArtistId[i]);
                    console.info(spotifyTrackArtistThumb[i]);
                    console.info(spotifyTrackArtistName[i]);
                    console.groupEnd();
                }

                console.log(br1C, br1);
                // Allocating values to all the artists of Track 01.
                j = 0;
                for (i = (spotifyResult.tracks.items[0].artists).length; i < ((spotifyResult.tracks.items[0].artists).length + (spotifyResult.tracks.items[1].artists).length); i++) {
                    spotifyTrackArtistId[i] = spotifyResult.tracks.items[1].artists[j].id;
                    await axios.get("https://api.spotify.com/v1/artists/" + spotifyResult.tracks.items[1].artists[j].id, {
                        headers: {
                            'Authorization': "Bearer " + accessToken,
                        }
                    }).then((resTrackArtistResult) => {
                        if ((resTrackArtistResult.data.images).length > 0)
                            spotifyTrackArtistThumb[i] = resTrackArtistResult.data.images[2].url;
                        else
                            spotifyTrackArtistThumb[i] = "./img/defaults/artist" + (i + 5) + ".png";
                    })

                    spotifyTrackArtistName[i] = he.decode(spotifyResult.tracks.items[1].artists[j].name);

                    console.groupCollapsed("\x1b[32m%s\x1b[0m", "Track 01 Artist 0" + j + ":");
                    console.info(spotifyTrackArtistId[i]);
                    console.info(spotifyTrackArtistThumb[i]);
                    console.info(spotifyTrackArtistName[i]);
                    console.groupEnd();
                    j++;
                }

                console.log(br1C, br1);
                // Allocating values to all the artists of Track 02.
                j = 0;
                for (i = ((spotifyResult.tracks.items[0].artists).length + (spotifyResult.tracks.items[1].artists).length); i < ((spotifyResult.tracks.items[0].artists).length + (spotifyResult.tracks.items[1].artists).length + (spotifyResult.tracks.items[2].artists).length); i++) {
                    spotifyTrackArtistId[i] = spotifyResult.tracks.items[2].artists[j].id;
                    await axios.get("https://api.spotify.com/v1/artists/" + spotifyResult.tracks.items[2].artists[j].id, {
                        headers: {
                            'Authorization': "Bearer " + accessToken,
                        }
                    }).then((resTrackArtistResult) => {
                        if ((resTrackArtistResult.data.images).length > 0)
                            spotifyTrackArtistThumb[i] = resTrackArtistResult.data.images[2].url;
                        else
                            spotifyTrackArtistThumb[i] = "./img/defaults/artist" + (i + 10) + ".png";
                    })

                    spotifyTrackArtistName[i] = he.decode(spotifyResult.tracks.items[2].artists[j].name);

                    console.groupCollapsed("\x1b[32m%s\x1b[0m", "Track 02 Artist 0" + j + ":");
                    console.info(spotifyTrackArtistId[i]);
                    console.info(spotifyTrackArtistThumb[i]);
                    console.info(spotifyTrackArtistName[i]);
                    console.groupEnd();
                    j++;
                }
            }

            // Allocating values to 4 artists if the user searches by Artist name. I.e., results matching query value.
            // Values are allocated only if the values exist.
            if ((spotifyResult.artists.items).length > 0) {
                console.log("\n");
                for (i = 0; i < (spotifyResult.artists.items).length; i++) {
                    spotifyQueryArtistId[i] = spotifyResult.artists.items[i].id;

                    // Some artists do not have a user photo.
                    if ((spotifyResult.artists.items[i].images).length > 0)
                        spotifyQueryArtistThumb[i] = spotifyResult.artists.items[i].images[2].url;
                    else
                        spotifyQueryArtistThumb[i] = "./img/defaults/artist" + (i + 15) + ".png";

                    spotifyQueryArtistName[i] = he.decode(spotifyResult.artists.items[i].name);

                    console.groupCollapsed("\x1b[32m%s\x1b[0m", "Query Artist 0" + i + ":");
                    console.info(spotifyQueryArtistId[i]);
                    console.info(spotifyQueryArtistThumb[i]);
                    console.info(spotifyQueryArtistName[i]);
                    console.groupEnd();
                }
            }

            // Removing redundant artists from spotifyTrackArtist_ and adding the unique values to spotifyTrackArtistIdUnique.
            // This is being done, because same artist was being displayed in the 'Artists' secction.
            if ((spotifyResult.tracks.items).length > 0) {
                console.log("\n");
                spotifyUniqueTrackArtistId = removeDuplicatesFromResults(spotifyTrackArtistId);
                spotifyUniqueTrackArtistThumb = removeDuplicatesFromResults(spotifyTrackArtistThumb);
                spotifyUniqueTrackArtistName = removeDuplicatesFromResults(spotifyTrackArtistName);
                console.groupCollapsed("\x1b[32m%s\x1b[0m", "Unique Track Artists (ID):");
                console.info("\x1b[37m" + spotifyUniqueTrackArtistId + "\x1b[0m");
                console.groupEnd();
                console.groupCollapsed("\x1b[32m%s\x1b[0m", "Unique Track Artists (Thumbnail):");
                console.info("\x1b[37m" + spotifyUniqueTrackArtistThumb + "\x1b[0m");
                console.groupEnd();
                console.groupCollapsed("\x1b[32m%s\x1b[0m", "Unique Track Artists (Name):");
                console.info("\x1b[37m" + spotifyUniqueTrackArtistName + "\x1b[0m");
                console.groupEnd();
            }

            if ((spotifyResult.artists.items).length > 0) {
                console.log("\n");
                spotifyUniqueQueryArtistId = compareAndRemove(spotifyQueryArtistId, spotifyUniqueTrackArtistId);
                spotifyUniqueQueryArtistThumb = compareAndRemove(spotifyQueryArtistThumb, spotifyUniqueTrackArtistThumb);
                spotifyUniqueQueryArtistName = compareAndRemove(spotifyQueryArtistName, spotifyUniqueTrackArtistName);
                console.groupCollapsed("\x1b[32m%s\x1b[0m", "Unique Query Artists (ID):");
                console.info("\x1b[37m" + spotifyUniqueQueryArtistId + "\x1b[0m");
                console.groupEnd();
                console.groupCollapsed("\x1b[32m%s\x1b[0m", "Unique Query Artists (Thumbnail):");
                console.info("\x1b[37m" + spotifyUniqueQueryArtistThumb + "\x1b[0m");
                console.groupEnd();
                console.groupCollapsed("\x1b[32m%s\x1b[0m", "Unique Query Artists (Name):");
                console.info("\x1b[37m" + spotifyUniqueQueryArtistName + "\x1b[0m");
                console.groupEnd();
            }

            // Providing album, if the user searches by Track name. (Or artist name.)
            // Allocating value to Album 00 of Track 00. This particular value is being alloted in 0th place of this array.
            // QueryArtists are all unique.
            // Values are allocated only if the values exist.
            if ((spotifyResult.tracks.items).length > 0) {
                console.log(br2C, br2);
                spotifyAlbumId[0] = spotifyResult.tracks.items[0].album.id;

                if ((spotifyResult.tracks.items[0].album.images).length > 0) {
                    spotifyAlbumThumb[0] = spotifyResult.tracks.items[0].album.images[2].url;
                } else {
                    spotifyAlbumThumb[0] = "./img/defaults/album0.png";
                }

                spotifyAlbumName[0] = he.decode(spotifyResult.tracks.items[0].name);
                spotifyTrackAlbumArtist[0] = he.decode(spotifyResult.tracks.items[0].album.artists[0].name);
                /* This is commented because, compareAndRemove naturally removed the same artist, for everytime same artist was returned for the same album.
                 For e.g., See You Again and Summer Throwback are both returned in results and they both have 'Wiz Khalife as the Artist.
                 He was being comaparedAndRemoved twice. This resulted in mismatched ordering of artists from the other arrays.
               */
                console.groupCollapsed("\x1b[32m%s\x1b[0m", "[00] Track 00 Album 00:");
                console.info("\x1b[37m" + spotifyAlbumId[0] + "\x1b[0m");
                console.info("\x1b[37m" + spotifyAlbumThumb[0] + "\x1b[0m");
                console.info("\x1b[37m" + spotifyAlbumName[0] + "\x1b[0m");
                // console.info("\x1b[37m" + spotifyAlbumArtist[0] + "\x1b[0m");
                console.groupEnd();
            }


            // Allocating value to Album 00 of Track 01. This particular value is being alloted in 1st place of this array.
            // This album would be shown only if the album ID of track 00 and track 02 are unequal. This logic would be implemented in EJS file.
            // Values are allocated only if the values exist.
            if ((spotifyResult.tracks.items).length > 1) {
                spotifyAlbumId[1] = spotifyResult.tracks.items[1].album.id;

                if ((spotifyResult.tracks.items[1].album.images).length > 0)
                    spotifyAlbumThumb[1] = spotifyResult.tracks.items[1].album.images[2].url;
                else
                    spotifyTrackThumb[1] = "./img/defaults/album01.png";

                spotifyAlbumName[1] = he.decode(spotifyResult.tracks.items[1].album.name);
                spotifyTrackAlbumArtist[1] = he.decode(spotifyResult.tracks.items[1].album.artists[0].name);
                console.groupCollapsed("\x1b[32m%s\x1b[0m", "[01] Track 01 Album 00:");
                console.info("\x1b[37m" + spotifyAlbumId[1] + "\x1b[0m");
                console.info("\x1b[37m" + spotifyAlbumThumb[1] + "\x1b[0m");
                console.info("\x1b[37m" + spotifyAlbumName[1] + "\x1b[0m");
                // console.info("\x1b[37m" + spotifyAlbumArtist[1] + "\x1b[0m");
                console.groupEnd();
            }


            // Providing album, if the user searches by album name. (Or artist name.)
            // Allocating value to 4 Albums that match the queryValue.
            // '1' is 'added' in the condition below, because we are aiming for i(max.) = 5. As per API URL, (spotifyResult.albums.items).length = 4.
            // If we add '1' to this '4', we would achieve the max. 'i'. To change this value in future, we would need to modify '+1' as per requirement.
            // We are doing 'i-2' because, we want to store the value of 'first' album item in spotifyAlbum_[2].
            if ((spotifyResult.albums.items).length > 0) {
                console.log("\n");
                for (i = 2; i <= ((spotifyResult.albums.items).length) + 1; i++) {
                    spotifyAlbumId[i] = spotifyResult.albums.items[i - 2].id;

                    if ((spotifyResult.albums.items[i - 2].images).length > 0)
                        spotifyAlbumThumb[i] = spotifyResult.albums.items[i - 2].images[2].url;
                    else
                        spotifyAlbumThumb[i] = "./img/defaults/album" + (i + 2) + ".png";

                    spotifyAlbumName[i] = he.decode(spotifyResult.albums.items[i - 2].name);
                    spotifyQueryAlbumArtist[i - 2] = he.decode(spotifyResult.albums.items[i - 2].artists[0].name);

                    console.groupCollapsed("\x1b[32m%s\x1b[0m", "[0" + i + "] " + "Top Result 0" + (i - 2) + " Album:");
                    console.info("\x1b[37m" + spotifyAlbumId[i] + "\x1b[0m");
                    console.info("\x1b[37m" + spotifyAlbumThumb[i] + "\x1b[0m");
                    console.info("\x1b[37m" + spotifyAlbumName[i] + "\x1b[0m");
                    // console.info("\x1b[37m" + spotifyAlbumArtist[i] + "\x1b[0m");
                    console.groupEnd();
                }

                // Removing redundant albums.
                spotifyUniqueAlbumId = removeDuplicatesFromResults(spotifyAlbumId);
                spotifyUniqueAlbumThumb = removeDuplicatesFromResults(spotifyAlbumThumb);
                spotifyUniqueAlbumName = removeDuplicatesFromResults(spotifyAlbumName);

                /*
                 We need all the _AlbumArtists to maintain order. Hence, this is commented.
                 spotifyUniqueTrackAlbumArtist = await removeDuplicatesFromResults(spotifyTrackAlbumArtist);
                 spotifyUniqueQueryAlbumArtist = await removeDuplicatesFromResults(spotifyQueryAlbumArtist);
               */

                // Following is being done, because we do not want redundant queryAlbumArtists. It goes with the order as well.
                spotifyUniqueQueryAlbumArtist = compareAndRemove(spotifyQueryAlbumArtist, spotifyTrackAlbumArtist);

                spotifyUniqueAlbumArtist = spotifyTrackAlbumArtist.concat(spotifyUniqueQueryAlbumArtist);

                console.log("\n");
                console.groupCollapsed("spotifyTrackAlbumArtist:");
                console.log(spotifyTrackAlbumArtist);
                console.groupEnd();
                console.log("\n");
                console.groupCollapsed("spotifyUniqueQueryAlbumArtist:");
                console.log(spotifyUniqueQueryAlbumArtist);
                console.groupEnd();

                console.log("\n");
                console.groupCollapsed("Unique Album(s) (ID):");
                console.info(spotifyUniqueAlbumId);
                console.groupEnd();
                console.groupCollapsed("Unique Album(s) (Thumbnail):");
                console.info(spotifyUniqueAlbumThumb);
                console.groupEnd();
                console.groupCollapsed("Unique Album(s) (Name):");
                console.info(spotifyUniqueAlbumName);
                console.groupEnd();
                console.groupCollapsed("Unique Album Artist(s) (Name):");
                console.info(spotifyUniqueAlbumArtist);
                console.groupEnd();
            }
            /* Error Handling for Spotify
             // The 'results' named EJS file is rendered and fed in response. The 'required' data is passed into it using the following variable(s).
             // A folder named 'views' has to be in the same directory as "app.js". That folder contains 'results.ejs'.

             if(spotifyTrackId.length > 1 && spotifyUniqueTrackArtistId.length > 1 && spotifyUniqueQueryArtistId.length > 1 && spotifyUniqueAlbumId.length > 1) {
               res.render("noResults", {
                 query: query,
                 user: req.user
               });
             }
            */
            // else {

            // }
        }).catch((error) => {
            console.error(error);
            console.log("Status '" + error.response.status + "': " + error.response.statusText);
            // if(error.response.status == 401) {
            //   res.send("Access token expired. Please open the website again and login.")
            // }
        });
    return {
        spotifyTrackId: spotifyTrackId,
        spotifyTrackThumb: spotifyTrackThumb,
        spotifyTrackTitle: spotifyTrackTitle,
        spotifyTrackArtist: spotifyTrackArtist,

        spotifyUniqueTrackArtistId: spotifyUniqueTrackArtistId,
        spotifyUniqueTrackArtistThumb: spotifyUniqueTrackArtistThumb,
        spotifyUniqueTrackArtistName: spotifyUniqueTrackArtistName,

        spotifyUniqueQueryArtistId: spotifyUniqueQueryArtistId,
        spotifyUniqueQueryArtistThumb: spotifyUniqueQueryArtistThumb,
        spotifyUniqueQueryArtistName: spotifyUniqueQueryArtistName,

        spotifyAlbumId: spotifyAlbumId,
        spotifyAlbumThumb: spotifyAlbumThumb,
        spotifyAlbumName: spotifyAlbumName,
        // spotifyAlbumArtist: spotifyAlbumArtist,

        spotifyUniqueAlbumId: spotifyUniqueAlbumId,
        spotifyUniqueAlbumThumb: spotifyUniqueAlbumThumb,
        spotifyUniqueAlbumName: spotifyUniqueAlbumName,
        spotifyUniqueAlbumArtist: spotifyUniqueAlbumArtist
    };
}

module.exports = {fetchSpotifyResults};
