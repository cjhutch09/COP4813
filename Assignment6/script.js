let playerData = [];
let filteredPlayers = [];
let sortKey = "year";
let sortDirection = 1;

const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");
const recordCount = document.getElementById("recordCount");
const playerCount = document.getElementById("playerCount");
const highestPpg = document.getElementById("highestPpg");
const searchInput = document.getElementById("searchInput");
const yearFilter = document.getElementById("yearFilter");
const tableBody = document.getElementById("playerTableBody");
const resultSummary = document.getElementById("resultSummary");
import data from './data.json' with { type: 'json' };

console.log(data);
fetch("./file.json")
    .then(function (response) {
        if (!response.ok) {
            throw new Error("Unable to load inventory.json");
        }

        return response.json();
    })
    .then(function (inventory) {
        console.log(inventory);
    })
    .catch(function (error) {
        console.error(error);

        jsonError.textContent =
            "The inventory data could not be loaded.";

        tableBody.innerHTML = "";
    });


async function loadData() {
  try {
    const response =  fetch("./file.json");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    playerData = Array.isArray(data.players) ? data.players : [];
    filteredPlayers = [...playerData];

    pageTitle.textContent = `${data.team || "Team"} Player Statistics`;
    pageSubtitle.textContent =
      `${data.range?.start_year ?? ""}–${data.range?.end_year ?? ""} • ${data.statistic || "Player statistics"}`;

    populateYearFilter();
    updateStats();
    renderTable();
  } catch (error) {
    console.error(error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty">
          Unable to load the JSON file. If you opened this page directly
          from your computer, use a local web server because browsers may
          block fetch() from file:// URLs.
        </td>
      </tr>
    `;
  }
}

function populateYearFilter() {
  const years = [...new Set(
    playerData
      .map(player => Number(player.year))
      .filter(Number.isFinite)
  )].sort((a, b) => a - b);

  years.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  });
}

function updateStats() {
  const uniquePlayers = new Set(playerData.map(player => player.name));

  const highest = playerData.reduce((best, player) => {
    return Number(player.avg_scoring_ppg) >
      Number(best?.avg_scoring_ppg ?? -Infinity)
      ? player
      : best;
  }, null);

  recordCount.textContent = playerData.length;
  playerCount.textContent = uniquePlayers.size;

  highestPpg.textContent = highest
    ? `${Number(highest.avg_scoring_ppg).toFixed(1)} — ${highest.name}`
    : "—";
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedYear = yearFilter.value;

  filteredPlayers = playerData.filter(player => {
    const matchesSearch =
      !query ||
      String(player.name ?? "").toLowerCase().includes(query) ||
      String(player.season ?? "").toLowerCase().includes(query) ||
      String(player.year ?? "").includes(query);

    const matchesYear =
      !selectedYear || String(player.year) === selectedYear;

    return matchesSearch && matchesYear;
  });

  renderTable();
}

function sortPlayers(players) {
  return [...players].sort((a, b) => {
    let first = a[sortKey];
    let second = b[sortKey];

    if (sortKey === "year" || sortKey === "avg_scoring_ppg") {
      first = Number(first);
      second = Number(second);
    } else {
      first = String(first ?? "").toLowerCase();
      second = String(second ?? "").toLowerCase();
    }

    if (first < second) return -1 * sortDirection;
    if (first > second) return 1 * sortDirection;
    return 0;
  });
}

function renderTable() {
  const rows = sortPlayers(filteredPlayers);
  tableBody.innerHTML = "";

  if (!rows.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty">No players match your search.</td>
      </tr>
    `;
  } else {
    rows.forEach(player => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${escapeHtml(player.name)}</td>
        <td>${escapeHtml(player.season)}</td>
        <td>${escapeHtml(player.year)}</td>
        <td class="ppg">${Number(player.avg_scoring_ppg).toFixed(1)}</td>
      `;

      tableBody.appendChild(row);
    });
  }

  resultSummary.textContent =
    `Showing ${rows.length} of ${playerData.length} player-season records`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.querySelectorAll("th[data-sort]").forEach(header => {
  header.addEventListener("click", () => {
    const key = header.dataset.sort;

    if (sortKey === key) {
      sortDirection *= -1;
    } else {
      sortKey = key;
      sortDirection = 1;
    }

    renderTable();
  });
});

searchInput.addEventListener("input", applyFilters);
yearFilter.addEventListener("change", applyFilters);

loadData();
