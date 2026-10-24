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
                    "members": [{"id": "julio"}],
                    "lists": [
                        {"id": "upcoming", "title": "Próximas"},
                        {"id": "done", "title": "Realizadas"},
                    ],
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

    def test_create_update_move_and_delete_card(self):
        created = self.store.create_card(
            {
                "title": "Nueva reunión",
                "description": "Preparar la siguiente entrega.",
                "date": "2026-07-19",
                "time": "09:15",
                "ownerId": "julio",
                "status": "upcoming",
                "week": "Semana 2",
                "attendees": ["julio"],
            }
        )
        updated = self.store.update_card(
            created["id"], {"title": "Reunión actualizada", "status": "done"}
        )
        deleted = self.store.delete_card(created["id"])

        self.assertTrue(created["id"].startswith("meeting-"))
        self.assertEqual(updated["title"], "Reunión actualizada")
        self.assertEqual(updated["status"], "done")
        self.assertEqual(deleted["id"], created["id"])
        self.assertEqual(len(self.store.read()["cards"]), 1)

    def test_card_requires_known_owner_list_and_attendees(self):
        with self.assertRaisesRegex(ValidationError, "responsable"):
            self.store.create_card(
                {
                    "title": "Reunión",
                    "date": "2026-07-19",
                    "time": "09:15",
                    "ownerId": "nadie",
                    "status": "upcoming",
                    "attendees": [],
                }
            )

    def test_create_rename_and_delete_empty_list(self):
        created = self.store.create_list("Seguimiento")
        renamed = self.store.rename_list(created["id"], "Seguimiento final")
        deleted = self.store.delete_list(created["id"])

        self.assertEqual(renamed["title"], "Seguimiento final")
        self.assertEqual(deleted["id"], created["id"])
        remaining = self.store.read().get("lists", [])
        self.assertEqual(len(remaining), 2)
        self.assertNotIn(created["id"], {item["id"] for item in remaining})

    def test_delete_list_rejects_list_with_cards(self):
        self.board_path.write_text(
            json.dumps(
                {
                    "members": [{"id": "julio"}],
                    "lists": [{"id": "upcoming", "title": "Próximas"}],
                    "cards": [{"id": "meeting-1", "status": "upcoming"}],
                }
            ),
            encoding="utf-8",
        )

        with self.assertRaisesRegex(ValidationError, "contiene reuniones"):
            self.store.delete_list("upcoming")


class ProjectTimelineTests(unittest.TestCase):
    def test_seed_data_covers_nine_weekly_meetings_through_october_23(self):
        board_path = Path(__file__).parents[1] / "data" / "board.json"
        board = json.loads(board_path.read_text(encoding="utf-8"))
        meeting_dates = sorted(card["date"] for card in board["cards"])

        self.assertEqual(len(meeting_dates), 9)
        self.assertEqual(meeting_dates[0], "2026-08-28")
        self.assertEqual(meeting_dates[-1], "2026-10-23")
        self.assertEqual(len(board["members"]), 5)


if __name__ == "__main__":
    unittest.main()

