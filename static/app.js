const boardElement = document.querySelector("#board");
const calendarView = document.querySelector("#calendar-view");
const cardDialog = document.querySelector("#card-dialog");
const cardForm = document.querySelector("#card-form");
const listDialog = document.querySelector("#list-dialog");
const listForm = document.querySelector("#list-form");
const confirmDialog = document.querySelector("#confirm-dialog");
const toast = document.querySelector("#toast");

let boardData;
let activeView = "board";
let toastTimer;

const icons = {
  calendar: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="16" rx="2"></rect><path d="M8 2.8v3.4M16 2.8v3.4M3.5 9h17"></path></svg>`,
  plus: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>`,
  edit: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5.5 4 4M4 20l1-4L16.5 4.5a1.4 1.4 0 0 1 2 0l1 1a1.4 1.4 0 0 1 0 2L8 19l-4 1Z"></path></svg>`,
};

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function getMember(memberId) {
  return boardData.members.find((member) => member.id === memberId);
}

function memberAvatar(member, small = false) {
  if (!member) return "";
  return `<span class="member-avatar ${escapeHtml(member.color)}${small ? " owner-mini" : ""}" title="${escapeHtml(member.name)}"><span aria-hidden="true">${escapeHtml(member.initials)}</span><span class="sr-only">${escapeHtml(member.name)}</span></span>`;
}

function formatDate(dateValue, timeValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const formatted = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short" }).format(new Date(year, month - 1, day)).replace(".", "");
  return `${formatted} · ${timeValue}`;
}

function longDate(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Intl.DateTimeFormat("es-PE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(year, month - 1, day));
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: options.body ? { "Content-Type": "application/json", ...options.headers } : options.headers,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "No se pudo completar la acción.");
  return result;
}

function renderCard(card) {
  const owner = getMember(card.ownerId);
  const attendees = card.attendees.map((id) => memberAvatar(getMember(id))).join("");
  const phaseOptions = boardData.lists.map((list) => `<option value="${escapeHtml(list.id)}"${list.id === card.status ? " selected" : ""}>${escapeHtml(list.title)}</option>`).join("");
  return `<li><article class="meeting-card" data-card-id="${escapeHtml(card.id)}">
    <div class="card-kicker"><span class="week-tag">${escapeHtml(card.week)}</span><div class="card-owner-actions">${memberAvatar(owner, true)}<button class="card-edit" type="button" data-edit-card="${escapeHtml(card.id)}" aria-label="Editar ${escapeHtml(card.title)}">${icons.edit}</button></div></div>
    <h3>${escapeHtml(card.title)}</h3><p class="card-description">${escapeHtml(card.description)}</p>
    <div class="card-footer"><button class="date-chip" type="button" data-edit-card="${escapeHtml(card.id)}" aria-label="Editar ${escapeHtml(card.title)}. Fecha: ${escapeHtml(formatDate(card.date, card.time))}">${icons.calendar}<span>${escapeHtml(formatDate(card.date, card.time))}</span></button><div class="attendee-dots" aria-label="${card.attendees.length} participantes">${attendees}</div></div>
    <label class="phase-control"><span class="sr-only">Mover ${escapeHtml(card.title)} a otra fase</span><select data-move-card="${escapeHtml(card.id)}" aria-label="Fase de ${escapeHtml(card.title)}">${phaseOptions}</select></label>
  </article></li>`;
}

function renderBoard() {
  boardElement.innerHTML = `${boardData.lists.map((list) => {
    const cards = boardData.cards.filter((card) => card.status === list.id);
    return `<section class="list-lane" aria-labelledby="list-${escapeHtml(list.id)}">
      <header class="list-header"><div class="list-title"><h2 id="list-${escapeHtml(list.id)}">${escapeHtml(list.title)}</h2><span class="list-count">${cards.length}</span></div><div class="list-actions"><button class="list-menu" type="button" data-list-menu="${escapeHtml(list.id)}" aria-label="Opciones de ${escapeHtml(list.title)}" aria-expanded="false">…</button><div class="context-menu" data-list-menu-panel="${escapeHtml(list.id)}" hidden><button type="button" data-rename-list="${escapeHtml(list.id)}">Renombrar fase</button><button type="button" class="danger-text" data-delete-list="${escapeHtml(list.id)}">Eliminar fase</button></div></div></header>
      ${cards.length ? `<ul class="card-list">${cards.map(renderCard).join("")}</ul>` : `<p class="empty-list">No hay reuniones en esta fase.</p>`}
    </section>`;
  }).join("")}<button class="add-list-button" type="button" id="add-list-button">${icons.plus}<span>Añadir otra fase</span></button>`;
  boardElement.setAttribute("aria-busy", "false");
}

function renderCalendar() {
  const cards = [...boardData.cards].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  calendarView.innerHTML = `<div class="calendar-heading"><div><p class="eyebrow">Cronología</p><h2>Calendario de reuniones</h2></div><button class="primary-button" type="button" data-new-card>${icons.plus}Nueva reunión</button></div><ol class="calendar-list">${cards.map((card) => {
    const [year, month, day] = card.date.split("-").map(Number);
    const monthLabel = new Intl.DateTimeFormat("es-PE", { month: "short" }).format(new Date(year, month - 1, day)).replace(".", "");
    return `<li><time datetime="${escapeHtml(card.date)}T${escapeHtml(card.time)}"><strong>${day}</strong><span>${escapeHtml(monthLabel)}</span></time><button type="button" data-edit-card="${escapeHtml(card.id)}"><span>${escapeHtml(card.week)}</span><strong>${escapeHtml(card.title)}</strong><small>${escapeHtml(longDate(card.date))} · ${escapeHtml(card.time)} · ${escapeHtml(getMember(card.ownerId)?.name)}</small></button></li>`;
  }).join("")}</ol>`;
}

function renderApp() {
  document.querySelector("#workspace-name").textContent = boardData.workspace.name;
  document.querySelector("#board-title").textContent = boardData.workspace.boardName;
  document.querySelector("#date-range").textContent = boardData.workspace.dateRange;
  document.querySelector("#meeting-count").textContent = `${boardData.cards.length} reuniones`;
  document.querySelector("#member-stack").innerHTML = boardData.members.map((member) => memberAvatar(member)).join("");
  renderBoard();
  renderCalendar();
  setView(activeView);
}

function setView(view) {
  activeView = view;
  boardElement.hidden = view !== "board";
  calendarView.hidden = view !== "calendar";
  window.scrollTo({ top: 0, left: 0 });
  document.querySelectorAll("[data-view]").forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function populateCardForm(card = null) {
  cardForm.reset();
  document.querySelector("#card-id").value = card?.id || "";
  document.querySelector("#card-dialog-eyebrow").textContent = card ? "Editar reunión" : "Nueva reunión";
  document.querySelector("#card-dialog-title").textContent = card ? card.title : "Nueva reunión";
  document.querySelector("#card-title").value = card?.title || "";
  document.querySelector("#card-description").value = card?.description || "";
  document.querySelector("#card-week").value = card?.week || `Semana ${boardData.cards.length + 1}`;
  document.querySelector("#card-date").value = card?.date || "2026-10-30";
  document.querySelector("#card-time").value = card?.time || "17:00";
  document.querySelector("#card-owner").innerHTML = boardData.members.map((member) => `<option value="${escapeHtml(member.id)}"${member.id === (card?.ownerId || "julio") ? " selected" : ""}>${escapeHtml(member.name)}</option>`).join("");
  document.querySelector("#card-status").innerHTML = boardData.lists.map((list) => `<option value="${escapeHtml(list.id)}"${list.id === (card?.status || boardData.lists[0]?.id) ? " selected" : ""}>${escapeHtml(list.title)}</option>`).join("");
  const selectedAttendees = new Set(card?.attendees || boardData.members.map((member) => member.id));
  document.querySelector("#attendee-options").innerHTML = boardData.members.map((member) => `<label><input type="checkbox" name="attendees" value="${escapeHtml(member.id)}"${selectedAttendees.has(member.id) ? " checked" : ""}><span>${memberAvatar(member)}${escapeHtml(member.name)}</span></label>`).join("");
  document.querySelector("#delete-card-button").hidden = !card;
  document.querySelector("#card-form-error").textContent = "";
}

function openCardDialog(cardId = null) {
  populateCardForm(cardId ? boardData.cards.find((card) => card.id === cardId) : null);
  cardDialog.showModal();
  document.querySelector("#card-title").focus();
}

function openListDialog(listId = null) {
  const list = listId ? boardData.lists.find((item) => item.id === listId) : null;
  listForm.reset();
  document.querySelector("#list-id").value = list?.id || "";
  document.querySelector("#list-dialog-title").textContent = list ? "Renombrar fase" : "Nueva fase";
  document.querySelector("#list-title").value = list?.title || "";
  document.querySelector("#list-form-error").textContent = "";
  listDialog.showModal();
  document.querySelector("#list-title").focus();
}

function askConfirmation(title, copy) {
  document.querySelector("#confirm-title").textContent = title;
  document.querySelector("#confirm-copy").textContent = copy;
  confirmDialog.returnValue = "cancel";
  confirmDialog.showModal();
  return new Promise((resolve) => confirmDialog.addEventListener("close", () => resolve(confirmDialog.returnValue === "confirm"), { once: true }));
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

async function reloadBoard(message) {
  boardData = await api("/api/board");
  renderApp();
  if (message) showToast(message);
}

async function loadBoard() {
  boardElement.innerHTML = '<p class="loading">Cargando reuniones…</p>';
  try { await reloadBoard(); } catch (error) { boardElement.innerHTML = `<p class="loading">${escapeHtml(error.message)}</p>`; }
}

document.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-card]");
  if (editButton) return openCardDialog(editButton.dataset.editCard);
  if (event.target.closest("[data-new-card]")) return openCardDialog();
  const moveSelect = event.target.closest("[data-move-card]");
  if (moveSelect) return;
  const listMenuButton = event.target.closest("[data-list-menu]");
  if (listMenuButton) {
    const panel = document.querySelector(`[data-list-menu-panel="${CSS.escape(listMenuButton.dataset.listMenu)}"]`);
    const opening = panel.hidden;
    document.querySelectorAll("[data-list-menu-panel]").forEach((item) => { item.hidden = true; });
    panel.hidden = !opening;
    listMenuButton.setAttribute("aria-expanded", String(opening));
    return;
  }
  const renameButton = event.target.closest("[data-rename-list]");
  if (renameButton) return openListDialog(renameButton.dataset.renameList);
  const deleteListButton = event.target.closest("[data-delete-list]");
  if (deleteListButton) {
    const list = boardData.lists.find((item) => item.id === deleteListButton.dataset.deleteList);
    if (await askConfirmation("Eliminar fase", `Se eliminará “${list.title}”. Solo es posible si no contiene reuniones.`)) {
      try { await api(`/api/lists/${encodeURIComponent(list.id)}`, { method: "DELETE" }); await reloadBoard("Fase eliminada."); } catch (error) { showToast(error.message); }
    }
    return;
  }
  if (event.target.closest("#add-list-button")) return openListDialog();
});

document.addEventListener("change", async (event) => {
  const select = event.target.closest("[data-move-card]");
  if (!select) return;
  const previous = boardData.cards.find((card) => card.id === select.dataset.moveCard)?.status;
  try { await api(`/api/cards/${encodeURIComponent(select.dataset.moveCard)}`, { method: "PATCH", body: JSON.stringify({ status: select.value }) }); await reloadBoard("Reunión movida."); } catch (error) { select.value = previous; showToast(error.message); }
});

cardForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = document.querySelector("#card-id").value;
  const submit = document.querySelector("#save-card-button");
  const payload = {
    title: document.querySelector("#card-title").value,
    description: document.querySelector("#card-description").value,
    week: document.querySelector("#card-week").value,
    date: document.querySelector("#card-date").value,
    time: document.querySelector("#card-time").value,
    ownerId: document.querySelector("#card-owner").value,
    status: document.querySelector("#card-status").value,
    attendees: [...cardForm.querySelectorAll('[name="attendees"]:checked')].map((input) => input.value),
  };
  submit.disabled = true; submit.textContent = "Guardando…";
  try {
    await api(id ? `/api/cards/${encodeURIComponent(id)}` : "/api/cards", { method: id ? "PATCH" : "POST", body: JSON.stringify(payload) });
    cardDialog.close(); await reloadBoard(id ? "Reunión actualizada." : "Reunión creada.");
  } catch (error) { document.querySelector("#card-form-error").textContent = error.message; }
  finally { submit.disabled = false; submit.textContent = "Guardar reunión"; }
});

document.querySelector("#delete-card-button").addEventListener("click", async () => {
  const id = document.querySelector("#card-id").value;
  const card = boardData.cards.find((item) => item.id === id);
  if (await askConfirmation("Eliminar reunión", `Se eliminará “${card.title}”. Esta acción no se puede deshacer.`)) {
    await api(`/api/cards/${encodeURIComponent(id)}`, { method: "DELETE" });
    cardDialog.close(); await reloadBoard("Reunión eliminada.");
  }
});

listForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = document.querySelector("#list-id").value;
  try {
    await api(id ? `/api/lists/${encodeURIComponent(id)}` : "/api/lists", { method: id ? "PATCH" : "POST", body: JSON.stringify({ title: document.querySelector("#list-title").value }) });
    listDialog.close(); await reloadBoard(id ? "Fase renombrada." : "Fase creada.");
  } catch (error) { document.querySelector("#list-form-error").textContent = error.message; }
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => document.querySelector(`#${button.dataset.closeDialog}`).close()));
document.querySelector("#new-card-button").addEventListener("click", () => openCardDialog());
document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));

const searchButton = document.querySelector("#search-button");
const searchPanel = document.querySelector("#search-panel");
const searchInput = document.querySelector("#search-input");
searchButton.addEventListener("click", () => {
  const opening = searchPanel.hidden;
  searchPanel.hidden = !opening; document.querySelector("#profile-menu").hidden = true;
  searchButton.setAttribute("aria-expanded", String(opening));
  if (opening) searchInput.focus();
});
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLocaleLowerCase("es");
  const results = query ? boardData.cards.filter((card) => `${card.title} ${card.description} ${getMember(card.ownerId)?.name}`.toLocaleLowerCase("es").includes(query)) : [];
  document.querySelector("#search-summary").textContent = query ? `${results.length} ${results.length === 1 ? "resultado" : "resultados"}` : "Escribe para filtrar las reuniones.";
  document.querySelector("#search-results").innerHTML = results.map((card) => `<button type="button" data-edit-card="${escapeHtml(card.id)}"><strong>${escapeHtml(card.title)}</strong><span>${escapeHtml(card.week)} · ${escapeHtml(formatDate(card.date, card.time))}</span></button>`).join("") || (query ? '<p class="empty-search">No encontramos reuniones con ese criterio.</p>' : "");
});

const profileButton = document.querySelector("#profile-button");
profileButton.addEventListener("click", () => {
  const menu = document.querySelector("#profile-menu");
  const opening = menu.hidden;
  menu.hidden = !opening; searchPanel.hidden = true;
  profileButton.setAttribute("aria-expanded", String(opening));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    searchPanel.hidden = true; document.querySelector("#profile-menu").hidden = true;
    document.querySelectorAll("[data-list-menu-panel]").forEach((panel) => { panel.hidden = true; });
  }
});

loadBoard();
