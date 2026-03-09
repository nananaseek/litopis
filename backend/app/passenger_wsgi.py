import sys
import os

# Додаємо шлях до поточної директорії, щоб Python бачив ваші модулі
sys.path.insert(0, os.path.dirname(__file__))

# Імпортуємо ваш FastAPI об'єкт з вашого файлу main.py
from main import app

# Конвертуємо ASGI в WSGI
from a2wsgi import ASGIMiddleware
application = ASGIMiddleware(app)