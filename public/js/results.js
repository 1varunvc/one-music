let i = 0;
$(document).ready(function () {
    // Change  the background when hovering over the search results.
    $('.item').hover(function () {
        $(this).animate({'backgroundColor': '#171717'}, 100);
    }, function () {
        $(this).animate({'backgroundColor': 'black'}, 200);
    });

    // Recognise clicks on the search results (even the ones returned with the AJAX call) and display the content in the nowPlayingContainer.
    $('.contentContainer').on('click', '[id^=ytQueryEjs], [id^=ytCoverUniqueEjs], [id^=ytLiveUniqueEjs], [id^=spotifyTrackId], [id^=spotifyUniqueTrackArtistId], [id^=spotifyUniqueQueryArtistId], [id^=spotifyUniqueAlbumId]', function () {
        const id = $(this).attr('id');
        const baseId = id.match(/^[a-zA-Z]+/g)[0]; // Extracts the base ID
        const index = parseInt(id.replace(/^\D+/g, ''), 10); // Removes non-digits at the start and parses the rest as integer

        let contentUrl, contentType;

        const ytBaseURL = "https://www.youtube.com/embed";
        const spotifyBaseURL = "https://open.spotify.com/embed";

        // Handling YouTube items
        if (baseId.startsWith('yt')) {
            contentType = 'YouTube';
            if (baseId === 'ytQueryEjs') contentUrl = `${ytBaseURL}/${ytQueryEjs.id[index]}`;
            else if (baseId === 'ytCoverUniqueEjs') contentUrl = `${ytBaseURL}/${ytCoverUniqueEjs.id[index]}`;
            else if (baseId === 'ytLiveUniqueEjs') contentUrl = `${ytBaseURL}/${ytLiveUniqueEjs.id[index]}`;
        }
        // Handling Spotify items
        else if (baseId.startsWith('spotify')) {
            contentType = 'Spotify';
            if (baseId === 'spotifyTrackId') contentUrl = `${spotifyBaseURL}/track/${spotifyTrackId[index]}`;
            else if (baseId === 'spotifyUniqueTrackArtistId') contentUrl = `${spotifyBaseURL}/artist/${spotifyUniqueTrackArtistId[index]}`;
            else if (baseId === 'spotifyUniqueQueryArtistId') contentUrl = `${spotifyBaseURL}/artist/${spotifyUniqueQueryArtistId[index]}`;
            else if (baseId === 'spotifyUniqueAlbumId') contentUrl = `${spotifyBaseURL}/album/${spotifyUniqueAlbumId[index]}`;
            // The following line needs to be fixed.
            // else if (baseId === 'spotifyUniqueAlbumId') contentUrl = `${spotifyBaseURL}/artist/${spotifyUniqueAlbumArtist[index]}`;
        }

        // Update the nowPlayingContainer with the content
        if (contentUrl && contentType) {

            if (contentType === "YouTube") {
                $(".nowPlayingContainer").html(
                    "<h3 class='itemHeading' style='padding-top: 1rem; margin-top: 0rem; margin-bottom: 1rem;'>Now Playing</h3><div class='nowPlayingYt'></div>"
                )
                $(".nowPlayingYt").html(`<iframe width='560' height='315' src='${contentUrl}' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe>`);
            } else {
                $(".nowPlayingContainer").html(
                    "<h3 class='itemHeading' style='padding-top: 1rem; margin-top: 0rem; margin-bottom: 1rem;'>Now Playing</h3><div class='nowPlayingSpotify'></div>"
                )
                $(".nowPlayingSpotify").html(`<iframe src='${contentUrl}' width='300' height='380' frameborder='0' allowtransparency='true' allow='encrypted-media'></iframe>`);
            }

            $('html, body').animate({
                scrollTop: $(".nowPlayingContainer").offset().top
            }, 50);
        }
    });
});

/*
// Listen for form submission and prevent the default form submission
document.querySelector('.searchForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent traditional form submission
    const query = document.getElementById('queryId').value;
    fetchSearchResults(query);
});

var cache = {};

// Update global JavaScript variables with the data received from the server for the dynamically loaded content through the AJAX call.
function updateData(updatedData) {
    user = updatedData.user;
    ytQueryEjs = updatedData.ytQueryEjs;
    ytCoverUniqueEjs = updatedData.ytCoverUniqueEjs;
    ytLiveUniqueEjs = updatedData.ytLiveUniqueEjs;
    spotifyTrackId = updatedData.spotifyTrackId;
    spotifyUniqueTrackArtistId = updatedData.spotifyUniqueTrackArtistId;
    spotifyUniqueQueryArtistId = updatedData.spotifyUniqueQueryArtistId;
    spotifyUniqueAlbumId = updatedData.spotifyUniqueAlbumId;
    // spotifyUniqueAlbumArtist = updatedData.spotifyUniqueAlbumArtist; This variable is not used anywhere right now.
}

function fetchSearchResults(query) {
    // Construct a unique cache key based on query and user login state
    // This ensures separate cache entries for logged-in and not-logged-in states
    const cacheKey = `${query}-${user ? 'loggedIn' : 'notLoggedIn'}`;

    // Check if the data for this query and user state is cached
    if (cache[cacheKey]) {
        console.log('Using cached data for:', cacheKey);
        // Use the cached HTML to update the appropriate container
        const cachedContent = cache[cacheKey];

        // Update the cache with the new data
        updateData(cachedContent.updatedData);
        document.getElementById('searchResults').innerHTML = cachedContent.html;
        history.replaceState({ query: query }, "", `?queryValue=${encodeURIComponent(query)}`);
    } else {
        // Data not in cache, make the fetch request
        fetch(`/search?queryValue=${encodeURIComponent(query)}&ajax=true`)
            .then(response => response.json()) // Expecting text (HTML) response
            .then(data => {
                console.log('Fetching and caching data for:', cacheKey);

                // Update global JavaScript variables
                updateData(data.updatedData);

                // Insert the received HTML into the results section of the page
                document.getElementById('searchResults').innerHTML = data.html;

                // Update the cache with the new data
                cache[cacheKey] = {
                    html: data.html,
                    updatedData: data.updatedData
                };

                console.log(cache[cacheKey]);

                // Push a new state into the history
                history.pushState({query: query}, "", `?queryValue=${encodeURIComponent(query)}`);
            })
            .catch(error => console.error('Error:', error));
    }
}

// Listen for popstate event to handle back/forward navigation
window.addEventListener('popstate', function (event) {
    if (event.state && event.state.query) {
        // Use the cached data to update UI, fetching if necessary
        fetchSearchResults(event.state.query);
        console.log("Popstate event triggered.")
    }
});

 */
