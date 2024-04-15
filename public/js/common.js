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

// Listen for form submission and prevent the default form submission when required.
// results.js or a new JS file for index.ejs if needed
document.querySelectorAll('.searchForm').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = this.querySelector('.searchInput').value;
        fetchSearchResults(query);
    });
});

function fetchSearchResults(query) {
    const cacheKey = `search-${query}-${user ? 'loggedIn' : 'notLoggedIn'}`;

    let cachedResults = localStorage.getItem(cacheKey);
    if (cachedResults) {
        cachedResults = JSON.parse(cachedResults);
        console.log('Using client-side cached data for:', cacheKey);
        updateData(cachedResults.updatedData);
        document.getElementById('searchResults').innerHTML = cachedResults.html;
    } else {
        console.log('Fetching data from server for:', cacheKey);
        fetch(`/search?queryValue=${encodeURIComponent(query)}&ajax=true`)
            .then(response => response.json())
            .then(data => {
                updateData(data.updatedData);
                document.getElementById('searchResults').innerHTML = data.html;

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

