import os
import sys

# Ensure ONNX mode is enabled for Serverless environment
os.environ["USE_ONNX"] = "True"

# Add the root directory to the python path so it can find 'backend'
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if root_dir not in sys.path:
    sys.path.append(root_dir)

from backend.app.main import app, on_startup

# Auto-initialize DB and Model on cold start for serverless
on_startup()
