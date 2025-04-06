Backend is written in Flask.

Frontend is a React + Vite application

Sensor can be an embedded microcontroller. Simulated using `sensor_data_generator.py`.


# Flow
A training session starts,
->
Client(Frontend) sends a SessionStart message.
->
Server allocates a session and reads the sensor messages.
->
Server streams the messages to the client (and persists them to its database.)
-> 
Client reads the messages and alerts if risk of injury or overexertion is identified.
->
Client shows analytics after the session ends.

## Sensor -> Backend Message

```
{
    timestamp: int,
    sensors: list[
        {
        id: int,
        output: float
        }
    ]
}
```

in json


## Backend -> Server Message

```
{
    timestamp: int,
    sensors: list[
        {
        id: int,
        output: float
        }
    ],
    session_id: int
}


Sensor -> Server messages are sent through plain http to accomodate for the microcontrollers.

Server <-> Client messages are handled through websockets, for efficient bidirectional communication.