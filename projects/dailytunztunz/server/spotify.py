import os
import urllib.parse
import requests
import pdb
import json
from database import insert_user
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URL = os.getenv("REDIRECT_URL")
SCOPES = os.getenv("SCOPES")


def get_spotify_url(state):
    return f"https://accounts.spotify.com/authorize?response_type=code&client_id={CLIENT_ID}&scope={urllib.parse.quote(SCOPES)}&redirect_uri={urllib.parse.quote(REDIRECT_URL)}&state={state}"


def get_user_token(user_code):
    url = "https://accounts.spotify.com/api/token"
    data = {
        "grant_type": "authorization_code",
        "code": user_code,
        "redirect_uri": REDIRECT_URL,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }
    response = requests.post(url, data=data)
    response_body = response.json()
    return response_body["access_token"], response_body["refresh_token"]


def get_user_fresh_token(refresh_token):
    url = "https://accounts.spotify.com/api/token"
    data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }
    response = requests.post(url, data=data)
    response_body = response.json()
    return response_body["access_token"]


def get_app_token():
    url = "https://accounts.spotify.com/api/token"
    data = {
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }
    response = requests.post(url, data=data)
    response_body = response.json()
    return response_body["access_token"]


def get_user_data(user_token):
    url = "https://api.spotify.com/v1/me"
    headers = {"Authorization": f"Bearer {user_token}"}
    response = requests.get(url, headers=headers)
    return response.json()


def save_user(user_code):
    user_token, refresh_token = get_user_token(user_code)
    user_data = get_user_data(user_token)
    user_id = user_data["id"]
    user_name = user_data["display_name"]
    insert_user(user_id, user_name, refresh_token)


def get_user_currently_playing(user_token):
    url = "https://api.spotify.com/v1/me/player/currently-playing"
    user_token = get_user_fresh_token(user_token)
    headers = {"Authorization": f"Bearer {user_token}"}
    response = requests.get(url, headers=headers)
    try:
        data = response.json()
        song_data = {
            'id': data["item"]["id"],
            "progress_ms": data["progress_ms"],
            "duration_ms": data["item"]["duration_ms"]
        }
    except:
        song_data = None
    return song_data


def get_user_recent_songs(user_token):
    url = "https://api.spotify.com/v1/me/player/recently-played?limit=50"
    user_token = get_user_fresh_token(user_token)
    headers = {"Authorization": f"Bearer {user_token}"}
    response = requests.get(url, headers=headers)
    try:
        data = response.json()["items"]
        return data
    except:
        return None


def save_recent_songs(user_token):
    songs = get_user_recent_songs(user_token)
    song_ids = [song["track"]["id"] for song in songs]
    features = get_features(song_ids)
    with open(f"user_{user_token}.json", "w") as o:
        json.dump(features, o)
    return features


def get_features(user_song_ids):
    if len(user_song_ids) == 0:
        return []
    song_ids = [row["song_id"] for row in user_song_ids]
    joined_ids = ",".join(song_ids)
    url = f"https://api.spotify.com/v1/audio-features?ids={joined_ids}"
    token = get_app_token()
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    return response.json()["audio_features"]


def get_all_user_playing(users):
    user_song_ids = []
    if len(users) == 0:
        return [[], []]
    for user in users:
        [user_id, user_token] = user
        song_data = get_user_currently_playing(user_token)
        if song_data is not None:
            item = {
                "song_id": song_data["id"],
                "progress_ms": song_data["progress_ms"],
                "duration_ms": song_data["duration_ms"],
                "user_id": user_id
            }
            print(song_data["id"])
            user_song_ids.append(item)
    features = get_features(user_song_ids)
    return [user_song_ids, features]
