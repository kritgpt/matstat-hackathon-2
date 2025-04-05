from app import create_app, socketio, db # Import create_app, socketio, and db
from app.models import TrainingSession, SensorReading # Import models for shell context if needed

# Create the Flask app instance using the factory
app = create_app()

# Optional: Add context for 'flask shell' command
@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'TrainingSession': TrainingSession, 'SensorReading': SensorReading}

if __name__ == '__main__':
    print("Starting Flask-SocketIO server...")
    # Use socketio.run to correctly handle WebSocket connections
    # host='0.0.0.0' makes it accessible on the network
    # debug=True enables auto-reloading and debugger
    # allow_unsafe_werkzeug=True is sometimes needed for newer Werkzeug versions with SocketIO debug mode
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, use_reloader=True, allow_unsafe_werkzeug=True)
