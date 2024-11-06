//FIREBASE_TOKEN = 1//06SKAfH_LCTMMCgYIARAAGAYSNwF-L9IrUb4hsebITDTbmkexMLUM9toITx_yUo9oUs8eMv_ijisbUatLsGWtS7FY4vJo2zb0qFg
async function fetchGameByName() {
    const gameName = document.getElementById('gameName').value;

    // Step 1: Get the access token
    try {
        const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token?client_id=22f80p3n02dqsog5amvtefpcuc9elr&client_secret=gpgnzckluwi05693yhnnmjtzndd39p&grant_type=client_credentials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        if (!accessToken) {
            document.getElementById('response').innerText = 'Failed to retrieve access token.';
            return;
        }

        // Step 2: Use the access token to search for the game by name
        const gameResponse = await fetch(`https://api.twitch.tv/helix/search/categories?query=${encodeURIComponent(gameName)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Client-Id': clientId
            }
        });

        const gameData = await gameResponse.json();

        if (gameData.data && gameData.data.length > 0) {
            const gameInfo = gameData.data[0];
            const resultText = `Game Name: ${gameInfo.name}\nID: ${gameInfo.id}`;
            document.getElementById('response').innerText = resultText;
        } else {
            document.getElementById('response').innerText = 'No game found with the given name.';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('response').innerText = 'Error: ' + error;
    }
}

