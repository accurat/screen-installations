from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
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
    model = PCA(n_components=len(USEFUL_KEYS))
    model.fit(normalized)

    def transform(new_songs):
        song_data = [get_song_data(song) for song in new_songs]
        normalized_song = scaler.transform(song_data, True)
        model_values = model.transform(normalized_song)
        for song, model_coords in zip(new_songs, model_values):
            song["x"] = model_coords[0]
            song["y"] = model_coords[1]
    return transform
