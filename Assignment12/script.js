const dataFile = "https://cjhutch09.github.io/COP4813/Assignment12/data.json";

function makeLink(link, className = "source-link") {
  if (!link || !link.url) return document.createTextNode("");
  const anchor = document.createElement("a");
  anchor.href = link.url;
  anchor.textContent = link.label || link.url;
  anchor.className = className;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  return anchor;
}

function appendTextAndSource(cell, text, source) {
  cell.append(document.createTextNode(text || "Not specified"));
  if (source) {
    cell.append(document.createElement("br"), makeLink(source));
  }
}

function renderTable(systems) {
  const tbody = document.getElementById("cms-table-body");
  tbody.replaceChildren();

  systems.forEach((cms) => {
    const row = document.createElement("tr");

    const name = document.createElement("td");
    name.textContent = cms.name;
    row.append(name);

    const support = document.createElement("td");
    appendTextAndSource(support, cms.support, cms.supportSource);
    row.append(support);

    const technology = document.createElement("td");
    appendTextAndSource(technology, cms.technology, cms.technologySource);
    row.append(technology);

    const capabilities = document.createElement("td");
    appendTextAndSource(capabilities, cms.capabilities, cms.capabilitiesSource);
    row.append(capabilities);

    const limitations = document.createElement("td");
    appendTextAndSource(limitations, cms.limitations, cms.limitationsSource);
    row.append(limitations);

    const examples = document.createElement("td");
    (cms.examples || []).forEach((example) => {
      examples.append(makeLink(example, "example-link"));
    });
    row.append(examples);

    tbody.append(row);
  });
}

async function loadCmsData() {
  const tbody = document.getElementById("cms-table-body");
  try {
    const response = await fetch(dataFile);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("JSON must contain an array.");
    renderTable(data);
  } catch (error) {
    tbody.replaceChildren();
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.className = "status";
    cell.textContent = "Could not load data from json";
    row.append(cell);
    tbody.append(row);
    console.error("CMS data loading failed:", error);
  }
}

loadCmsData();
