/* =========================================================
   AURORA – script refactorizado
   - Módulo IIFE para evitar globales
   - Delegación de eventos para filtros
   - Lectura XLSX coherente con ArrayBuffer
   - UI helpers unificados
   - Export a Excel robusto
   ========================================================= */
(() => {
  "use strict";

  /* =============================
     Constantes / Selectores
  ============================== */
  const SELECTORS = {
    form: "#fileForm",
    file1: "#file1",
    clearBtn: "#clearButton",
    errorMsg: "#errorMessage",
    resultsContainer: "#resultContainer",
    resultsTable: "#results__table",
    filtersFieldset: "#filterOptions",
    filterOptions: "#filterOptions",
    lastReadIndicator: "#lastReadIndicator",
    lastReadValue: "#lastReadValue",
    btnScrollLastRead: "#scrollLastRead",
    btnClearLastRead: "#clearLastRead",
  };

  const COLUMNS_TO_SHOW = [12, 19, 0, 4, 1, 5, 48, 11, 14, 15]; // orden de columnas en la tabla

  const STORAGE = {
    LAST_READ_KEY: "ultimaIncidenciaAurora",
  };

  /* =============================
     Utilidades generales de UI
  ============================== */
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

  function show(el, display = "block") {
    if (!el) return;
    el.style.display = display;               // fuerza block, vence el CSS
    if (el.classList.contains("results")) {
      el.classList.add("results--visible");
    }
  }

  function hide(el) {
    if (!el) return;
    el.style.display = "none";
    if (el.classList.contains("results")) {
      el.classList.remove("results--visible");
    }
  }

  function setText(el, text) {
    if (el) el.textContent = text;
  }

  function showError(message) {
    const box = $(SELECTORS.errorMsg);
    if (!box) return;
    box.textContent = message;
    box.style.display = "block";
    window.setTimeout(() => (box.style.display = "none"), 5000);
  }

  /* =============================
     Persistencia: última leída
  ============================== */
  const LastRead = {
    get() {
      try {
        return localStorage.getItem(STORAGE.LAST_READ_KEY) || null;
      } catch {
        return null;
      }
    },
    set(id) {
      try {
        localStorage.setItem(STORAGE.LAST_READ_KEY, id);
      } catch { }
      this.updateUI();
    },
    clear() {
      try {
        localStorage.removeItem(STORAGE.LAST_READ_KEY);
      } catch { }
      this.updateUI();
      const table = $(SELECTORS.resultsTable);
      if (table) $$(".row-last-read", table).forEach((tr) => tr.classList.remove("row-last-read"));
    },
    updateUI() {
      const indicator = $(SELECTORS.lastReadIndicator);
      const valueEl = $(SELECTORS.lastReadValue);
      const last = this.get();
      if (!indicator || !valueEl) return;
      if (last) {
        indicator.hidden = false;
        setText(valueEl, last);
      } else {
        indicator.hidden = true;
        setText(valueEl, "—");
      }
    },
    highlightInTable() {
      const last = this.get();
      const table = $(SELECTORS.resultsTable);
      if (!table || !last) return;
      $$(".row-last-read", table).forEach((tr) => tr.classList.remove("row-last-read"));
      $$(".results__table tbody tr", table.parentElement || document).forEach((tr) => {
        const firstCell = tr.querySelector("td a, td");
        if (firstCell && firstCell.textContent?.trim() === last) tr.classList.add("row-last-read");
      });
    },
    scrollTo() {
      const table = $(SELECTORS.resultsTable);
      const last = this.get();
      if (!table || !last) return;
      const tr = $$(".results__table tbody tr", table.parentElement || document).find((r) => {
        const firstCell = r.querySelector("td a, td");
        return firstCell && firstCell.textContent?.trim() === last;
      });
      if (tr) {
        tr.scrollIntoView({ behavior: "smooth", block: "center" });
        tr.classList.add("row-last-read");
      }
    },
  };

  /* =============================
     Helpers de datos
  ============================== */
  /**
   * Convierte 'DD/MM/YYYY HH:MM:SS' en Date | null
   */
  function parseDate(dateString) {
    if (!dateString) return null;
    const [datePart, timePart] = String(dateString).split(" ");
    if (!datePart || !timePart) return null;
    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);
    return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, seconds || 0);
  }

  /**
   * 'Xh Ym Zs' -> seconds
   */
  function convertToSeconds(timeString) {
    if (!timeString || typeof timeString !== "string") return 0;
    const m = timeString.match(/(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/);
    if (!m) return 0;
    const [, h = 0, mnt = 0, s = 0] = m.map((v) => (v ? Number(v) : 0));
    return h * 3600 + mnt * 60 + s;
  }

  function getCategoryByFirstChar(char) {
    switch (char) {
      case "I":
        return "Incidencia";
      case "S":
        return "Solicitud";
      case "R":
        return "Reclamación";
      case "A":
        return "Agradecimiento / Sugerencia";
      case "P":
        return "Petición";
      case "V":
        return "Inspección visual";
      default:
        return char;
    }
  }

  /* =============================
     Construcción de tabla
  ============================== */
  function buildTable(data) {
    const container = $(SELECTORS.resultsContainer);
    if (!container) return;

    container.innerHTML = ""; // limpiar
    const table = document.createElement("table");
    table.className = "results__table";
    table.id = "results__table";
    table.setAttribute("role", "table");

    // thead
    const thead = document.createElement("thead");
    const trh = document.createElement("tr");
    COLUMNS_TO_SHOW.forEach((colIndex) => {
      const th = document.createElement("th");
      th.textContent = data[0][colIndex] || `Columna ${colIndex + 1}`;
      th.scope = "col";
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);

    // tbody
    const tbody = document.createElement("tbody");
    const frag = document.createDocumentFragment();

    const sorted = data.slice(1).sort((a, b) => (parseFloat(b[12]) || 0) - (parseFloat(a[12]) || 0));
    sorted.forEach((row) => {
      const tr = document.createElement("tr");

      if (row[13] === "Finalizada") tr.classList.add("italic");
      if (row[3] && !String(row[3]).includes("HUMV")) tr.classList.add("bold");

      COLUMNS_TO_SHOW.forEach((colIndex) => {
        const td = document.createElement("td");

        if (colIndex === 11) {
          td.textContent = getCategoryByFirstChar(row[colIndex]) || "";
        } else if (colIndex === 12) {
          const link = document.createElement("a");
          link.href = `https://aurora.intranet.humv.es/aurora-ui/index.zul?idPeticionAurora=${row[colIndex]}`;
          link.title = row[16] || "";
          link.textContent = row[colIndex] ?? "";
          link.target = "_blank";

          // guardar última leída en distintos patrones de click
          const saveLast = () => {
            const id = link.textContent?.trim();
            if (id) LastRead.set(id);
          };
          link.addEventListener("click", saveLast);
          link.addEventListener("auxclick", (e) => e.button === 1 && saveLast());
          link.addEventListener("mouseup", (e) => (e.button === 1 || e.button === 2) && saveLast());
          link.addEventListener("contextmenu", saveLast);

          td.appendChild(link);
        } else {
          td.textContent = row[colIndex] ?? "";
        }

        tr.appendChild(td);
      });

      frag.appendChild(tr);
    });

    tbody.appendChild(frag);
    table.appendChild(tbody);

    // Botón exportar
    const btn = document.createElement("button");
    btn.id = "exportarExcel";
    btn.type = "button";
    btn.innerHTML = `Exportar a <img id="imagen-excel" src="img/excel.png" alt="Excel" />`;

    container.appendChild(btn);
    container.appendChild(table);

    show(container);
    LastRead.updateUI();
    LastRead.highlightInTable();
  }

  /* =============================
     Filtros
  ============================== */
  function applyFilters(data) {
    const showClaims = $("#showClaims")?.checked;
    const showAudits = $("#showAudits")?.checked;
    const showPending = $("#showPending")?.checked;
    const showAlerts = $("#showAlerts")?.checked;

    // Si no hay filtros, devolvemos todo (excepto cabecera)
    if (!showClaims && !showAudits && !showPending && !showAlerts) {
      return [data[0], ...data.slice(1)];
    }

    const set = new Set(); // evitar duplicados
    const bodyRows = data.slice(1);

    if (showClaims) {
      bodyRows.forEach((row) => {
        if (row[11] && String(row[11]).includes("R")) set.add(row);
      });
    }

    if (showAudits) {
      bodyRows.forEach((row) => {
        const tResp = convertToSeconds(row[0]);
        const tResol = convertToSeconds(row[1]);
        const maxResp = convertToSeconds(row[4]);
        const maxResol = convertToSeconds(row[5]);

        const audit = maxResp > 0 && maxResol > 0 && (tResp > maxResp || tResol >= maxResol);
        if (audit) set.add(row);
      });
    }

    if (showPending) {
      bodyRows.forEach((row) => {
        const t49 = convertToSeconds(row[48]); // col 49 (idx 48)
        if (t49 > 0) set.add(row);
      });
    }

    if (showAlerts) {
      bodyRows.forEach((row) => {
        const g = String(row[14] || "").toLowerCase();
        const s = String(row[15] || "").toLowerCase();
        if (g.includes("urgencia") || g.includes("emergencia") || s.includes("urgencia") || s.includes("emergencia")) {
          set.add(row);
        }
      });
    }

    return [data[0], ...Array.from(set)];
  }

  function enableFilters() {
    const fs = document.querySelector("#filterOptions");
    if (!fs) return;
    fs.disabled = false;
    show(fs); // ahora sí lo muestra
  }

  function disableFilters() {
    const fs = $(SELECTORS.filtersFieldset);
    if (!fs) return;
    fs.disabled = true;
    hide(fs);
  }

  /* =============================
     Lectura y pintado
  ============================== */
  function scrollToFilters() {
    const fs = document.querySelector('#filterOptions');
    if (!fs) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const offset = 12; // separa un poco del borde superior
    const y = fs.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
      top: y,
      behavior: prefersReduced ? 'auto' : 'smooth'
    });
  }

  function handleDataAndRender(allRows) {
    enableFilters();

    // Reiniciar checkboxes a falso (sin duplicar listeners)
    $$('#filterOptions input[type="checkbox"]').forEach((cb) => (cb.checked = false));

    // Primera pintada (sin filtros)
    renderTable(allRows);

    // Espera un frame para asegurar layout, y scroll suave a filtros
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToFilters());
    });

    // Delegación de eventos para los filtros
    const filterRoot = $(SELECTORS.filterOptions);
    if (filterRoot && !filterRoot.dataset.bound) {
      filterRoot.addEventListener("change", (e) => {
        if (!(e.target instanceof HTMLInputElement)) return;
        if (!e.target.matches('input[type="checkbox"]')) return;
        renderTable(allRows);
      });
      filterRoot.dataset.bound = "1";
    }
  }

  function renderTable(data) {
    const filtered = applyFilters(data);
    buildTable(filtered);
  }



  /* =============================
     Exportar a Excel
  ============================== */
  function exportToExcel() {
    const table = $(SELECTORS.resultsTable);
    if (!table) {
      alert("La tabla no existe");
      return;
    }
    const cloned = table.cloneNode(true);

    // quitar enlaces
    cloned.querySelectorAll("a").forEach((a) => {
      const text = a.textContent || a.innerText || "";
      a.replaceWith(document.createTextNode(text));
    });

    try {
      const ws = XLSX.utils.table_to_sheet(cloned);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "AURORA");

      const now = new Date();
      const formatted = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
      XLSX.writeFile(wb, `aurora_${formatted}.xlsx`);
    } catch (err) {
      console.error("Error al exportar la tabla:", err);
      alert("Ocurrió un error al exportar la tabla");
    }
  }

  /* =============================
     Eventos principales
  ============================== */
  document.addEventListener("DOMContentLoaded", () => {
    // Última leída: UI + botones
    LastRead.updateUI();

    const btnClearLast = $(SELECTORS.btnClearLastRead);
    const btnScrollLast = $(SELECTORS.btnScrollLastRead);
    const btnOpenAurora = document.getElementById('openAurora');

    btnClearLast && btnClearLast.addEventListener("click", () => LastRead.clear());
    btnScrollLast && btnScrollLast.addEventListener("click", () => LastRead.scrollTo());
    btnOpenAurora?.addEventListener('click', () => {
      const id = LastRead.get();
      if (id) {
        const url = `https://aurora.intranet.humv.es/aurora-ui/index.zul?idPeticionAurora=${encodeURIComponent(id)}`;
        window.open(url, '_blank');
      } else {
        alert('No hay ninguna incidencia guardada.');
      }
    });

    // Form submit: leer 1 archivo
    const form = $(SELECTORS.form);
    form?.addEventListener("submit", (event) => {
      event.preventDefault();

      const file = $(SELECTORS.file1)?.files?.[0];
      if (!file) {
        showError("Por favor, selecciona un archivo.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) throw new Error("Archivo vacío o ilegible.");

          // Tipo 'array' porque usamos ArrayBuffer
          const wb = XLSX.read(data, { type: "array" });

          // (Opcional) Leer fecha de B22 en la segunda hoja
          const sheet2 = wb.Sheets[wb.SheetNames[1]];
          const _fecha = sheet2?.["B22"] ? parseDate(sheet2["B22"].v) : null;
          // (no se usa, pero lo dejamos para futuras necesidades)

          const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: "" });
          if (!rows.length) {
            showError("El archivo está vacío o no contiene datos legibles.");
            return;
          }

          handleDataAndRender(rows);
        } catch (err) {
          console.error(err);
          showError("Ocurrió un error al procesar el archivo.");
        }
      };
      reader.readAsArrayBuffer(file);
    });

    // Botón limpiar UI rápida
    $(SELECTORS.clearBtn)?.addEventListener("click", () => {
      hide($(SELECTORS.resultsContainer));
      disableFilters();
      const file1 = $(SELECTORS.file1);
      if (file1) file1.value = "";
    });

    // Exportar a Excel (delegación a nivel documento)
    document.addEventListener("click", (e) => {
      const btn = e.target && (e.target.closest?.("#exportarExcel"));
      if (btn) exportToExcel();
    });
  });
})();