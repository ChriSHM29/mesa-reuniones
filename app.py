from __future__ import annotations

import json
import mimetypes
import os
import re
import threading
import uuid
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
            return self._read_unlocked()

    def _read_unlocked(self) -> dict:
        return json.loads(self.path.read_text(encoding="utf-8"))

    def _write_unlocked(self, board: dict) -> None:
        temporary_path = self.path.with_suffix(".tmp")
        temporary_path.write_text(
            json.dumps(board, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        os.replace(temporary_path, self.path)

    @staticmethod
    def _validate_text(value: object, label: str, maximum: int) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValidationError(f"{label} es obligatorio.")
        normalized = value.strip()
        if len(normalized) > maximum:
            raise ValidationError(f"{label} admite hasta {maximum} caracteres.")
        return normalized

    @staticmethod
    def _validate_schedule(meeting_date: object, meeting_time: object) -> None:
        try:
            date.fromisoformat(meeting_date)
        except (TypeError, ValueError) as error:
            raise ValidationError("Ingresa una fecha válida.") from error
        if not isinstance(meeting_time, str) or not re.fullmatch(
            r"(?:[01]\d|2[0-3]):[0-5]\d", meeting_time
        ):
            raise ValidationError("Ingresa una hora válida.")

    def _validate_card(self, board: dict, card: dict) -> dict:
        validated = card.copy()
        validated["title"] = self._validate_text(card.get("title"), "El título", 120)
        description = card.get("description", "")
        if not isinstance(description, str) or len(description.strip()) > 500:
            raise ValidationError("La descripción admite hasta 500 caracteres.")
        validated["description"] = description.strip()
        self._validate_schedule(card.get("date"), card.get("time"))
        member_ids = {member["id"] for member in board.get("members", [])}
        list_ids = {item["id"] for item in board.get("lists", [])}
        if card.get("ownerId") not in member_ids:
            raise ValidationError("Selecciona un responsable válido.")
        if card.get("status") not in list_ids:
            raise ValidationError("Selecciona una fase válida.")
        attendees = card.get("attendees")
        if not isinstance(attendees, list) or not attendees or any(
            attendee not in member_ids for attendee in attendees
        ):
            raise ValidationError("Selecciona participantes válidos.")
        validated["attendees"] = list(dict.fromkeys(attendees))
        week = card.get("week", "Sin semana")
        validated["week"] = self._validate_text(week, "La semana", 40)
        return validated

    def reschedule(self, card_id: str, meeting_date: str, meeting_time: str) -> dict:
        self._validate_schedule(meeting_date, meeting_time)

        with self._lock:
            board = self._read_unlocked()
            card = next((item for item in board["cards"] if item["id"] == card_id), None)
            if card is None:
                raise KeyError(card_id)
            card["date"] = meeting_date
            card["time"] = meeting_time
            self._write_unlocked(board)
            return card.copy()

    def create_card(self, payload: dict) -> dict:
        with self._lock:
            board = self._read_unlocked()
            card = self._validate_card(board, payload)
            card["id"] = f"meeting-{uuid.uuid4().hex[:10]}"
            board.setdefault("cards", []).append(card)
            self._write_unlocked(board)
            return card.copy()

    def update_card(self, card_id: str, payload: dict) -> dict:
        allowed = {
            "title", "description", "date", "time", "ownerId", "status", "week", "attendees"
        }
        with self._lock:
            board = self._read_unlocked()
            card = next((item for item in board.get("cards", []) if item["id"] == card_id), None)
            if card is None:
                raise KeyError(card_id)
            merged = {**card, **{key: value for key, value in payload.items() if key in allowed}}
            validated = self._validate_card(board, merged)
            validated["id"] = card_id
            card.clear()
            card.update(validated)
            self._write_unlocked(board)
            return card.copy()

    def delete_card(self, card_id: str) -> dict:
        with self._lock:
            board = self._read_unlocked()
            cards = board.get("cards", [])
            index = next((i for i, item in enumerate(cards) if item["id"] == card_id), None)
            if index is None:
                raise KeyError(card_id)
            deleted = cards.pop(index)
            self._write_unlocked(board)
            return deleted

    def create_list(self, title: str) -> dict:
        normalized = self._validate_text(title, "El nombre de la fase", 60)
        with self._lock:
            board = self._read_unlocked()
            item = {"id": f"list-{uuid.uuid4().hex[:8]}", "title": normalized}
            board.setdefault("lists", []).append(item)
            self._write_unlocked(board)
            return item.copy()

    def rename_list(self, list_id: str, title: str) -> dict:
        normalized = self._validate_text(title, "El nombre de la fase", 60)
        with self._lock:
            board = self._read_unlocked()
            item = next((entry for entry in board.get("lists", []) if entry["id"] == list_id), None)
            if item is None:
                raise KeyError(list_id)
            item["title"] = normalized
            self._write_unlocked(board)
            return item.copy()

    def delete_list(self, list_id: str) -> dict:
        with self._lock:
            board = self._read_unlocked()
            lists = board.get("lists", [])
            index = next((i for i, item in enumerate(lists) if item["id"] == list_id), None)
            if index is None:
                raise KeyError(list_id)
            if any(card.get("status") == list_id for card in board.get("cards", [])):
                raise ValidationError("La fase contiene reuniones. Muévelas antes de eliminarla.")
            deleted = lists.pop(index)
            self._write_unlocked(board)
            return deleted


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
        schedule_match = re.fullmatch(r"/api/cards/([^/]+)/schedule", path)
        card_match = re.fullmatch(r"/api/cards/([^/]+)", path)
        list_match = re.fullmatch(r"/api/lists/([^/]+)", path)
        if not any((schedule_match, card_match, list_match)):
            self._send_json({"error": "Ruta no encontrada."}, HTTPStatus.NOT_FOUND)
            return

        try:
            payload = self._read_payload()
            if schedule_match:
                result = {"card": self.store.reschedule(
                    schedule_match.group(1), payload.get("date"), payload.get("time")
                )}
            elif card_match:
                result = {"card": self.store.update_card(card_match.group(1), payload)}
            else:
                result = {"list": self.store.rename_list(list_match.group(1), payload.get("title"))}
        except json.JSONDecodeError:
            self._send_json({"error": "JSON no válido."}, HTTPStatus.BAD_REQUEST)
        except ValidationError as error:
            self._send_json({"error": str(error)}, HTTPStatus.UNPROCESSABLE_ENTITY)
        except KeyError:
            self._send_json({"error": "Elemento no encontrado."}, HTTPStatus.NOT_FOUND)
        else:
            self._send_json(result)

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        try:
            payload = self._read_payload()
            if path == "/api/cards":
                result = {"card": self.store.create_card(payload)}
            elif path == "/api/lists":
                result = {"list": self.store.create_list(payload.get("title"))}
            else:
                self._send_json({"error": "Ruta no encontrada."}, HTTPStatus.NOT_FOUND)
                return
        except json.JSONDecodeError:
            self._send_json({"error": "JSON no válido."}, HTTPStatus.BAD_REQUEST)
        except ValidationError as error:
            self._send_json({"error": str(error)}, HTTPStatus.UNPROCESSABLE_ENTITY)
        else:
            self._send_json(result, HTTPStatus.CREATED)

    def do_DELETE(self) -> None:
        path = urlparse(self.path).path
        card_match = re.fullmatch(r"/api/cards/([^/]+)", path)
        list_match = re.fullmatch(r"/api/lists/([^/]+)", path)
        try:
            if card_match:
                result = {"card": self.store.delete_card(card_match.group(1))}
            elif list_match:
                result = {"list": self.store.delete_list(list_match.group(1))}
            else:
                self._send_json({"error": "Ruta no encontrada."}, HTTPStatus.NOT_FOUND)
                return
        except ValidationError as error:
            self._send_json({"error": str(error)}, HTTPStatus.CONFLICT)
        except KeyError:
            self._send_json({"error": "Elemento no encontrado."}, HTTPStatus.NOT_FOUND)
        else:
            self._send_json(result)

    def _read_payload(self) -> dict:
        content_length = int(self.headers.get("Content-Length", "0"))
        if content_length <= 0 or content_length > 16384:
            raise ValidationError("El cuerpo de la solicitud no es válido.")
        payload = json.loads(self.rfile.read(content_length))
        if not isinstance(payload, dict):
            raise ValidationError("El cuerpo de la solicitud no es válido.")
        return payload

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

