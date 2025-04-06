from flask import Blueprint, request, jsonify, current_app
from flask_socketio import emit # Import emit
from datetime import datetime
from . import db, socketio # Import db and socketio from the app package (__init__.py)
from .models import TrainingSession, SensorReading
import app as application_root # Import the root app module to access current_session_id

bp = Blueprint('api', __name__)

# --- Session Management ---

@bp.route('/sessions/start', methods=['POST'])
def start_session():
    if application_root.current_session_id is not None:
        # Check if the existing session is actually still marked active in DB
        existing_session = db.session.get(TrainingSession, application_root.current_session_id)
        if existing_session and existing_session.status == 'active':
             return jsonify({'message': 'Another session is already active'}), 409 # Conflict

    # Create new session
    new_session = TrainingSession(start_time=datetime.utcnow(), status='active')
    db.session.add(new_session)
    db.session.commit()
    application_root.current_session_id = new_session.id
    print(f"Started new session: {application_root.current_session_id}") # For debugging
    return jsonify({'session_id': new_session.id, 'start_time': new_session.start_time.isoformat()}), 201

@bp.route('/sessions/end', methods=['POST'])
def end_session():
    if application_root.current_session_id is None:
        return jsonify({'message': 'No active session to end'}), 404 # Not Found

    session_to_end = db.session.get(TrainingSession, application_root.current_session_id)
    if not session_to_end:
         # Should not happen if current_session_id is set, but good practice
         application_root.current_session_id = None
         return jsonify({'message': 'Active session not found in database'}), 404

    session_to_end.end_time = datetime.utcnow()
    session_to_end.status = 'completed'
    db.session.commit()
    print(f"Ended session: {application_root.current_session_id}") # For debugging
    application_root.current_session_id = None
    return jsonify({'message': f'Session {session_to_end.id} ended'}), 200

@bp.route('/sessions/active', methods=['GET'])
def get_active_session():
    if application_root.current_session_id is None:
        return jsonify({'active_session': None}), 200 # Or 404, depending on desired client handling

    active_session = db.session.get(TrainingSession, application_root.current_session_id)
    if not active_session or active_session.status != 'active':
        # Data inconsistency, clear the global ID
        application_root.current_session_id = None
        return jsonify({'active_session': None, 'message': 'Inconsistency found, cleared active session ID'}), 200

    return jsonify({
        'active_session': {
            'id': active_session.id,
            'start_time': active_session.start_time.isoformat(),
            'status': active_session.status
        }
    }), 200

# --- Sensor Data Handling ---

@bp.route('/sensor_data', methods=['POST'])
def receive_sensor_data():
    if application_root.current_session_id is None:
        return jsonify({'message': 'No active training session'}), 400 # Bad Request

    data = request.get_json()
    print(data)
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    # Basic validation (can be more robust)
    if 'timestamp' not in data or 'sensors' not in data or not isinstance(data['sensors'], list):
        return jsonify({'message': 'Invalid data format'}), 400

    session_id = application_root.current_session_id
    bodysuit_timestamp = data['timestamp']
    sensor_list = data['sensors']
    received_at = datetime.utcnow() # Capture time immediately

    readings_to_add = []
    for sensor in sensor_list:
        if 'id' not in sensor or 'output' not in sensor:
             print(f"Skipping invalid sensor entry: {sensor}") # Log invalid entries
             continue # Skip invalid sensor entries

        reading = SensorReading(
            session_id=session_id,
            timestamp=bodysuit_timestamp,
            sensor_id=sensor['id'],
            output=sensor['output'],
            received_time=received_at
        )
        readings_to_add.append(reading)

    if not readings_to_add:
         return jsonify({'message': 'No valid sensor readings found in the payload'}), 400

    try:
        db.session.add_all(readings_to_add)
        db.session.commit()
        # print(f"Persisted {len(readings_to_add)} readings for session {session_id}") # Debugging
    except Exception as e:
        db.session.rollback()
        print(f"Database error: {e}") # Log the error
        return jsonify({'message': 'Failed to save sensor data'}), 500

    # Forward data via SocketIO AFTER successful persistence
    try:
        # Add session_id to the data being emitted for client context
        data_to_emit = data.copy()
        data_to_emit['session_id'] = session_id
        socketio.emit('sensor_update', data_to_emit)
        # print(f"Emitted sensor_update for session {session_id}") # Debugging
    except Exception as e:
        print(f"SocketIO emit error: {e}") # Log the error
        # Don't fail the request if emit fails, data is already saved.

    return jsonify({'message': f'Received {len(readings_to_add)} sensor readings'}), 201


# --- SocketIO Event Handlers ---

@socketio.on('connect')
def handle_connect():
    """Handles client connection."""
    print(f'Client connected: {request.sid}')
    # Optionally, send back active session info if one exists
    if application_root.current_session_id:
        active_session = db.session.get(TrainingSession, application_root.current_session_id)
        if active_session and active_session.status == 'active':
            emit('session_started', {
                'session_id': active_session.id,
                'start_time': active_session.start_time.isoformat()
            }, room=request.sid) # Emit only to the connecting client


@socketio.on('disconnect')
def handle_disconnect():
    """Handles client disconnection."""
    print(f'Client disconnected: {request.sid}')


@socketio.on('session_start')
def handle_session_start(data):
    """Handles request to start a new session via SocketIO."""
    print(f"Received session_start event from {request.sid} with data: {data}")
    training_type = data.get('trainingType', 'unknown') # Get training type from client

    if application_root.current_session_id is not None:
        existing_session = db.session.get(TrainingSession, application_root.current_session_id)
        if existing_session and existing_session.status == 'active':
            print(f"Conflict: Session {application_root.current_session_id} is already active.")
            # Optionally emit an error back to the specific client
            emit('session_error', {'message': 'Another session is already active'})
            return # Prevent starting a new one

    # Create new session
    try:
        new_session = TrainingSession(start_time=datetime.utcnow(), status='active', training_type=training_type)
        db.session.add(new_session)
        db.session.commit()
        application_root.current_session_id = new_session.id
        print(f"Started new session via SocketIO: {application_root.current_session_id}")

        # Emit confirmation back to the specific client who started it
        emit('session_started', {
            'session_id': new_session.id,
            'start_time': new_session.start_time.isoformat()
        })
    except Exception as e:
        db.session.rollback()
        print(f"Database error starting session via SocketIO: {e}")
        emit('session_error', {'message': 'Failed to start session due to database error'})


@socketio.on('session_end')
def handle_session_end(data):
    """Handles request to end the current session via SocketIO."""
    print(f"Received session_end event from {request.sid} with data: {data}")
    # We use the globally tracked ID, ignoring any ID sent by client for now for simplicity
    session_id_to_end = application_root.current_session_id

    if session_id_to_end is None:
        print("No active session to end.")
        emit('session_error', {'message': 'No active session to end'})
        return

    session_to_end = db.session.get(TrainingSession, session_id_to_end)
    if not session_to_end:
        print(f"Error: Active session ID {session_id_to_end} not found in DB.")
        application_root.current_session_id = None # Clear inconsistent state
        emit('session_error', {'message': 'Active session not found in database'})
        return

    if session_to_end.status != 'active':
         print(f"Warning: Attempting to end session {session_id_to_end} which is not active (status: {session_to_end.status}).")
         # Decide if we should still end it or just clear the global ID
         # For now, let's proceed but clear the global ID regardless

    try:
        session_to_end.end_time = datetime.utcnow()
        session_to_end.status = 'completed'
        db.session.commit()
        print(f"Ended session via SocketIO: {session_id_to_end}")
        application_root.current_session_id = None

        # Emit confirmation back to the specific client who ended it
        emit('session_ended', {'session_id': session_id_to_end})
        # Optionally, broadcast to all clients if needed:
        # socketio.emit('session_ended', {'session_id': session_id_to_end})
    except Exception as e:
        db.session.rollback()
        print(f"Database error ending session via SocketIO: {e}")
        emit('session_error', {'message': 'Failed to end session due to database error'})
