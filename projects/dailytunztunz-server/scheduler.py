import threading
from time import sleep
from datetime import timedelta
from spotify import get_all_user_playing
from database import get_all_user_tokens, insert_readings

DELAY = 10


def get_currently_playing():
    all_users_tokens = get_all_user_tokens()
    songs = get_all_user_playing(all_users_tokens)
    insert_readings(songs)


def periodically_update_db():
    get_currently_playing()
    sleep(DELAY)
    periodically_update_db()


def start_scheduler():
    t = threading.Thread(target=periodically_update_db)
    t.start()
