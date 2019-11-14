import os
from flask import Flask, request, redirect, jsonify
from dotenv import load_dotenv
from analysis import build_model
from spotify import get_spotify_url, save_user, save_recent_songs
from database import initialize, retrieve_last_songs, retrieve_playing_songs, retrieve_all_songs
from scheduler import start_scheduler

load_dotenv()


app = Flask(__name__)
initialize()

model = None


@app.route("/")
def home():
    return "Wella!"


@app.route("/auth")
def authorize():
    return redirect(get_spotify_url("test"))


@app.route("/callback")
def callback():
    user_code = request.args.get("code")
    save_user(user_code)
    return redirect("/")


@app.route("/playing")
def playing():
    songs = retrieve_playing_songs()
    model(songs)
    return jsonify(songs)


@app.route("/last")
def last():
    songs = retrieve_last_songs()
    model(songs)
    return jsonify(songs)


if __name__ == "__main__":
    start_scheduler()
    all_songs = retrieve_all_songs()
    model = build_model(all_songs)
    app.run(debug=False, host='0.0.0.0', port=3000)
