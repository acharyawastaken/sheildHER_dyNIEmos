"""
Feature Engineering — Audio Features
Extracts safety-relevant features from audio signals for distress detection.

Features extracted:
- MFCC (Mel-Frequency Cepstral Coefficients) — voice/sound fingerprint
- Spectral Centroid — brightness of sound
- Spectral Rolloff — frequency distribution shape
- Zero Crossing Rate — noisiness / percussive quality
- RMS Energy — loudness
- Pitch (F0) — fundamental frequency
- Spectral Bandwidth — spread of frequencies
- Chroma Features — tonal content
- Tempo — rhythm (screams have irregular tempo)

Privacy: All processing happens on-device. Raw audio is NEVER stored or transmitted.
"""

import numpy as np
from typing import Optional, Tuple


def extract_audio_features(
    audio_signal: np.ndarray,
    sample_rate: int = 22050,
    n_mfcc: int = 13,
    n_fft: int = 2048,
    hop_length: int = 512,
) -> dict:
    """
    Extract all audio features from a raw audio signal.

    Args:
        audio_signal: 1D numpy array of audio samples
        sample_rate: Sample rate in Hz (default 22050)
        n_mfcc: Number of MFCC coefficients to extract
        n_fft: FFT window size
        hop_length: Hop length for STFT

    Returns:
        Dict with all extracted features (each is a single float — aggregated)
    """
    try:
        import librosa
    except ImportError:
        raise ImportError("librosa is required: pip install librosa")

    features = {}

    # Ensure audio is float and 1D
    if audio_signal.ndim > 1:
        audio_signal = audio_signal.mean(axis=1)
    audio_signal = audio_signal.astype(np.float32)

    # Normalize
    max_val = np.abs(audio_signal).max()
    if max_val > 0:
        audio_signal = audio_signal / max_val

    # ─── 1. MFCC (Mel-Frequency Cepstral Coefficients) ───
    # The most important feature for voice/sound classification
    mfccs = librosa.feature.mfcc(
        y=audio_signal, sr=sample_rate, n_mfcc=n_mfcc,
        n_fft=n_fft, hop_length=hop_length
    )
    # Aggregate across time: mean and std of each coefficient
    for i in range(n_mfcc):
        features[f"mfcc_{i}_mean"] = float(np.mean(mfccs[i]))
        features[f"mfcc_{i}_std"] = float(np.std(mfccs[i]))

    # ─── 2. Delta MFCC (velocity of MFCC changes) ───
    # Captures how rapidly the sound is changing — screams change fast
    delta_mfccs = librosa.feature.delta(mfccs)
    for i in range(n_mfcc):
        features[f"delta_mfcc_{i}_mean"] = float(np.mean(delta_mfccs[i]))

    # ─── 3. Spectral Centroid ───
    # "Center of mass" of the spectrum — screams have high centroid
    spectral_centroid = librosa.feature.spectral_centroid(
        y=audio_signal, sr=sample_rate, n_fft=n_fft, hop_length=hop_length
    )[0]
    features["spectral_centroid_mean"] = float(np.mean(spectral_centroid))
    features["spectral_centroid_std"] = float(np.std(spectral_centroid))

    # ─── 4. Spectral Rolloff ───
    # Frequency below which 85% of energy is contained
    spectral_rolloff = librosa.feature.spectral_rolloff(
        y=audio_signal, sr=sample_rate, n_fft=n_fft, hop_length=hop_length
    )[0]
    features["spectral_rolloff_mean"] = float(np.mean(spectral_rolloff))
    features["spectral_rolloff_std"] = float(np.std(spectral_rolloff))

    # ─── 5. Zero Crossing Rate ───
    # How often the signal crosses zero — high for screams/noise
    zcr = librosa.feature.zero_crossing_rate(
        y=audio_signal, frame_length=n_fft, hop_length=hop_length
    )[0]
    features["zcr_mean"] = float(np.mean(zcr))
    features["zcr_std"] = float(np.std(zcr))

    # ─── 6. RMS Energy ───
    # Loudness — distress sounds are typically louder
    rms = librosa.feature.rms(
        y=audio_signal, frame_length=n_fft, hop_length=hop_length
    )[0]
    features["rms_mean"] = float(np.mean(rms))
    features["rms_std"] = float(np.std(rms))
    features["rms_max"] = float(np.max(rms))

    # ─── 7. Spectral Bandwidth ───
    # Spread of the spectrum — wider for screams
    spectral_bw = librosa.feature.spectral_bandwidth(
        y=audio_signal, sr=sample_rate, n_fft=n_fft, hop_length=hop_length
    )[0]
    features["spectral_bandwidth_mean"] = float(np.mean(spectral_bw))
    features["spectral_bandwidth_std"] = float(np.std(spectral_bw))

    # ─── 8. Spectral Contrast ───
    # Difference between peaks and valleys in spectrum
    spectral_contrast = librosa.feature.spectral_contrast(
        y=audio_signal, sr=sample_rate, n_fft=n_fft, hop_length=hop_length
    )
    for i in range(spectral_contrast.shape[0]):
        features[f"spectral_contrast_{i}_mean"] = float(np.mean(spectral_contrast[i]))

    # ─── 9. Chroma Features ───
    # Tonal content — distress sounds have distinct tonal patterns
    chroma = librosa.feature.chroma_stft(
        y=audio_signal, sr=sample_rate, n_fft=n_fft, hop_length=hop_length
    )
    features["chroma_mean"] = float(np.mean(chroma))
    features["chroma_std"] = float(np.std(chroma))

    # ─── 10. Tonnetz (Tonal Centroid) ───
    tonnetz = librosa.feature.tonnetz(
        y=librosa.effects.harmonic(audio_signal), sr=sample_rate
    )
    features["tonnetz_mean"] = float(np.mean(tonnetz))
    features["tonnetz_std"] = float(np.std(tonnetz))

    # ─── 11. Pitch / F0 Estimation ───
    # Fundamental frequency — screams have high, unstable pitch
    pitches, magnitudes = librosa.piptrack(
        y=audio_signal, sr=sample_rate, n_fft=n_fft, hop_length=hop_length
    )
    # Get the most prominent pitch per frame
    pitch_values = []
    for t in range(pitches.shape[1]):
        idx = magnitudes[:, t].argmax()
        pitch = pitches[idx, t]
        if pitch > 0:
            pitch_values.append(pitch)
    if pitch_values:
        features["pitch_mean"] = float(np.mean(pitch_values))
        features["pitch_std"] = float(np.std(pitch_values))
        features["pitch_max"] = float(np.max(pitch_values))
        features["pitch_range"] = float(np.max(pitch_values) - np.min(pitch_values))
    else:
        features["pitch_mean"] = 0.0
        features["pitch_std"] = 0.0
        features["pitch_max"] = 0.0
        features["pitch_range"] = 0.0

    # ─── 12. Tempo ───
    tempo, _ = librosa.beat.beat_track(y=audio_signal, sr=sample_rate)
    features["tempo"] = float(tempo) if np.isscalar(tempo) else float(tempo[0])

    # ─── 13. Duration ───
    features["duration_s"] = float(len(audio_signal) / sample_rate)

    # ─── 14. Energy Envelope Statistics ───
    # How energy changes over time — sudden bursts indicate distress
    if len(rms) > 1:
        energy_diff = np.diff(rms)
        features["energy_attack_mean"] = float(np.mean(np.abs(energy_diff)))
        features["energy_attack_max"] = float(np.max(np.abs(energy_diff)))
    else:
        features["energy_attack_mean"] = 0.0
        features["energy_attack_max"] = 0.0

    return features


def get_feature_names(n_mfcc: int = 13) -> list:
    """
    Get the ordered list of all feature names produced by extract_audio_features.
    Useful for creating consistent DataFrames.
    """
    names = []

    # MFCCs (mean + std)
    for i in range(n_mfcc):
        names.extend([f"mfcc_{i}_mean", f"mfcc_{i}_std"])

    # Delta MFCCs (mean only)
    for i in range(n_mfcc):
        names.append(f"delta_mfcc_{i}_mean")

    # Spectral features
    names.extend([
        "spectral_centroid_mean", "spectral_centroid_std",
        "spectral_rolloff_mean", "spectral_rolloff_std",
        "zcr_mean", "zcr_std",
        "rms_mean", "rms_std", "rms_max",
        "spectral_bandwidth_mean", "spectral_bandwidth_std",
    ])

    # Spectral contrast (7 bands)
    for i in range(7):
        names.append(f"spectral_contrast_{i}_mean")

    # Chroma & Tonnetz
    names.extend([
        "chroma_mean", "chroma_std",
        "tonnetz_mean", "tonnetz_std",
    ])

    # Pitch
    names.extend(["pitch_mean", "pitch_std", "pitch_max", "pitch_range"])

    # Tempo, Duration, Energy attacks
    names.extend([
        "tempo", "duration_s",
        "energy_attack_mean", "energy_attack_max",
    ])

    return names


def synthesize_audio_sample(
    category: str,
    duration_s: float = 2.0,
    sample_rate: int = 22050,
) -> np.ndarray:
    """
    Generate a synthetic audio sample for a given category.
    Used for training when real datasets aren't available.

    Categories:
        - scream: High-pitched, loud, irregular
        - shout_help: Mid-high pitch, patterned
        - glass_breaking: Broadband impulse noise
        - dog_bark: Mid-frequency periodic bursts
        - traffic: Low-frequency continuous noise
        - speech_normal: Mid-frequency, regular
        - silence: Very low energy background
        - footsteps: Periodic low-mid impulses
        - music: Harmonic, regular
        - crowd: Multi-source mid-frequency noise

    Returns:
        1D numpy array of audio samples
    """
    np.random.seed(None)  # Fresh seed each call
    n_samples = int(duration_s * sample_rate)
    t = np.linspace(0, duration_s, n_samples, dtype=np.float32)

    if category == "scream":
        # High pitch (800-3000 Hz), loud, with vibrato
        freq = np.random.uniform(800, 3000)
        vibrato = np.sin(2 * np.pi * np.random.uniform(4, 12) * t) * np.random.uniform(50, 200)
        signal = np.sin(2 * np.pi * (freq + vibrato) * t) * np.random.uniform(0.7, 1.0)
        # Add harmonics
        signal += 0.5 * np.sin(2 * np.pi * freq * 2 * t)
        signal += 0.3 * np.sin(2 * np.pi * freq * 3 * t)
        # Sudden onset
        envelope = np.minimum(t * 10, 1.0)
        signal *= envelope
        # Add noise for realism
        signal += np.random.randn(n_samples) * 0.1

    elif category == "shout_help":
        # Patterned shout — alternating loud/quiet
        freq = np.random.uniform(300, 800)
        pattern_freq = np.random.uniform(1.5, 4)
        envelope = 0.5 + 0.5 * np.sin(2 * np.pi * pattern_freq * t)
        signal = np.sin(2 * np.pi * freq * t) * envelope * 0.8
        signal += 0.4 * np.sin(2 * np.pi * freq * 1.5 * t) * envelope
        signal += np.random.randn(n_samples) * 0.08

    elif category == "glass_breaking":
        # Broadband impulse + high-freq ringing
        impulse_time = np.random.uniform(0.1, 0.5)
        signal = np.random.randn(n_samples) * 0.3
        impulse_mask = (t > impulse_time) & (t < impulse_time + 0.3)
        signal[impulse_mask] += np.random.randn(impulse_mask.sum()) * 0.8
        # High-frequency ringing
        ring_freq = np.random.uniform(4000, 8000)
        ring = np.sin(2 * np.pi * ring_freq * t) * np.exp(-(t - impulse_time) * 8)
        ring[t < impulse_time] = 0
        signal += ring * 0.5

    elif category == "dog_bark":
        # Periodic mid-frequency bursts
        freq = np.random.uniform(300, 600)
        bark_interval = np.random.uniform(0.3, 0.8)
        signal = np.zeros(n_samples, dtype=np.float32)
        bark_times = np.arange(0, duration_s, bark_interval)
        for bt in bark_times:
            bark_mask = (t > bt) & (t < bt + 0.15)
            signal[bark_mask] = np.sin(2 * np.pi * freq * t[bark_mask]) * 0.7
        signal += np.random.randn(n_samples) * 0.05

    elif category == "traffic":
        # Low-frequency continuous rumble
        signal = np.zeros(n_samples, dtype=np.float32)
        for f in [80, 120, 200, 350]:
            signal += np.sin(2 * np.pi * f * t) * np.random.uniform(0.05, 0.2)
        signal += np.random.randn(n_samples) * 0.15

    elif category == "speech_normal":
        # Mid-frequency, regular formants
        f0 = np.random.uniform(100, 250)  # Fundamental
        signal = np.sin(2 * np.pi * f0 * t) * 0.3
        # Formants
        for formant in [np.random.uniform(500, 1000), np.random.uniform(1500, 2500)]:
            signal += np.sin(2 * np.pi * formant * t) * 0.15
        # Natural amplitude variation
        env = 0.5 + 0.5 * np.sin(2 * np.pi * np.random.uniform(2, 5) * t)
        signal *= env
        signal += np.random.randn(n_samples) * 0.05

    elif category == "silence":
        signal = np.random.randn(n_samples) * np.random.uniform(0.005, 0.02)

    elif category == "footsteps":
        signal = np.zeros(n_samples, dtype=np.float32)
        step_interval = np.random.uniform(0.4, 0.7)
        step_times = np.arange(0, duration_s, step_interval)
        for st in step_times:
            step_mask = (t > st) & (t < st + 0.08)
            if step_mask.sum() > 0:
                impulse = np.random.randn(step_mask.sum()) * 0.4
                impulse *= np.exp(-np.linspace(0, 5, step_mask.sum()))
                signal[step_mask] += impulse
        signal += np.random.randn(n_samples) * 0.02

    elif category == "music":
        # Harmonic, pleasant
        base_freq = np.random.choice([261.6, 293.7, 329.6, 349.2, 392.0])  # C4-G4
        signal = np.sin(2 * np.pi * base_freq * t) * 0.3
        signal += np.sin(2 * np.pi * base_freq * 2 * t) * 0.15
        signal += np.sin(2 * np.pi * base_freq * 3 * t) * 0.08
        signal += np.sin(2 * np.pi * base_freq * 1.5 * t) * 0.1  # Perfect fifth
        signal += np.random.randn(n_samples) * 0.02

    elif category == "crowd":
        # Multi-source babble
        signal = np.zeros(n_samples, dtype=np.float32)
        n_voices = np.random.randint(5, 15)
        for _ in range(n_voices):
            f0 = np.random.uniform(100, 300)
            phase = np.random.uniform(0, 2 * np.pi)
            amp = np.random.uniform(0.03, 0.1)
            voice = np.sin(2 * np.pi * f0 * t + phase) * amp
            env = 0.5 + 0.5 * np.sin(2 * np.pi * np.random.uniform(1, 6) * t + np.random.uniform(0, 2*np.pi))
            signal += voice * env
        signal += np.random.randn(n_samples) * 0.08

    else:
        signal = np.random.randn(n_samples) * 0.1

    # Clip to [-1, 1]
    signal = np.clip(signal, -1.0, 1.0).astype(np.float32)
    return signal
