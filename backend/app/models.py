from datetime import datetime
from . import db # Assuming db is initialized in __init__.py

class TrainingSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    start_time = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    end_time = db.Column(db.DateTime, index=True, nullable=True)
    status = db.Column(db.String(20), default='active', index=True) # e.g., 'active', 'completed'
    readings = db.relationship('SensorReading', backref='session', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<TrainingSession {self.id} started {self.start_time}>'

class SensorReading(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('training_session.id'), nullable=False, index=True)
    timestamp = db.Column(db.Integer, nullable=False, index=True) # Timestamp from the bodysuit
    sensor_id = db.Column(db.Integer, nullable=False)
    output = db.Column(db.Float, nullable=False)
    received_time = db.Column(db.DateTime, default=datetime.utcnow) # Timestamp when backend received it

    def __repr__(self):
        return f'<SensorReading {self.id} for Session {self.session_id} at {self.timestamp}>'
