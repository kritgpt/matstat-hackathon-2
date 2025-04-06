

## System Components 

- ***Sensor software***: A lightweight program running on the bodysuit to collect, arrange and send sensor values to the backend -> currently simulated with 'matstat-hackathon-2/sensor_data_generator'.
- ***Backend server***: Collects and stores data sent by sensor program, repackages it, and streams it to frontend app.
- ***Frontend app***: Serves as the user interface with session planning, informs user about sensor placement, real-time statistics using streamed data from server and gives detailed analytics at the end.

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
    forceL: float,
    forceR: float,
}
