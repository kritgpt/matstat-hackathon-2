import numpy as np
import pandas as pd
import requests
import time
import json

# Configuration
fs = 10  # Sampling frequency (Hz)
duration_sec = 1 * 30  # Total duration in seconds (5 minutes)
t = np.linspace(0, duration_sec, int(duration_sec * fs))

# Baseline force (Newtons) and deformation (mm) for each muscle
baseline = {
    'L_ham': (90.0, 2.1),
    'R_ham': (90.0, 2.0),
    'L_quad': (90.0, 1.8),
    'R_quad': (90.0, 1.9),
}

def add_noise(signal, std):
    return signal + np.random.normal(0, std, size=signal.shape)

def normal_training(t, baseline, noise_frac=0.002):
    data = {}
    for muscle, (f0, _) in baseline.items():
        noise_std = f0 * noise_frac
        data[muscle] = add_noise(np.ones_like(t) * f0, noise_std)
    return data

def gradual_fatigue(t, baseline, fatigue_rate=0.0009, noise_frac=0.005):
    data = {}
    for muscle, (f0, _) in baseline.items():
        decay = np.exp(-fatigue_rate * t)
        noisy_force = add_noise(f0 * decay, f0 * noise_frac)
        data[muscle] = noisy_force
    return data

def sudden_asymmetry(t, baseline, target='R_ham', drop_frac=0.5, noise_frac=0.005):
    data = normal_training(t, baseline, noise_frac)
    idx_drop = len(t) // 2
    data[target][idx_drop:idx_drop+2] *= drop_frac
    return data

def derive_deformation(force_series, baseline_force, baseline_def, k=0.005):
    return baseline_def + k * (baseline_force - force_series)

def build_dataframe(t, force_data, baseline):
    df = pd.DataFrame({'time_sec': t})
    for muscle, force_series in force_data.items():
        f0, d0 = baseline[muscle]
        df['force_' + muscle] = force_series
        df[f'def_{muscle}'] = derive_deformation(force_series, f0, d0)
    return df

# {
#     timestamp: int,
#     sensors: list[
#         {
#             id: int,
#             output: float
#         }
#     ]
# }

muscle_dict = {
    'L_ham': 0,
    'R_ham': 1,
    'L_quad': 2,
    'R_quad': 3,
}
def df_to_json(df):
    json_data = []
    for _, row in df.iterrows():
        timestamp = row['time_sec']
        sensors = []
        print(row)
        for muscle in baseline.keys():
            print(muscle)
            sensors.append({
                'id': muscle_dict[muscle],
                'output': row[f'force_{muscle}']
            })
        json_data.append({
            'timestamp': int(timestamp * 1000),  # Convert to milliseconds
            'sensors': sensors
        })

    return json_data

# Main simulation
if __name__ == '__main__':
    scenarios = {
        # 'normal': normal_training,
        # 'fatigue': gradual_fatigue,
        'asymmetry': sudden_asymmetry,
    }

    for name, func in scenarios.items():
        force_data = func(t, baseline)
        df = build_dataframe(t, force_data, baseline)

        print(f"Streaming simulated {name} session to localhost:700")

        data_list = df_to_json(df)
        for data in data_list:
            # data['scenario'] = name
            try:
                requests.post("http://localhost:5000/api/sensor_data", json=data)
                print(data)
            except requests.exceptions.RequestException as e:
                print(f"Failed to send data: {e}")
            time.sleep(1.0 / fs)  # Simulate real-time sampling rate
