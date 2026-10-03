let playerData = [];
let filteredPlayers = [];
let sortKey = "year";
let sortDirection = 1;


const tableBody = document.getElementById("playerTableBody");

fetch("https://cjhutch09.github.io/COP4813/Assignment6/file.json")
    
	.then(function (response) {
        if (!response.ok) {
            throw new Error("Unable to load file.json");
        }

        return response.json();
    })
    .then(function (data) {
        console.log(data);
    playerData = Array.isArray(data.players) ? data.players : [];
    filteredPlayers = [...playerData];
    renderTable();
    })
    .catch(function (error) {
        console.error(error);
        jsonError.textContent = "The  data could not be loaded.";
        tableBody.innerHTML = "The  data could not be loaded.";
    });

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
    tableBody.innerHTML = "";
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


