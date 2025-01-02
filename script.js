document.getElementById('fileInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const zip = new JSZip();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    try {
        const zipContent = await zip.loadAsync(file);
        const followersFile = zipContent.file("connections/followers_and_following/followers_1.json");
        const followingFile = zipContent.file("connections/followers_and_following/following.json");

        if (!followersFile || !followingFile) {
            resultsDiv.innerHTML = '<p>Error: Could not find the required JSON files in the zip.</p>';
            return;
        }

        const followersJSON = JSON.parse(await followersFile.async('string'));
        const followingJSON = JSON.parse(await followingFile.async('string')).relationships_following;

        const followers = new Set(followersJSON.map(f => f.string_list_data[0].value));
        const following = new Set(followingJSON.map(f => f.string_list_data[0].value));

        const notFollowingBack = Array.from(following).filter(user => !followers.has(user));
        const notFollowedBack = Array.from(followers).filter(user => !following.has(user));

        resultsDiv.innerHTML = `
        <div class="numbers">
            <h3>Stats</h3>
            <p><strong>People not following you back:</strong> ${notFollowingBack.length}</p>
            <p><strong>People you don't follow back:</strong> ${notFollowedBack.length}</p>
        </div>
        <div class="result">
            <h3>Details</h3>
            <div class="details">
                <div>
                    <h4>Not following you back:</h4>
                    <ul>${notFollowingBack.map(user => `<li>${user}</li>`).join('')}</ul>
                </div>
                <div>
                    <h4>You don't follow back:</h4>
                    <ul>${notFollowedBack.map(user => `<li>${user}</li>`).join('')}</ul>
                </div>
            </div>
        </div>
    `;
    } catch (err) {
        resultsDiv.innerHTML = `<p>Error: ${err.message}</p>`;
    }
});
