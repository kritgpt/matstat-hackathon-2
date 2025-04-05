import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
basedir = os.path.abspath(os.path.dirname(__file__))
dotenv_path = os.path.join(basedir, '..', '.env') # Look for .env in the parent 'backend' directory
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-hard-to-guess-string'
    # Define the SQLite database file path relative to the 'backend' directory
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, '..', 'database.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Optional: Add any other configuration variables here
