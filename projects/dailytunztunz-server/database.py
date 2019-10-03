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
        "CREATE TABLE IF NOT EXISTS songs (user_id text, json text, iteration integer)")
    cursor.execute(
        "CREATE TABLE IF NOT EXISTS readings (iteration integer, time datetime)")


@with_connection
def insert_user(cursor, id, name, token):
    cursor.execute(
        "INSERT INTO users(id, name, token) VALUES(?, ?, ?)", [id, name, token]
    )


@with_connection
def insert_readings(cursor, songs):
    date = datetime.now()
    cursor.execute("SELECT iteration FROM readings")
    all_readings = [row[0] for row in cursor.fetchall()]
    if len(all_readings) == 0:
        last_reading = 0
    else:
        last_reading = sorted(all_readings)[-1]
    current_reading = last_reading + 1
    cursor.execute(
        "INSERT INTO readings(iteration, time) VALUES(?, ?)", [
            current_reading, date]
    )
    for song in songs:
        cursor.execute("INSERT INTO songs(json, iteration) VALUES (?, ?)", [
            json.dumps(song), current_reading])


@with_connection
def get_all_user_tokens(cursor):
    cursor.execute("SELECT token FROM users")
    rows = [row[0] for row in cursor.fetchall()]
    return rows


@with_connection
def retrieve_last_songs(cursor):
    cursor.execute(
        "SELECT json FROM songs WHERE iteration = (SELECT MAX(iteration) FROM readings)")
    rows = [json.loads(row[0]) for row in cursor.fetchall()]
    return rows
