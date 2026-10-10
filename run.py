"""
run.py — Single-run script for OmniChat.
Kills old hanging ports, starts all 3 services, and automatically opens http://localhost:3000 in your browser.
"""

import os
import sys
import time
import subprocess
import threading
import signal
import webbrowser

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

PORTS_TO_CLEAR = [8000, 5000, 3000]

def kill_port(port):
    """Kill any process listening on the given port (Windows)."""
    try:
        output = subprocess.check_output(
            f'netstat -ano | findstr ":{port}" | findstr "LISTENING"',
            shell=True,
            text=True,
            stderr=subprocess.DEVNULL,
        )
        for line in output.strip().splitlines():
            parts = line.split()
            if len(parts) >= 5:
                pid = parts[-1]
                if pid != "0" and pid != str(os.getpid()):
                    subprocess.run(
                        f"taskkill /F /PID {pid}",
                        shell=True,
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                    )
    except Exception:
        pass


def free_ports():
    print("Checking and freeing ports (8000, 5000, 3000)...")
    for port in PORTS_TO_CLEAR:
        kill_port(port)


SERVICES = [
    {
        "name": "AI-BACKEND",
        "cwd": os.path.join(ROOT_DIR, "AI PROJECT"),
        "cmd": [sys.executable, "-m", "uvicorn", "main:app", "--port", "8000", "--reload"],
        "color": "\033[94m",  # Blue
    },
    {
        "name": "EXPRESS-PROXY",
        "cwd": os.path.join(ROOT_DIR, "chatbot_backend"),
        "cmd": ["npm.cmd" if os.name == "nt" else "npm", "start"],
        "color": "\033[92m",  # Green
    },
    {
        "name": "REACT-FRONTEND",
        "cwd": os.path.join(ROOT_DIR, "chatbot_frontend"),
        "cmd": ["npm.cmd" if os.name == "nt" else "npm", "start"],
        "color": "\033[95m",  # Magenta
        "env": {**os.environ, "BROWSER": "none"},  # We explicitly open the browser
    },
]

RESET_COLOR = "\033[0m"
processes = []


def stream_output(pipe, prefix, color):
    try:
        for line in iter(pipe.readline, ""):
            if not line:
                break
            print(f"{color}[{prefix}]{RESET_COLOR} {line.rstrip()}", flush=True)
    except Exception:
        pass


def open_browser_delayed(delay=4):
    time.sleep(delay)
    url = "http://localhost:3000"
    print(f"\n>>> Opening OmniChat in your browser: {url} <<<\n", flush=True)
    webbrowser.open(url)


def terminate_all():
    print("\nStopping all services...", flush=True)
    for p in processes:
        if p.poll() is None:
            p.terminate()
            try:
                p.wait(timeout=2)
            except subprocess.TimeoutExpired:
                p.kill()
    free_ports()
    print("All services stopped.", flush=True)


def main():
    free_ports()

    print("=" * 60)
    print(" Starting OmniChat Chatbot")
    print("=" * 60)
    print(" - Python AI Service : http://localhost:8000")
    print(" - Express Proxy     : http://localhost:5000")
    print(" - React Frontend    : http://localhost:3000")
    print(" Press Ctrl+C anytime to stop all services.")
    print("=" * 60 + "\n", flush=True)

    for s in SERVICES:
        env = s.get("env", os.environ.copy())
        p = subprocess.Popen(
            s["cmd"],
            cwd=s["cwd"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            encoding="utf-8",
            errors="replace",
            env=env,
        )
        processes.append(p)
        t = threading.Thread(
            target=stream_output,
            args=(p.stdout, s["name"], s["color"]),
            daemon=True,
        )
        t.start()

    # Launch browser in a background thread after a short delay
    browser_thread = threading.Thread(target=open_browser_delayed, daemon=True)
    browser_thread.start()

    def handle_signal(sig, frame):
        terminate_all()
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_signal)
    if hasattr(signal, "SIGBREAK"):
        signal.signal(signal.SIGBREAK, handle_signal)

    try:
        for p in processes:
            p.wait()
    except KeyboardInterrupt:
        terminate_all()


if __name__ == "__main__":
    main()
