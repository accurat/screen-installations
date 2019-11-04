import os
from flask import Flask, request, redirect, jsonify
from dotenv import load_dotenv
from spotify import get_spotify_url, save_user, save_recent_songs
from database import initialize, retrieve_last_songs
from scheduler import start_scheduler

load_dotenv()


app = Flask(__name__)
initialize()


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
    songs = retrieve_last_songs()
    return jsonify(songs)


if __name__ == "__main__":
    start_scheduler()
    app.run(debug=False, host='0.0.0.0')
