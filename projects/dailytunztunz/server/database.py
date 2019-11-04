import sqlite3
import json
from datetime import datetime


def get_connection():
    return sqlite3.connect("database.db")


def with_connection(function):
    def wrapper(*args, **kwargs):
        connection = get_connection()
        cursor = connection.cursor()
        result = function(cursor, *args, **kwargs)
        connection.commit()
        connection.close()
        return result
    return wrapper


@with_connection
def initialize(cursor):
    cursor.execute(
        "CREATE TABLE IF NOT EXISTS users (id text, name text, token text)")
    cursor.execute(
        "CREATE TABLE IF NOT EXISTS songs (id text, json text)")
    cursor.execute(
        "CREATE TABLE IF NOT EXISTS user_song (user_id text, song_id text, iteration integer)")
    cursor.execute(
        "CREATE TABLE IF NOT EXISTS readings (iteration integer, time datetime)")


@with_connection
def insert_user(cursor, id, name, token):
    cursor.execute(
        "INSERT INTO users(id, name, token) VALUES(?, ?, ?)", [id, name, token]
    )


@with_connection
def insert_readings(cursor, user_song_ids, song_features):
    date = datetime.now()
    cursor.execute("SELECT MAX(iteration) FROM readings LIMIT 1")
    last_reading = cursor.fetchall()[0][0] or 0
    current_reading = last_reading + 1
    cursor.execute(
        "INSERT INTO readings(iteration, time) VALUES(?, ?)", [
            current_reading, date]
    )
    for song in song_features:
        cursor.execute(
            "SELECT COUNT(*) FROM songs WHERE id = ? LIMIT 1", [song["id"]])
        song_count = cursor.fetchall()[0][0]
        song_exists = song_count != 0
        if not song_exists:
            cursor.execute("INSERT INTO songs(id, json) VALUES (?, ?)", [
                           song["id"], json.dumps(song)])
    for [user_id, song_id] in user_song_ids:
        cursor.execute("INSERT INTO user_song(user_id, song_id, iteration) VALUES (?, ?, ?)", [
                       user_id, song_id, current_reading])


@with_connection
def get_all_user_tokens(cursor):
    cursor.execute("SELECT id, token FROM users")
    rows = [row for row in cursor.fetchall()]
    return rows


@with_connection
def retrieve_last_songs(cursor):
    cursor.execute("""SELECT
                   user_song.user_id,
                   songs.json
                   FROM
                   user_song
                   LEFT JOIN songs ON
                   songs.id=user_song.song_id
                   WHERE
                   iteration=(
                       SELECT
                       MAX(iteration)
                       FROM
                       readings)
                   """)
    rows = [[row[0], json.loads(row[1])] for row in cursor.fetchall()]
    return rows
