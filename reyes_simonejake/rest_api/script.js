const apiUrl = 'https://www.stackovercash.site/exercise_16/reyes/api.php';
window.onload = function () {
    loadAnime();
};

// Function to add a new anime
function addAnime() {
    const anime = {
        title: document.getElementById('anime_title').value,
        genre: document.getElementById('anime_genre').value,
        episode: document.getElementById('anime_episodes').value,
        studio: document.getElementById('anime_studio').value,
        rating: document.getElementById('anime_rating').value,
    };

    // Validate input using truthy check
    if (!anime.title || !anime.genre || !anime.episode ||
          !anime.studio || !anime.rating) {
        alert('Please fill all fields');
        return;
    }
    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(anime),
    })
        .then((res) => res.json())
        .then((data) => {
            loadAnime();
            document.getElementById('anime_form').reset();
        })
        .catch((error) => {
            console.error('Error adding anime:', error);
            alert('Failed to add anime. Please try again.');
        });
}

// Function to load all anime from the database
function loadAnime() {
    fetch(apiUrl)
        .then((res) => res.json())
        .then((data) => {
            const list = document.getElementById('anime_list');
            list.innerHTML = '';
            if (!data || data.length === 0) {
                const emptyDiv = document.createElement('div');
                emptyDiv.className = 'empty-list';
                emptyDiv.textContent = 'No anime added yet.';
                list.appendChild(emptyDiv);
                return;
            }

            data.forEach((anime) => {
                const li = document.createElement('li');
                li.className = 'anime-card';

                const detailsDiv = document.createElement('div');
                detailsDiv.className = 'anime-details';

                const titleDiv = document.createElement('div');
                titleDiv.className = 'anime-title';
                titleDiv.textContent = anime.title;

                const infoDiv = document.createElement('div');
                infoDiv.className = 'anime-info';
                infoDiv.textContent =
                    `Genre: ${anime.genre} | Episodes: ${anime.episode} | ` +
                    `Studio: ${anime.studio}`;

                const ratingDiv = document.createElement('div');
                ratingDiv.className = 'anime-rating';
                ratingDiv.textContent = `Rating: ${anime.rating}/10`;

                detailsDiv.appendChild(titleDiv);
                detailsDiv.appendChild(infoDiv);
                detailsDiv.appendChild(ratingDiv);

                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'anime-actions';

                const editButton = document.createElement('button');
                editButton.className = 'update-btn';
                editButton.textContent = 'Edit';
                editButton.onclick = function () {
                    openEditModal(anime.id);
                };

                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-btn';
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = function () {
                    deleteAnime(anime.id);
                };

                actionsDiv.appendChild(editButton);
                actionsDiv.appendChild(deleteButton);

                li.appendChild(detailsDiv);
                li.appendChild(actionsDiv);

                list.appendChild(li);
            });
        })
        .catch((error) => {
            console.error('Error loading anime list:', error);
            const list = document.getElementById('anime_list');
            list.innerHTML = '';

            const errorDiv = document.createElement('div');
            errorDiv.className = 'empty-list';
            errorDiv.textContent = 'Please refresh the page.';
            list.appendChild(errorDiv);
        });
}

function openEditModal(id) {
    if (!id) return; 
    fetch(`${apiUrl}?id=${id}`)
        .then((res) => res.json())
        .then((animeList) => {
            const anime = animeList.find((animeItem) => animeItem.id == id);

            if (!anime) {
                alert('Anime not found');
                return;
            }
            document.getElementById('edit_id').value = anime.id;
            document.getElementById('edit_title').value = anime.title;
            document.getElementById('edit_genre').value = anime.genre;
            document.getElementById('edit_episodes').value = anime.episode;
            document.getElementById('edit_studio').value = anime.studio;
            document.getElementById('edit_rating').value = anime.rating;
            document.getElementById('edit_modal').classList.add('show-modal');
        })
        .catch((error) => {
            console.error('Error fetching anime details:', error);
            alert('Failed to get anime details. Please try again.');
        });
}

function closeEditModal() {
    document.getElementById('edit_modal').classList.remove('show-modal');
}

function saveEditChanges() {
    const updatedAnime = {
        id: document.getElementById('edit_id').value,
        title: document.getElementById('edit_title').value,
        genre: document.getElementById('edit_genre').value,
        episode: document.getElementById('edit_episodes').value,
        studio: document.getElementById('edit_studio').value,
        rating: document.getElementById('edit_rating').value,
    };
    if (!updatedAnime.title || !updatedAnime.genre || !updatedAnime.episode ||
          !updatedAnime.studio || !updatedAnime.rating) {
        alert('Please fill all fields');
        return;
    }

    fetch(apiUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAnime),
    })
        .then((res) => res.json())
        .then((data) => {
            closeEditModal();
            loadAnime();
        })
        .catch((error) => {
            console.error('Error updating anime:', error);
            alert('Failed to update anime. Please try again.');
        });
}

function deleteAnime(id) {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this anime?')) {
        return; 
    }
    fetch(apiUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id }),
    })
        .then((res) => res.json())
        .then((data) => {
            loadAnime();
        })
        .catch((error) => {
            console.error('Error deleting anime:', error);
            alert('Failed to delete anime. Please try again.');
        });
}