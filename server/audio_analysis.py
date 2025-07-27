import sys, json
import parselmouth

def analyze(audio_file):
    snd = parselmouth.Sound(audio_file)
    pitch = snd.to_pitch()
    point_process = parselmouth.praat.call(snd, "To PointProcess (periodic, cc)", 75, 500)

    f0 = pitch.get_mean(0, 0, "Hertz")
    jitter = parselmouth.praat.call(point_process, "Get jitter (local)", 0, 0, 0.0001, 0.02, 1.3)
    shimmer = parselmouth.praat.call([snd, point_process], "Get shimmer (local)", 0, 0, 0.0001, 0.02, 1.3, 1.6)
    hnr = parselmouth.praat.call(snd, "Get harmonicity (cc)", 0.01, 75, 0.1, 1.0).get_mean()
    duration = snd.get_total_duration()

    return {
        "F0": round(f0, 2),
        "Jitter": round(jitter * 100, 2),
        "Shimmer": round(shimmer * 100, 2),
        "HNR": round(hnr, 2),
        "Duration": round(duration, 2)
    }

if __name__ == "__main__":
    audio_path = sys.argv[1]
    result = analyze(audio_path)
    print(json.dumps(result))
