from __future__ import annotations

import json
import mimetypes
import os
import re
import threading
from datetime import date
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
STATIC_DIR = ROOT / "static"
DATA_FILE = ROOT / "data" / "board.json"


class ValidationError(ValueError):
    pass


class BoardStore:
    def __init__(self, path: Path):
        self.path = path
        self._lock = threading.Lock()

    def read(self) -> dict:
        with self._lock:
            return json.loads(self.path.read_text(encoding="utf-8"))

    def reschedule(self, card_id: str, meeting_date: str, meeting_time: str) -> dict:
        try:
            date.fromisoformat(meeting_date)
        except (TypeError, ValueError) as error:
            raise ValidationError("Ingresa una fecha válida.") from error

        if not isinstance(meeting_time, str) or not re.fullmatch(
            r"(?:[01]\d|2[0-3]):[0-5]\d", meeting_time
        ):
            raise ValidationError("Ingresa una hora válida.")

        with self._lock:
            board = json.loads(self.path.read_text(encoding="utf-8"))
            card = next((item for item in board["cards"] if item["id"] == card_id), None)
            if card is None:
                raise KeyError(card_id)
            card["date"] = meeting_date
            card["time"] = meeting_time
            temporary_path = self.path.with_suffix(".tmp")
            temporary_path.write_text(
                json.dumps(board, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
            )
            os.replace(temporary_path, self.path)
            return card.copy()


class AppHandler(BaseHTTPRequestHandler):
    store = BoardStore(DATA_FILE)

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/api/board":
            self._send_json(self.store.read())
            return
        self._serve_static(path)

    def do_PATCH(self) -> None:
        path = urlparse(self.path).path
        match = re.fullmatch(r"/api/cards/([^/]+)/schedule", path)
        if not match:
            self._send_json({"error": "Ruta no encontrada."}, HTTPStatus.NOT_FOUND)
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length <= 0 or content_length > 4096:
                raise ValidationError("El cuerpo de la solicitud no es válido.")
            payload = json.loads(self.rfile.read(content_length))
            card = self.store.reschedule(
                match.group(1), payload.get("date"), payload.get("time")
            )
        except json.JSONDecodeError:
            self._send_json({"error": "JSON no válido."}, HTTPStatus.BAD_REQUEST)
        except ValidationError as error:
            self._send_json({"error": str(error)}, HTTPStatus.UNPROCESSABLE_ENTITY)
        except KeyError:
            self._send_json({"error": "Reunión no encontrada."}, HTTPStatus.NOT_FOUND)
        else:
            self._send_json({"card": card})

    def _serve_static(self, request_path: str) -> None:
        relative_path = "index.html" if request_path == "/" else request_path.lstrip("/")
        target = (STATIC_DIR / relative_path).resolve()
        try:
            target.relative_to(STATIC_DIR.resolve())
        except ValueError:
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        if not target.is_file():
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        content_type, _ = mimetypes.guess_type(target.name)
        body = target.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", f"{content_type or 'application/octet-stream'}; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _send_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: object) -> None:
        print(f"[{self.log_date_time_string()}] {format % args}")


def run(port: int = 3000) -> None:
    server = ThreadingHTTPServer(("127.0.0.1", port), AppHandler)
    print(f"Mesa disponible en http://127.0.0.1:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    run(int(os.environ.get("PORT", "3000")))

