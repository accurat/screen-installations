import threading
from time import sleep
from datetime import timedelta
from spotify import get_all_user_playing
from database import get_all_user_tokens, insert_readings

DELAY = 60


def get_currently_playing():
    all_users_tokens = get_all_user_tokens()
    [user_song_ids, song_features] = get_all_user_playing(all_users_tokens)
    insert_readings(user_song_ids, song_features)


def periodically_update_db():
    get_currently_playing()
    sleep(DELAY)
    periodically_update_db()


def start_scheduler():
    t = threading.Thread(target=periodically_update_db)
    t.start()
