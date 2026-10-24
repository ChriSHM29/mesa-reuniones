import json
import tempfile
import unittest
from pathlib import Path

from app import BoardStore, ValidationError


class BoardStoreTests(unittest.TestCase):
    def setUp(self):
        temp_root = Path(__file__).parent / ".tmp"
        temp_root.mkdir(exist_ok=True)
        self.temp_dir = tempfile.TemporaryDirectory(dir=temp_root)
        self.board_path = Path(self.temp_dir.name) / "board.json"
        self.board_path.write_text(
            json.dumps(
                {
                    "cards": [
                        {
                            "id": "meeting-1",
                            "title": "Revisión semanal",
                            "date": "2026-07-15",
                            "time": "10:00",
                            "ownerId": "julio",
                            "status": "upcoming",
                        }
                    ]
                }
            ),
            encoding="utf-8",
        )
        self.store = BoardStore(self.board_path)

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_reschedule_updates_date_and_time_and_persists(self):
        updated = self.store.reschedule("meeting-1", "2026-07-18", "16:30")

        self.assertEqual(updated["date"], "2026-07-18")
        self.assertEqual(updated["time"], "16:30")
        persisted = json.loads(self.board_path.read_text(encoding="utf-8"))
        self.assertEqual(persisted["cards"][0]["date"], "2026-07-18")

    def test_reschedule_rejects_invalid_calendar_date(self):
        with self.assertRaisesRegex(ValidationError, "fecha válida"):
            self.store.reschedule("meeting-1", "2026-02-30", "10:00")

    def test_reschedule_rejects_invalid_time(self):
        with self.assertRaisesRegex(ValidationError, "hora válida"):
            self.store.reschedule("meeting-1", "2026-07-18", "25:99")

    def test_reschedule_rejects_unknown_card(self):
        with self.assertRaises(KeyError):
            self.store.reschedule("missing", "2026-07-18", "10:00")


if __name__ == "__main__":
    unittest.main()

