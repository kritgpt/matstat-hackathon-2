import os
from flask import Flask, g
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_socketio import SocketIO
from .config import Config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
# Initialize SocketIO with async_mode='eventlet' as installed
socketio = SocketIO(cors_allowed_origins="*") # Allow all origins for now

# Simple in-memory tracking for the single active session ID
# WARNING: This is not robust for production or multiple workers.
# A database flag or a more sophisticated state management might be needed later.
current_session_id = None

def create_app(config_class=Config):
    """Application factory function"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Flask extensions here
    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app, async_mode='eventlet') # Specify async_mode

    # Register blueprints here
    from .routes import bp as api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    # Import models here to ensure they are registered with SQLAlchemy
    # before database operations like migrations are run.
    from . import models

    # Simple context processor to make current_session_id available if needed
    # Although direct access within routes might be more straightforward here.
    @app.before_request
    def before_request():
        # Using g might be overkill if routes access the module variable directly
        # g.current_session_id = current_session_id
        pass

    # Example SocketIO event (can be moved to events.py later if complex)
    @socketio.on('connect')
    def handle_connect():
        print('Client connected')

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')

    return app
