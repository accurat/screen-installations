from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

USEFUL_KEYS = [
    "danceability",
    "energy",
    "key",
    "loudness",
    "speechiness",
    "acousticness",
    "instrumentalness",
    "liveness",
    "valence",
    "tempo",
]


def get_song_data(song):
    return [song.get(key) for key in USEFUL_KEYS]


def build_model(songs):
    rows = [get_song_data(song) for song in songs]
    scaler = StandardScaler()
    normalized = scaler.fit_transform(rows)
    # pca = PCA(n_components=len(USEFUL_KEYS))
    pca = PCA(n_components=2)
    pca.fit(normalized)

    def transform(new_songs):
        song_data = [get_song_data(song) for song in new_songs]
        normalized_song = scaler.transform(song_data, True)
        pca_values = pca.transform(normalized_song)
        for song, pca_coords in zip(new_songs, pca_values):
            song["x"] = pca_coords[0]
            song["y"] = pca_coords[1]
    return transform
