const boardElement = document.querySelector("#board");
const dialog = document.querySelector("#meeting-dialog");
const form = document.querySelector("#meeting-form");
const errorElement = document.querySelector("#form-error");
const toast = document.querySelector("#toast");

let boardData;
let toastTimer;

const calendarIcon = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3.5" y="4.5" width="17" height="16" rx="2"></rect>
    <path d="M8 2.8v3.4M16 2.8v3.4M3.5 9h17"></path>
  </svg>`;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getMember(memberId) {
  return boardData.members.find((member) => member.id === memberId);
}

function memberAvatar(member, small = false) {
  return `<span class="member-avatar ${escapeHtml(member.color)}${small ? " owner-mini" : ""}" title="${escapeHtml(member.name)}"><span aria-hidden="true">${escapeHtml(member.initials)}</span><span class="sr-only">${escapeHtml(member.name)}</span></span>`;
}

function formatDate(dateValue, timeValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const formatted = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short" })
    .format(new Date(year, month - 1, day))
    .replace(".", "");
  return `${formatted} · ${timeValue}`;
}

function renderCard(card) {
  const owner = getMember(card.ownerId);
  const attendees = card.attendees.map((id) => memberAvatar(getMember(id))).join("");
  const completeClass = card.status === "done" ? " is-complete" : "";
  return `
    <li>
      <article class="meeting-card${completeClass}">
        <div class="card-kicker">
          <span class="week-tag">${escapeHtml(card.week)}</span>
          ${memberAvatar(owner, true)}
        </div>
        <h3>${escapeHtml(card.title)}</h3>
        <p class="card-description">${escapeHtml(card.description)}</p>
        <div class="card-footer">
          <button class="date-chip" type="button" data-edit-card="${escapeHtml(card.id)}" aria-label="Cambiar fecha de ${escapeHtml(card.title)}. Fecha actual: ${escapeHtml(formatDate(card.date, card.time))}">
            ${calendarIcon}<span>${escapeHtml(formatDate(card.date, card.time))}</span>
          </button>
          <div class="attendee-dots" aria-label="${card.attendees.length} participantes">${attendees}</div>
        </div>
      </article>
    </li>`;
}

function renderBoard() {
  document.querySelector("#workspace-name").textContent = boardData.workspace.name;
  document.querySelector("#board-title").textContent = boardData.workspace.boardName;
  document.querySelector("#date-range").textContent = boardData.workspace.dateRange;
  document.querySelector("#meeting-count").textContent = `${boardData.cards.length} reuniones`;
  document.querySelector("#member-stack").innerHTML = boardData.members.map((member) => memberAvatar(member)).join("");

  boardElement.innerHTML = boardData.lists.map((list) => {
    const cards = boardData.cards.filter((card) => card.status === list.id);
    const content = cards.length
      ? `<ul class="card-list">${cards.map(renderCard).join("")}</ul>`
      : `<p class="empty-list">No hay reuniones en esta lista.</p>`;
    return `
      <section class="list-lane" aria-labelledby="list-${escapeHtml(list.id)}">
        <header class="list-header">
          <div class="list-title"><h2 id="list-${escapeHtml(list.id)}">${escapeHtml(list.title)}</h2><span class="list-count">${cards.length}</span></div>
          <button class="list-menu" type="button" aria-label="Opciones de ${escapeHtml(list.title)}">···</button>
        </header>
        ${content}
      </section>`;
  }).join("");
  boardElement.setAttribute("aria-busy", "false");
}

function openEditor(cardId) {
  const card = boardData.cards.find((item) => item.id === cardId);
  document.querySelector("#card-id").value = card.id;
  document.querySelector("#meeting-date").value = card.date;
  document.querySelector("#meeting-time").value = card.time;
  document.querySelector("#dialog-card-title").textContent = card.title;
  errorElement.textContent = "";
  dialog.showModal();
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

async function loadBoard() {
  boardElement.innerHTML = '<p class="loading">Cargando reuniones…</p>';
  try {
    const response = await fetch("/api/board");
    if (!response.ok) throw new Error("No se pudo cargar el tablero.");
    boardData = await response.json();
    renderBoard();
  } catch (error) {
    boardElement.innerHTML = `<p class="loading">${escapeHtml(error.message)}</p>`;
  }
}

boardElement.addEventListener("click", (event) => {
  const button = event.target.closest("[data-edit-card]");
  if (button) openEditor(button.dataset.editCard);
});

document.querySelector("#cancel-dialog").addEventListener("click", () => dialog.close());

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = document.querySelector("#save-meeting");
  const cardId = document.querySelector("#card-id").value;
  const payload = {
    date: document.querySelector("#meeting-date").value,
    time: document.querySelector("#meeting-time").value,
  };
  errorElement.textContent = "";
  submitButton.disabled = true;
  submitButton.textContent = "Guardando…";
  try {
    const response = await fetch(`/api/cards/${encodeURIComponent(cardId)}/schedule`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo guardar el cambio.");
    const cardIndex = boardData.cards.findIndex((card) => card.id === cardId);
    boardData.cards[cardIndex] = { ...boardData.cards[cardIndex], ...result.card };
    renderBoard();
    dialog.close();
    showToast(`Reunión movida al ${formatDate(result.card.date, result.card.time)}.`);
  } catch (error) {
    errorElement.textContent = error.message;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Guardar cambio";
  }
});

document.querySelector("#view-toggle").addEventListener("click", () => {
  document.querySelectorAll(".date-chip").forEach((chip) => chip.classList.toggle("is-highlighted"));
  const firstDate = document.querySelector(".date-chip");
  firstDate?.focus();
});

loadBoard();

