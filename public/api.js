// Temp public
const apiKey = 'ze5s8nyeap7lt79hjpegww1b9g0eoh';
const clientId = '6epitxpes5udttl915kc8el5733olq';

// Debounce function to limit API calls while typing
function debounce(func, delay) {
let timeout;
return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
};
}

// Fetch games from IGDB API based on search query and selected companies
async function searchGames(query, selectedCompanies) {
    if (!query) {
        document.getElementById('game-results').innerHTML = '';
        return;
    }

    const apiUrlGames = 'https://cors-anywhere.herokuapp.com/https://api.igdb.com/v4/games';
    //const apiUrlCollection = 'https://cors-anywhere.herokuapp.com/https://api.igdb.com/v4/collections';

    let gameBody = `
        fields name, cover.url, summary, 
        franchises.name, 
        involved_companies.company.name, involved_companies.publisher, 
        first_release_date, 
        platforms.name, 
        game_modes.name, 
        genres.name;
        search "${query}";
        limit 10;
    `;

    // Add company filter if any company is selected
    if (selectedCompanies.length > 0) {
        gameBody += `where involved_companies.company = (${selectedCompanies.join(',')});`;
    }

    // Simple rate limiter
    const requestQueue = [];
    let isProcessingQueue = false;

    function rateLimitedFetch(url, options, delay = 200) {
        return new Promise((resolve, reject) => {
            requestQueue.push({ url, options, resolve, reject, delay });
            if (!isProcessingQueue) processQueue();
        });
    }

    // Process the queue
    async function processQueue() {
        if (requestQueue.length === 0) {
            isProcessingQueue = false;
            return;
        }

        isProcessingQueue = true;
        const { url, options, resolve, reject, delay } = requestQueue.shift();

        try {
            const response = await fetch(url, options);

            // If rate-limited, wait and requeue
            if (response.status === 429) {
                const retryAfter = parseInt(response.headers.get("Retry-After") || "10", 10);
                console.warn(`Rate limited! Retrying after ${retryAfter} seconds...`);
                setTimeout(() => {
                requestQueue.unshift({ url, options, resolve, reject, delay }); // requeue
                processQueue(); // keep processing
                }, retryAfter * 1000);
            } else {
                resolve(response);
                setTimeout(processQueue, delay);
            }
        } catch (error) {
            reject(error);
            setTimeout(processQueue, delay);
        }
    }
    try {
        // Fetch games first
        const gameResponse = await rateLimitedFetch(apiUrlGames, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'Client-ID': clientId
        },
        body: gameBody
        });

        const gamesData = await gameResponse.json();

        renderGameResults(gamesData);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Render search results
function renderGameResults(games) {
    const container = document.getElementById('game-results');

    // If no games, inform the user with an empty response
    if (games.length === 0) {
        container.innerHTML = '<p>No games found.</p>';
        return;
    }

    const list = document.getElementById('game-results');
    list.innerHTML = ''; // Clear previous results

    const pageSize = 15;
    const currentPage = 1; // later this can be dynamic
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Display visual for result games
    games.slice(startIndex, endIndex).forEach(game => {
        const contDiv = document.createElement('div');
        
        const listItem = document.createElement('li');
        listItem.textContent = game.name;
        if (game.cover) {
            listItem.id = `listGames-${game.id}`;
            const coverUrl = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.url.split('/').pop()}`;
            const coverImg = document.createElement('img');
            coverImg.src = coverUrl;
            coverImg.alt = game.name;
            coverImg.style.width = '100px';
            coverImg.style.marginBottom = '10px';
            listItem.prepend(coverImg);
        }

        list.appendChild(listItem);
        listItem.addEventListener("click", gameInfoPopup);
        
        function gameInfoPopup() {
            console.log("I do get called! :D");

            const ol = document.createElement('div');
            ol.id = 'olist-popover';
            ol.style.position = 'fixed';
            ol.style.top = '0';
            ol.style.left = '0';
            ol.style.width = '100%';
            ol.style.height = '100%';
            ol.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            ol.style.display = 'flex';
            ol.style.justifyContent = 'center';
            ol.style.alignItems = 'center';
            ol.style.zIndex = '1000';

            // Append to body instead of listItem for full-screen
            document.body.appendChild(ol);
            
            // Create popup container
            const popup = document.createElement('div');
            popup.id = 'popup';
            popup.style.backgroundColor = '#6f5749'; // brownish
            popup.style.borderRadius = '10px';
            popup.style.padding = '20px';
            popup.style.width = '90%';
            popup.style.maxWidth = '1000px';
            popup.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.5)';
            popup.style.color = 'white';
            popup.style.display = 'flex';
            popup.style.flexDirection = 'row';
            popup.style.gap = '30px';

            ol.appendChild(popup);

            // Create close button
            const closeButton = document.createElement('button');
            closeButton.textContent = 'X';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '10px';
            closeButton.style.right = '10px';
            closeButton.style.background = 'none';
            closeButton.style.border = 'none';
            closeButton.style.color = 'white';
            closeButton.style.fontSize = '24px';
            closeButton.style.cursor = 'pointer';

            closeButton.addEventListener('click', () => {
                ol.remove();
            });
            ol.appendChild(closeButton);

            // LEFT: Cover
            const leftSection = document.createElement('div');
            leftSection.style.flex = '0 0 125px';
            leftSection.style.textAlign = 'center';

            const coverImg = document.createElement('img');
            coverImg.src = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.url.split('/').pop()}`;;
            coverImg.alt = game.name;
            coverImg.style.width = '100%';
            coverImg.style.borderRadius = '10px';
            leftSection.appendChild(coverImg);


            popup.appendChild(leftSection);

            // RIGHT: Info Panel
            const rightSection = document.createElement('div');
            rightSection.style.flex = '1';
            rightSection.style.display = 'flex';
            rightSection.style.flexDirection = 'column';
            rightSection.style.gap = '20px';

            // Game Title
            const title = document.createElement('h2');
            title.textContent = game.name;
            title.style.fontSize = '24px';
            title.style.margin = '0';
            rightSection.appendChild(title);

            // Description container
            const descContainer = document.createElement('div');
            descContainer.style.marginBottom = '15px';
            descContainer.style.marginTop = '15px';

            // Create description element
            const desc = document.createElement('p');
            desc.style.margin = '0';
            desc.style.lineHeight = '1.5';
            desc.style.fontSize = '16px';

            // Truncate summary if needed
            const maxLength = 124;
            let isTruncated = false;
            let fullSummary = game.summary || 'No description available';

            if (fullSummary.length > maxLength) {
                isTruncated = true;
                desc.textContent = fullSummary.substring(0, maxLength) + '...';
            } else {
                desc.textContent = fullSummary;
            }

            descContainer.appendChild(desc);

            // Add "Read More" button if text was truncated
            if (isTruncated) {
                const readMoreBtn = document.createElement('button');
                readMoreBtn.textContent = 'Read More';
                readMoreBtn.style.background = 'none';
                readMoreBtn.style.border = 'none';
                readMoreBtn.style.color = '#c9b37e'; // Gold accent color
                readMoreBtn.style.padding = '0';
                readMoreBtn.style.marginTop = '5px';
                readMoreBtn.style.cursor = 'pointer';
                readMoreBtn.style.fontWeight = '600';
                readMoreBtn.style.fontSize = '0.9em';
                
                // Display Read More for full summary
                readMoreBtn.addEventListener('click', () => {
                    if (desc.textContent.length <= maxLength + 3) {
                        // Expand to full text
                        desc.textContent = fullSummary;
                        readMoreBtn.textContent = 'Read Less';
                    } else {
                        // Collapse back to truncated
                        desc.textContent = fullSummary.substring(0, maxLength) + '...';
                        readMoreBtn.textContent = 'Read More';
                    }
                });
                
                descContainer.appendChild(readMoreBtn);
            }

            rightSection.appendChild(descContainer);

            // Details grid
            const infoGrid = document.createElement('div');
            infoGrid.style.display = 'grid';
            infoGrid.style.gridTemplateColumns = '1fr 1fr';
            infoGrid.style.gap = '10px';
            infoGrid.style.backgroundColor = '#3d5a5c';
            infoGrid.style.padding = '15px';
            infoGrid.style.borderRadius = '10px';

            // Helper function to create info blocks
            const createInfoBlock = (title, value) => {
                const block = document.createElement('div');
                block.innerHTML = `
                    <strong style="display: block; color: #c9b37e; margin-bottom: 5px;">${title}</strong>
                    <span>${value || 'N/A'}</span>
                `;
                return block;
            };

            // Franchise/Series
            const franchise = game.franchises && game.franchises.length > 0 
                ? game.franchises[0].name 
                : 'Standalone Game';
            infoGrid.appendChild(createInfoBlock('Series', franchise));

            // Publisher
            const publisher = game.involved_companies 
                ? game.involved_companies
                    .filter(ic => ic.publisher)
                    .map(ic => ic.company.name)
                    .join(', ')
                : 'Unknown';
            infoGrid.appendChild(createInfoBlock('Publisher', publisher));

            // Release Date
            const releaseDate = game.first_release_date 
                ? new Date(game.first_release_date * 1000).toLocaleDateString() 
                : 'Unknown';
            infoGrid.appendChild(createInfoBlock('Release Date', releaseDate));

            // Platforms
            const platforms = game.platforms 
                ? game.platforms.map(p => p.name).join(', ') 
                : 'Unknown';
            infoGrid.appendChild(createInfoBlock('Platforms', platforms));

            // Game Modes
            const gameModes = game.game_modes 
                ? game.game_modes.map(gm => gm.name).join(', ') 
                : 'Unknown';
            infoGrid.appendChild(createInfoBlock('Game Modes', gameModes));

            // Genres
            const genres = game.genres 
                ? game.genres.map(g => g.name).join(', ') 
                : 'Unknown';
            infoGrid.appendChild(createInfoBlock('Genres', genres));

            rightSection.appendChild(infoGrid);

            // In your infoGrid section, modify the seriesBlock part:
           /* const seriesBlock = document.createElement('div');
            seriesBlock.innerHTML = `
            <strong style="display: block; color: #c9b37e; margin-bottom: 5px;">Series</strong>
            <span>"Standalone Game"}</span>
            `;

            // Replace the old seriesBlock code with this new version
            infoGrid.appendChild(seriesBlock);
            rightSection.appendChild(infoGrid);*/

            // Buttons //
            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.gap = '10px';

            const rateButton = document.createElement('button');
            rateButton.textContent = 'Rate Game';
            const addButton = document.createElement('button');
            addButton.textContent = 'Add to Library...';
            [rateButton, addButton].forEach(btn => {
                btn.style.backgroundColor = '#1f2b38';
                btn.style.color = 'white';
                btn.style.border = 'none';
                btn.style.padding = '10px 20px';
                btn.style.borderRadius = '5px';
                btn.style.cursor = 'pointer';
                btn.style.fontSize = '16px';
            });

            buttonContainer.appendChild(rateButton);
            buttonContainer.appendChild(addButton);
            rightSection.appendChild(buttonContainer);
            
            popup.appendChild(rightSection);
        };
    });
}


// Attach event listeners
document.getElementById('searchBtn').addEventListener('click', () => {
const query = document.getElementById('inputGameSearch').value.trim();
const selectedCompanies = Array.from(document.querySelectorAll('#checkbox-group input:checked'))
    .map(checkbox => checkbox.value);
searchGames(query, selectedCompanies);
});

document.getElementById('inputGameSearch').addEventListener(
'input',
debounce((event) => {
    const query = event.target.value.trim();
    const selectedCompanies = Array.from(document.querySelectorAll('#checkbox-group input:checked'))
    .map(checkbox => checkbox.value);
    searchGames(query, selectedCompanies);
}, 300) // Debounce delay of 300ms
);
