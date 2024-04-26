// Update global JavaScript variables with the data received from the server for the dynamically loaded content through the AJAX call.
function updateData(updatedData) {
    console.log("Updating data.");
    isLoggedIn = updatedData.isLoggedIn;
    ytQueryEjs = updatedData.ytQueryEjs;
    ytCoverUniqueEjs = updatedData.ytCoverUniqueEjs;
    ytLiveUniqueEjs = updatedData.ytLiveUniqueEjs;
    spotifyTrackId = updatedData.spotifyTrackId;
    spotifyUniqueTrackArtistId = updatedData.spotifyUniqueTrackArtistId;
    spotifyUniqueQueryArtistId = updatedData.spotifyUniqueQueryArtistId;
    spotifyUniqueAlbumId = updatedData.spotifyUniqueAlbumId;
    // spotifyUniqueAlbumArtist = updatedData.spotifyUniqueAlbumArtist; This variable is not used anywhere right now.
}

// Listen for form submission and prevent the default form submission when required.
// results.js or a new JS file for home.ejs if needed
document.querySelectorAll('.searchForm').forEach(form => {
    form.addEventListener('submit', function(e) {
        console.log("Form submitted");
        e.preventDefault();
        fetchSearchResults(this.querySelector('.searchInput').value);
    });
});

function fetchSearchResults(query) {
    const cacheKey = `search-${query}-${isLoggedIn ? 'loggedIn' : 'notLoggedIn'}`;
    let cachedResults = localStorage.getItem(cacheKey);
    let searchResultsElement = document.getElementById('searchResults');

    // Does the data exist in the client-side cache?
    if (cachedResults) {
        console.log('Using client-side cached data for:', cacheKey);
        cachedResults = JSON.parse(cachedResults);

        // Are we on the results.ejs page?
        if (searchResultsElement) {
            console.log("On results.ejs page.");
            searchResultsElement.innerHTML = cachedResults.html;
        } else {
            console.log("Not on results.ejs page.");
            fetch(`/search?queryValue=${encodeURIComponent(query)}&ajax=true&source=home`)
                .then(response => response.text())
                .then(data => {
                    console.log("Data fetched");
                    console.log(data);
                    document.documentElement.innerHTML = data;
                })
                .catch(error => console.error('Error:', error));
        }

        // Update the URL in the address bar
        history.pushState({query: query}, "", `/search?queryValue=${encodeURIComponent(query)}`);
    } else {
        console.log('Fetching data from server for:', cacheKey);
        fetch(`/search?queryValue=${encodeURIComponent(query)}&ajax=true`)
            .then(response => response.json())
            .then(data => {
                updateData(data);
                // Are we on the results.ejs page?
                if (searchResultsElement) {
                    searchResultsElement.innerHTML = data.html;
                } else {

                }

                // Cache data client-side
                localStorage.setItem(cacheKey, JSON.stringify({
                    html: data.html,
                    updatedData: data.updatedData
                }));

                history.pushState({query: query}, "", `?queryValue=${encodeURIComponent(query)}`);
            })
            .catch(error => console.error('Error:', error));
    }
}

window.addEventListener('popstate', function(event) {
    if (event.state && event.state.query) {
        fetchSearchResults(event.state.query);
    }
});

