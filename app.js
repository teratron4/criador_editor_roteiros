/* ========================================================================== */
/* COMPORTAMENTOS DO CRIADOR E EDITOR DE ROTEIROS                             */
/* Este arquivo mantém os formulários, validações e armazenamento local.      */
/* ========================================================================== */

/* 1. Chaves versionadas: permitem encontrar os dados no navegador e evoluí-los. */
const STORAGE_KEYS = {
  records: "criadorRoteiros.registros.v1",
  draft: "criadorRoteiros.roteiroAtual.v1",
  formState: "criadorRoteiros.formulario.v2"
};

/* Cole aqui a URL do Web App do Apps Script após implantá-lo. */
const GOOGLE_SHEETS_CONFIG = {
  webAppUrl: "https://script.google.com/macros/s/AKfycbxi0NfuGxiRjlc8Fe0wgWIfFXSZoLrQJ6tICSLypPU-j5Rumi8G2XtZlT3USpVWLSfy/exec"
};

let sheetSubmissionState = null;

/* 2. Cadastro completo das turmas, docentes e disciplinas do projeto. */
/* Os três nomes de Laboratório de Redação foram normalizados para REDAÇÃO. */
const CLASS_DATA = {
  "6º ANO": [
    { professor: "BRUNO CHAVES", disciplinas: ["CIÊNCIAS"] },
    { professor: "KAROLINE DAYANE", disciplinas: ["PORTUGUÊS", "REDAÇÃO", "ARTE"] },
    { professor: "PÁDUA FERREIRA", disciplinas: ["MATEMÁTICA"] },
    { professor: "RUTE OLIVEIRA", disciplinas: ["MLD", "SOCIOEMOCIONAL"] },
    { professor: "MAGNO OLIVEIRA", disciplinas: ["HISTÓRIA"] },
    { professor: "TIAGO TEIXEIRA", disciplinas: ["GEOGRAFIA"] },
    { professor: "PRISCILA RIBEIRO", disciplinas: ["INGLÊS"] },
    { professor: "PAULO SUCUPIRA", disciplinas: ["EDUCAÇÃO FÍSICA"] }
  ],
  "7º ANO": [
    { professor: "BRUNO CHAVES", disciplinas: ["CIÊNCIAS"] },
    { professor: "KAROLINE DAYANE", disciplinas: ["PORTUGUÊS", "REDAÇÃO"] },
    { professor: "ÁQUILA MARQUES", disciplinas: ["ROBÓTICA"] },
    { professor: "PAULO SUCUPIRA", disciplinas: ["EDUCAÇÃO FÍSICA"] },
    { professor: "NATANAEL PEREIRA", disciplinas: ["MATEMÁTICA"] },
    { professor: "RUTE OLIVEIRA", disciplinas: ["MLD", "ARTE", "SOCIOEMOCIONAL"] },
    { professor: "MAGNO OLIVEIRA", disciplinas: ["HISTÓRIA"] },
    { professor: "TIAGO TEIXEIRA", disciplinas: ["GEOGRAFIA"] },
    { professor: "PRISCILA RIBEIRO", disciplinas: ["INGLÊS"] }
  ],
  "8º ANO": [
    { professor: "BRUNO CHAVES", disciplinas: ["QUÍMICA"] },
    { professor: "KAROLINE DAYANE", disciplinas: ["PORTUGUÊS", "REDAÇÃO"] },
    { professor: "ÁQUILA MARQUES", disciplinas: ["ROBÓTICA"] },
    { professor: "PAULO SUCUPIRA", disciplinas: ["EDUCAÇÃO FÍSICA"] },
    { professor: "NATANAEL PEREIRA", disciplinas: ["MATEMÁTICA 1"] },
    { professor: "PÁDUA FERREIRA", disciplinas: ["MATEMÁTICA 2"] },
    { professor: "RUTE OLIVEIRA", disciplinas: ["MLD", "ARTE"] },
    { professor: "MAGNO OLIVEIRA", disciplinas: ["HISTÓRIA"] },
    { professor: "TIAGO TEIXEIRA", disciplinas: ["GEOGRAFIA"] },
    { professor: "PRISCILA RIBEIRO", disciplinas: ["INGLÊS"] },
    { professor: "DANIEL MAIA", disciplinas: ["FÍSICA"] }
  ],
  "9º ANO": [
    { professor: "BRUNO CHAVES", disciplinas: ["BIOLOGIA"] },
    { professor: "KAROLINE DAYANE", disciplinas: ["REDAÇÃO"] },
    { professor: "ÁQUILA MARQUES", disciplinas: ["ROBÓTICA"] },
    { professor: "PAULO SUCUPIRA", disciplinas: ["EDUCAÇÃO FÍSICA"] },
    { professor: "NATANAEL PEREIRA", disciplinas: ["MATEMÁTICA 1"] },
    { professor: "PÁDUA FERREIRA", disciplinas: ["MATEMÁTICA 2"] },
    { professor: "RUTE OLIVEIRA", disciplinas: ["MLD"] },
    { professor: "MAGNO OLIVEIRA", disciplinas: ["HISTÓRIA"] },
    { professor: "RAFAEL MELO", disciplinas: ["PORTUGUÊS"] },
    { professor: "TIAGO TEIXEIRA", disciplinas: ["GEOGRAFIA"] },
    { professor: "DANIEL MAIA", disciplinas: ["FÍSICA"] },
    { professor: "PRISCILA RIBEIRO", disciplinas: ["INGLÊS"] }
  ],
  "1º ANO EM": [
    { professor: "BRUNO CHAVES", disciplinas: ["BIOLOGIA", "QUÍMICA"] },
    { professor: "KAROLINE DAYANE", disciplinas: ["REDAÇÃO"] },
    { professor: "NATANAEL PEREIRA", disciplinas: ["MATEMÁTICA 1"] },
    { professor: "PÁDUA FERREIRA", disciplinas: ["MATEMÁTICA 2"] },
    { professor: "ADERLÂNDIA CASTELO", disciplinas: ["MLD"] },
    { professor: "MAGNO OLIVEIRA", disciplinas: ["FILOSOFIA", "HISTÓRIA"] },
    { professor: "RAFAEL MELO", disciplinas: ["PORTUGUÊS", "LITERATURA"] },
    { professor: "TIAGO TEIXEIRA", disciplinas: ["GEOGRAFIA"] },
    { professor: "DANIEL MAIA", disciplinas: ["FÍSICA"] },
    { professor: "PRISCILA RIBEIRO", disciplinas: ["INGLÊS"] },
    { professor: "PAULO SUCUPIRA", disciplinas: ["EDUCAÇÃO FÍSICA"] }
  ],
  "2º ANO EM": [
    { professor: "BRUNO CHAVES", disciplinas: ["BIOLOGIA", "QUÍMICA"] },
    { professor: "KAROLINE DAYANE", disciplinas: ["REDAÇÃO"] },
    { professor: "PAULO SUCUPIRA", disciplinas: ["EDUCAÇÃO FÍSICA"] },
    { professor: "NATANAEL PEREIRA", disciplinas: ["MATEMÁTICA 1"] },
    { professor: "PÁDUA FERREIRA", disciplinas: ["MATEMÁTICA 2"] },
    { professor: "ADERLÂNDIA CASTELO", disciplinas: ["MLD"] },
    { professor: "MAGNO OLIVEIRA", disciplinas: ["HISTÓRIA", "FILOSOFIA"] },
    { professor: "RAFAEL MELO", disciplinas: ["PORTUGUÊS"] },
    { professor: "TIAGO TEIXEIRA", disciplinas: ["GEOGRAFIA"] },
    { professor: "DANIEL MAIA", disciplinas: ["FÍSICA"] },
    { professor: "PRISCILA RIBEIRO", disciplinas: ["INGLÊS"] }
  ],
  "3º ANO EM": [
    { professor: "BRUNO CHAVES", disciplinas: ["BIOLOGIA", "QUÍMICA"] },
    { professor: "KAROLINE DAYANE", disciplinas: ["REDAÇÃO"] },
    { professor: "PAULO SUCUPIRA", disciplinas: ["EDUCAÇÃO FÍSICA"] },
    { professor: "NATANAEL PEREIRA", disciplinas: ["MATEMÁTICA 1"] },
    { professor: "PÁDUA FERREIRA", disciplinas: ["MATEMÁTICA 2"] },
    { professor: "ADERLÂNDIA CASTELO", disciplinas: ["MLD"] },
    { professor: "MAGNO OLIVEIRA", disciplinas: ["HISTÓRIA", "FILOSOFIA"] },
    { professor: "RAFAEL MELO", disciplinas: ["PORTUGUÊS", "LITERATURA"] },
    { professor: "RUTE OLIVEIRA", disciplinas: ["PDV"] },
    { professor: "TIAGO TEIXEIRA", disciplinas: ["GEOGRAFIA"] },
    { professor: "DANIEL MAIA", disciplinas: ["FÍSICA"] },
    { professor: "PRISCILA RIBEIRO", disciplinas: ["INGLÊS"] }
  ]
};

/* 3. Atalhos para encontrar elementos da página sem repetir seletores longos. */
const byId = (id) => document.getElementById(id);

/* A navegação entre arquivos locais pode separar o localStorage por página.
   Por isso o rascunho também viaja na mesma aba através de window.name. */
const WINDOW_STATE_PREFIX = "__criadorRoteirosCompartilhado__:";
function readWindowState() {
  try {
    if (!window.name.startsWith(WINDOW_STATE_PREFIX)) return {};
    const envelope = JSON.parse(window.name.slice(WINDOW_STATE_PREFIX.length));
    return envelope?.values && typeof envelope.values === "object" ? envelope.values : {};
  } catch (error) {
    return {};
  }
}

function getSharedItem(key) {
  const sharedValue = readWindowState()[key];
  if (typeof sharedValue === "string") return sharedValue;
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function setSharedItem(key, value) {
  const values = readWindowState();
  values[key] = String(value);
  try {
    window.name = `${WINDOW_STATE_PREFIX}${JSON.stringify({ values })}`;
  } catch (error) {
    console.warn("Não foi possível compartilhar o rascunho entre páginas nesta aba.", error);
  }
  try {
    localStorage.setItem(key, String(value));
  } catch (error) {
    /* window.name mantém a continuidade quando o navegador bloqueia o armazenamento local. */
  }
}

function removeSharedItem(key) {
  const values = readWindowState();
  delete values[key];
  try {
    window.name = `${WINDOW_STATE_PREFIX}${JSON.stringify({ values })}`;
  } catch (error) {
    console.warn("Não foi possível remover o rascunho compartilhado nesta aba.", error);
  }
  try {
    localStorage.removeItem(key);
  } catch (error) {
    /* O estado compartilhado da aba já foi atualizado. */
  }
}

function getRawLocalItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

const readRecords = () => {
  try {
    const records = JSON.parse(getSharedItem(STORAGE_KEYS.records) || "[]");
    return Array.isArray(records) ? records : [];
  } catch (error) {
    console.warn("Não foi possível ler os roteiros armazenados.", error);
    return [];
  }
};
const writeRecords = (records) => setSharedItem(STORAGE_KEYS.records, JSON.stringify(records, null, 2));

/* Salva um rascunho de formulário fora do HTML para recuperá-lo em qualquer página. */
function readFormState() {
  try {
    const state = JSON.parse(getSharedItem(STORAGE_KEYS.formState) || "null");
    return state && typeof state === "object" ? state : null;
  } catch (error) {
    console.warn("Não foi possível restaurar o rascunho do formulário.", error);
    return null;
  }
}

function writeFormState(state) {
  setSharedItem(STORAGE_KEYS.formState, JSON.stringify(state));
}

function clearFormDraft() {
  removeSharedItem(STORAGE_KEYS.formState);
  removeSharedItem(STORAGE_KEYS.draft);
  const form = byId("roteiro-form");
  if (!form) return;
  form.reset();
  const output = byId("roteiro-output");
  if (output) output.value = "";
  byId("output-wrap")?.classList.add("hidden");
  byId("chapter-editors")?.replaceChildren();
  const editorContainer = byId("chapter-editors");
  if (editorContainer) {
    editorContainer.className = "chapter-editors empty-state";
    editorContainer.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">post_add</span><span>Selecione um docente para exibir todas as turmas e disciplinas em que leciona.</span>';
  }
  clearFormError();
  refreshSelectionStatus();
  ["etapa", "tipo", "docente"].forEach((id) => {
    const select = byId(id);
    select?.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

/* Guarda cada valor editável para restaurar a turma e a disciplina sem perdas. */
function saveCurrentFormState() {
  /* As outras páginas compartilham registros, mas não possuem estes campos.
     Não grave um estado vazio ao navegar por páginas informativas. */
  if (!byId("roteiro-form")) return;

  const state = readFormState() || { editors: {} };
  state.etapa = byId("etapa")?.value || "";
  state.tipoAvaliacao = byId("tipo")?.value || "";
  state.docente = byId("docente")?.value || "";
  const jsonOutput = byId("roteiro-output");
  if (jsonOutput) {
    state.jsonOutput = jsonOutput.value;
    state.outputVisible = !byId("output-wrap")?.classList.contains("hidden");
  }
  state.editors = state.editors || {};

  document.querySelectorAll(".subject-editor").forEach((editor) => {
    const className = editor.closest(".teacher-editor")?.dataset.class || "";
    const key = `${className}::${editor.dataset.subject || ""}`;
    state.editors[key] = {
      chapters: [...editor.querySelectorAll(".chapter-row")].map((row) => ({
        numero: row.querySelector(".chapter-number")?.value || "",
        conteudo: row.querySelector(".chapter-content")?.value || "",
        pagina: row.querySelector(".chapter-page")?.value || "",
        inserido: row.dataset.inserted === "true"
      })),
      roteiro: editor.querySelector(".discipline-script")?.value || "",
      validated: editor.dataset.validated === "true",
      enviado: editor.dataset.sent === "true",
      chaveEnvio: editor.dataset.sentKey || ""
    };
  });
  writeFormState(state);
}

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));

/* 4. Ícones dos seletores: menus personalizados preservam o valor dos selects nativos. */
const SELECT_OPTION_ICONS = {
  etapa: { default: "school", "ETAPA 1": "looks_one", "ETAPA 2": "looks_two", "ETAPA 3": "looks_3", "ETAPA 4": "looks_4", "RECUPERAÇÃO": "healing" },
  tipo: { default: "task_alt", "AVALIAÇÃO PARCIAL": "task_alt", "AVALIAÇÃO GLOBAL": "select_all", "AVALIAÇÃO DE RECUPERAÇÃO": "restart_alt" },
  docente: { default: "manage_accounts" }
};

function iconForSubject(subject) {
  const name = String(subject || "").toLocaleUpperCase("pt-BR");
  if (/PORTUGUÊS|LÍNGUA|LITERATURA|REDAÇÃO/.test(name)) return "menu_book";
  if (/MATEMÁTICA|FÍSICA/.test(name)) return "calculate";
  if (/QUÍMICA|CIÊNCIAS|BIOLOGIA/.test(name)) return "science";
  if (/SOCIO|SOCIOEMOCIONAL|PDV/.test(name)) return "groups";
  if (/GEOGRAFIA/.test(name)) return "public";
  if (/HISTÓRIA/.test(name)) return "history_edu";
  if (/INGLÊS/.test(name)) return "translate";
  if (/ARTE/.test(name)) return "palette";
  if (/ROBÓTICA/.test(name)) return "precision_manufacturing";
  if (/EDUCAÇÃO FÍSICA/.test(name)) return "sports";
  return "auto_stories";
}

function initializeIconSelect(select) {
  if (!select || select.dataset.iconSelectReady === "true") return;
  select.dataset.iconSelectReady = "true";
  const wrapper = document.createElement("div");
  wrapper.className = "icon-select";
  const trigger = document.createElement("button");
  trigger.className = "icon-select-trigger";
  trigger.type = "button";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-label", select.labels?.[0]?.textContent?.trim() || "Selecionar opção");
  const menu = document.createElement("div");
  menu.className = "icon-select-menu";
  menu.setAttribute("role", "listbox");
  menu.hidden = true;
  wrapper.append(trigger, menu);
  select.parentNode.insertBefore(wrapper, select);
  wrapper.append(select);
  select.classList.add("icon-select-source");
  select.tabIndex = -1;
  select.setAttribute("aria-hidden", "true");

  const iconForOption = (option) => {
    const iconSet = SELECT_OPTION_ICONS[select.id] || {};
    if (iconSet[option.value]) return iconSet[option.value];
    if (iconSet.default) return iconSet.default;
    return select.id === "etapa" ? "school" : (select.id === "tipo" ? "task_alt" : "manage_accounts");
  };
  const draw = () => {
    const selected = select.selectedOptions[0];
    trigger.disabled = select.disabled;
    trigger.innerHTML = `<span class="material-symbols-rounded" aria-hidden="true">${escapeHtml(selected ? iconForOption(selected) : (select.id === "etapa" ? "school" : (select.id === "tipo" ? "task_alt" : "manage_accounts")))}</span><span class="icon-select-value ${selected?.value ? "" : "placeholder"}">${escapeHtml(selected?.textContent?.trim() || "Selecione uma opção")}</span><span class="material-symbols-rounded icon-select-chevron" aria-hidden="true">expand_more</span>`;
    menu.replaceChildren();
    let hasOption = false;
    [...select.options].forEach((option) => {
      if (option.disabled && option.getAttribute("aria-hidden") === "true" && !option.value) {
        if (hasOption) {
          const separator = document.createElement("div");
          separator.className = "icon-select-separator";
          separator.setAttribute("role", "separator");
          menu.append(separator);
        }
        return;
      }
      const item = document.createElement("button");
      item.type = "button";
      item.className = "icon-select-option";
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(option.value === select.value && Boolean(option.value)));
      item.disabled = option.disabled;
      item.innerHTML = `<span class="material-symbols-rounded" aria-hidden="true">${escapeHtml(iconForOption(option))}</span><span>${escapeHtml(option.textContent.trim())}</span>`;
      item.addEventListener("click", () => {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        close();
        trigger.focus();
      });
      menu.append(item);
      hasOption = true;
    });
  };
  const close = () => {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    wrapper.classList.remove("open");
  };
  const open = () => {
    if (select.disabled) return;
    draw();
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    wrapper.classList.add("open");
    menu.querySelector('[aria-selected="true"]:not(:disabled)')?.scrollIntoView({ block: "nearest" });
  };
  trigger.addEventListener("click", () => menu.hidden ? open() : close());
  trigger.addEventListener("keydown", (event) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      if (menu.hidden) open();
      menu.querySelector(".icon-select-option:not(:disabled)")?.focus();
    }
  });
  menu.addEventListener("keydown", (event) => {
    const options = [...menu.querySelectorAll(".icon-select-option:not(:disabled)")];
    const currentIndex = options.indexOf(document.activeElement);
    if (event.key === "Escape") { event.preventDefault(); close(); trigger.focus(); }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = event.key === "ArrowDown" ? currentIndex + 1 : currentIndex - 1;
      options[Math.max(0, Math.min(options.length - 1, next))]?.focus();
    }
    if (event.key === "Home") { event.preventDefault(); options[0]?.focus(); }
    if (event.key === "End") { event.preventDefault(); options.at(-1)?.focus(); }
  });
  select.addEventListener("change", draw);
  new MutationObserver(draw).observe(select, { childList: true, subtree: true, attributes: true });
  document.addEventListener("click", (event) => {
    /* Use the composed event path: it remains reliable for nested icon/text
       targets inside the trigger and avoids closing the menu just opened. */
    if (!event.composedPath().includes(wrapper)) close();
  });
  draw();
}

function initializeIconSelects() {
  ["etapa", "tipo", "docente"].forEach((id) => initializeIconSelect(byId(id)));
}

/* 5. Comportamento comum: menu colapsável adequado a telas pequenas. */
function initializeMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const navigation = byId("site-nav");
  if (!toggle || !navigation) return;

  toggle.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    toggle.innerHTML = `<span class="material-symbols-rounded" aria-hidden="true">${isOpen ? "close" : "menu"}</span>`;
  });
}

/* 5. Mantém avaliação e etapa sincronizadas, com separadores e opção de recuperação. */
function initializeAssessmentSelectors() {
  const stageSelect = byId("etapa");
  const typeSelect = byId("tipo");
  if (!stageSelect || !typeSelect) return;

  const savedState = readFormState();
  const recoveryIsAvailable = new Date().getMonth() >= 9;
  const recoveryStage = stageSelect.querySelector('[data-recovery="true"]');
  if (recoveryStage) recoveryStage.disabled = !recoveryIsAvailable;
  const updateAssessmentTypes = () => {
    const isRecoveryStage = stageSelect.value === "RECUPERAÇÃO";
    typeSelect.replaceChildren(new Option("SELECIONE O TIPO DE AVALIAÇÃO", ""));

    const partialOption = new Option("AVALIAÇÃO PARCIAL", "AVALIAÇÃO PARCIAL");
    const globalOption = new Option("AVALIAÇÃO GLOBAL", "AVALIAÇÃO GLOBAL");
    partialOption.disabled = isRecoveryStage;
    globalOption.disabled = isRecoveryStage;
    typeSelect.append(partialOption, globalOption);

    const separator = new Option("─".repeat(100), "");
    separator.disabled = true;
    separator.setAttribute("aria-hidden", "true");
    typeSelect.appendChild(separator);

    const recoveryType = new Option("AVALIAÇÃO DE RECUPERAÇÃO", "AVALIAÇÃO DE RECUPERAÇÃO");
    recoveryType.disabled = !isRecoveryStage || !recoveryIsAvailable;
    typeSelect.appendChild(recoveryType);
    typeSelect.disabled = !stageSelect.value;
    refreshSelectionStatus();
  };

  stageSelect.addEventListener("change", () => {
    updateAssessmentTypes();
    saveCurrentFormState();
  });
  typeSelect.addEventListener("change", saveCurrentFormState);
  if (savedState?.etapa) {
    stageSelect.value = savedState.etapa;
    updateAssessmentTypes();
    if (savedState.tipoAvaliacao) typeSelect.value = savedState.tipoAvaliacao;
  }
}

/* 6. Reúne os docentes únicos sem exigir que a pessoa escolha uma turma. */
function initializeRosterSelectors() {
  const teacherSelect = byId("docente");
  if (!teacherSelect) return;

  const teachers = [...new Set(Object.values(CLASS_DATA).flat().map((entry) => entry.professor))]
    .sort((first, second) => first.localeCompare(second, "pt-BR"));
  teachers.forEach((teacher) => teacherSelect.add(new Option(teacher, teacher)));
  teacherSelect.disabled = false;
  const savedState = readFormState();
  if (savedState?.docente && teachers.includes(savedState.docente)) {
    teacherSelect.value = savedState.docente;
    renderChapterEditors();
    if (savedState.etapa && byId("etapa")) {
      byId("etapa").value = savedState.etapa;
      byId("etapa").dispatchEvent(new Event("change", { bubbles: true }));
      if (byId("tipo")) byId("tipo").value = savedState.tipoAvaliacao || "";
    }
    const jsonOutput = byId("roteiro-output");
    if (jsonOutput && savedState.outputVisible) {
      jsonOutput.value = savedState.jsonOutput || "";
      byId("output-wrap")?.classList.remove("hidden");
    }
    refreshSelectionStatus();
  }
  teacherSelect.addEventListener("change", () => {
    renderChapterEditors();
    refreshSelectionStatus();
    saveCurrentFormState();
  });
}

/* 7. Mantém a orientação coerente com a avaliação e o docente selecionados. */
function refreshSelectionStatus() {
  const status = byId("selection-status");
  const stage = byId("etapa")?.value;
  const type = byId("tipo")?.value;
  const teacher = byId("docente")?.value;
  if (!status) return;

  let message = "Escolha a etapa, o tipo de avaliação e o docente para gerar os roteiros de todas as turmas dele.";
  if (teacher && stage && type) {
    const classCount = Object.values(CLASS_DATA).filter((entries) => entries.some((entry) => entry.professor === teacher)).length;
    message = `${teacher} leciona em ${classCount} turma(s). Todas as disciplinas e turmas correspondentes serão exibidas.`;
  } else if (teacher) {
    message = `Docente selecionado: ${teacher}. Complete os dados da avaliação para organizar o roteiro.`;
  } else if (stage) {
    message = "Agora selecione o tipo de avaliação e o docente.";
  }
  status.innerHTML = `<span class="material-symbols-rounded" aria-hidden="true">info</span><span>${escapeHtml(message)}</span>`;
}

function submissionContextKey() {
  return [byId("etapa")?.value || "", byId("tipo")?.value || "", byId("docente")?.value || ""]
    .map((value) => String(value).trim().toLocaleUpperCase("pt-BR")).join("::");
}

/* 8. Agrupa todas as aulas do docente e monta um editor por turma/disciplina. */
function renderChapterEditors() {
  const container = byId("chapter-editors");
  if (!container) return;
  const teacher = byId("docente")?.value;
  const error = byId("discipline-error");
  const classes = Object.entries(CLASS_DATA)
    .map(([className, entries]) => ({ className, entry: entries.find((item) => item.professor === teacher) }))
    .filter((item) => item.entry);

  if (!teacher || classes.length === 0) {
    container.className = "chapter-editors empty-state";
    container.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">post_add</span><span>Selecione um docente para exibir todas as turmas e disciplinas em que leciona.</span>';
    if (error) error.classList.add("hidden");
    return;
  }

  const savedState = readFormState();
  const savedEditors = savedState?.editors || {};
  container.className = "chapter-editors";
  container.innerHTML = classes.map(({ className, entry }, classIndex) => {
    const segment = className.includes("EM") ? "ENSINO MÉDIO" : "ENSINO FUNDAMENTAL 2";
    return `
      <section class="teacher-editor" data-class="${escapeHtml(className)}" aria-label="Roteiros de ${escapeHtml(teacher)} para ${escapeHtml(className)}">
        <header class="teacher-editor-header">
          <div class="class-context"><span class="material-symbols-rounded roster-class-icon" aria-hidden="true">school</span><span class="segment-label">${segment}</span><span class="segment-divider">|</span><span class="class-badge">${escapeHtml(className)}</span></div>
          <div class="teacher-context"><span class="material-symbols-rounded teacher-icon" aria-hidden="true">manage_accounts</span><span class="teacher-name">${escapeHtml(teacher)}</span></div>
        </header>
        ${entry.disciplinas.map((subject, subjectIndex) => {
          const saved = savedEditors[`${className}::${subject}`] || {};
          const currentKey = submissionContextKey();
          const wasSentInCurrentContext = saved.enviado && saved.chaveEnvio === currentKey;
          const chapters = Array.isArray(saved.chapters) && saved.chapters.length ? saved.chapters : [{}];
          return `
          <div class="subject-editor" data-subject="${escapeHtml(subject)}" data-class-index="${classIndex}" data-subject-index="${subjectIndex}" data-validated="${saved.validated ? "true" : "false"}" data-sent="${wasSentInCurrentContext ? "true" : "false"}" data-sent-key="${escapeHtml(saved.chaveEnvio || "")}">
            <h3 class="subject-editor-title"><span class="material-symbols-rounded" aria-hidden="true">${escapeHtml(iconForSubject(subject))}</span><span>${escapeHtml(subject)}</span>${wasSentInCurrentContext ? '<span class="sent-status" role="status">JÁ ENVIADO</span>' : ""}</h3>
            <div class="chapter-rows">${chapters.map((chapter, chapterIndex) => createChapterRow(classIndex, subjectIndex, chapterIndex, chapter)).join("")}</div>
            <div class="chapter-tools"><span class="field-hint">Informe o título do capítulo e a primeira página de referência; os campos numéricos aceitam apenas algarismos.</span><div class="chapter-actions"><button class="button-small add-chapter" type="button"><span class="material-symbols-rounded" aria-hidden="true">add</span> + NOVO CAPÍTULO</button><button class="button-small insert-chapter-content validate-script-button" type="button"><span class="material-symbols-rounded" aria-hidden="true">playlist_add_check</span> VALIDAR ROTEIRO</button></div></div>
            <label class="field-label custom-script-label" for="script-${classIndex}-${subjectIndex}"><span class="material-symbols-rounded" aria-hidden="true">edit_note</span> Roteiro editável · ${escapeHtml(subject)}</label>
            <textarea id="script-${classIndex}-${subjectIndex}" class="discipline-script" rows="4" placeholder="Clique em VALIDAR ROTEIRO para acrescentar os capítulos abaixo. Você também pode editar este texto livremente." aria-label="Roteiro editável de ${escapeHtml(subject)} em ${escapeHtml(className)}">${escapeHtml(saved.roteiro || "")}</textarea>
            <div class="script-action-row"><button class="button button-primary send-discipline-button" type="button" ${saved.validated ? "" : "hidden"}><span class="material-symbols-rounded" aria-hidden="true">send</span> ENVIAR ROTEIRO</button></div>
          </div>
        `;
        }).join("")}
      </section>
    `;
  }).join("");

  container.querySelectorAll(".add-chapter").forEach((button) => button.addEventListener("click", () => {
    const subjectEditor = button.closest(".subject-editor");
    const rows = subjectEditor.querySelector(".chapter-rows");
    const nextIndex = rows.querySelectorAll(".chapter-row").length;
    rows.insertAdjacentHTML("beforeend", createChapterRow(
      Number(subjectEditor.dataset.classIndex), Number(subjectEditor.dataset.subjectIndex), nextIndex
    ));
    attachNumericInputRules(rows.lastElementChild);
    subjectEditor.dataset.validated = "false";
    subjectEditor.querySelector(".send-discipline-button").hidden = true;
    saveCurrentFormState();
  }));
  container.querySelectorAll(".insert-chapter-content").forEach((button) => button.addEventListener("click", () => {
    const subjectEditor = button.closest(".subject-editor");
    const rows = [...subjectEditor.querySelectorAll(".chapter-row")];
    try {
      const target = subjectEditor.querySelector(".discipline-script");
      const activeRows = rows.filter((row) => [".chapter-number", ".chapter-content", ".chapter-page"]
        .some((selector) => row.querySelector(selector).value.trim()));
      if (!activeRows.length && !target.value.trim()) throw new Error(`Preencha e valide o roteiro de ${subjectEditor.dataset.subject} antes de enviar.`);
      let lines = [];
      if (activeRows.length) {
        lines = activeRows.map((row) => {
          const numberField = row.querySelector(".chapter-number");
          const contentField = row.querySelector(".chapter-content");
          const pageField = row.querySelector(".chapter-page");
          const number = numberField.value.trim();
          contentField.value = capitalizeInitial(contentField.value);
          const content = normalizeContent(contentField.value);
          const page = pageField.value.trim();
          let valid = true;
          [[numberField, number], [contentField, content], [pageField, page]].forEach(([field, value]) => {
            if (!value) { field.setAttribute("aria-invalid", "true"); valid = false; }
            else field.removeAttribute("aria-invalid");
          });
          if (!valid) throw new Error(`Complete capítulo, conteúdo e página de ${subjectEditor.dataset.subject} antes de validar.`);
          contentField.value = content;
          row.dataset.inserted = "true";
          return `CAP ${number} [ ${page} ]: ${content}`;
        });
        // Cada validação recompõe o textarea a partir dos campos atuais, sem duplicar o roteiro anterior.
        target.value = lines.join("\n");
        target.dispatchEvent(new Event("input", { bubbles: true }));
      }
      target.focus();
      subjectEditor.dataset.validated = "true";
      subjectEditor.querySelector(".send-discipline-button").hidden = false;
      saveCurrentFormState();
      clearFormError();
    } catch (error) {
      showFormError(error.message || "Revise os campos destacados antes de inserir o conteúdo.");
    }
  }));
  container.querySelectorAll(".send-discipline-button").forEach((button) => button.addEventListener("click", async () => {
    const subjectEditor = button.closest(".subject-editor");
    if (!subjectEditor || subjectEditor.dataset.validated !== "true") return;
    clearFormError();
    try {
      const record = collectDisciplineRecord(subjectEditor);
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      await submitRecordToGoogleSheets(record);
      subjectEditor.dataset.sent = "true";
      subjectEditor.dataset.sentKey = submissionContextKey();
      subjectEditor.dataset.validated = "false";
      button.hidden = true;
      const title = subjectEditor.querySelector(".subject-editor-title");
      if (title && !title.querySelector(".sent-status")) {
        title.insertAdjacentHTML("beforeend", '<span class="sent-status" role="status">JÁ ENVIADO</span>');
      }
      persistSubmittedDiscipline(record);
      saveCurrentFormState();
    } catch (error) {
      if (!sheetSubmissionState?.backdrop || sheetSubmissionState.backdrop.hidden) {
        showFormError(error.message || "Não foi possível enviar este roteiro. Revise os dados e tente novamente.");
      }
    } finally {
      button.disabled = subjectEditor.dataset.sent === "true";
      button.removeAttribute("aria-busy");
    }
  }));
  container.querySelectorAll(".chapter-row").forEach(attachNumericInputRules);
  container.querySelectorAll(".discipline-script").forEach((field) => field.addEventListener("input", () => {
    const editor = field.closest(".subject-editor");
    if (editor) {
      editor.dataset.validated = "false";
      editor.querySelector(".send-discipline-button").hidden = true;
    }
    saveCurrentFormState();
  }));
  saveCurrentFormState();
}

/* 9. Cria cada capítulo com input de conteúdo e números restritos a algarismos. */
function createChapterRow(classIndex, subjectIndex, chapterIndex, chapter = {}) {
  const prefix = `${classIndex}-${subjectIndex}-${chapterIndex}`;
  return `
    <div class="chapter-row" data-chapter-index="${chapterIndex}" data-inserted="${chapter.inserido ? "true" : "false"}">
      <div class="chapter-field"><label for="chapter-${prefix}"><span class="material-symbols-rounded" aria-hidden="true">tag</span> Capítulo</label><input id="chapter-${prefix}" class="chapter-number" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="Ex.: 10" aria-label="Capítulo" value="${escapeHtml(chapter.numero || "")}"></div>
      <div class="chapter-field chapter-field-content"><label for="content-${prefix}"><span class="material-symbols-rounded" aria-hidden="true">edit</span> TÍTULO DO CAPÍTULO</label><input id="content-${prefix}" class="chapter-content" type="text" autocomplete="off" placeholder="Ex.: Frações e números decimais" aria-label="Título do capítulo" value="${escapeHtml(chapter.conteudo || "")}"></div>
      <div class="chapter-field"><label for="page-${prefix}"><span class="material-symbols-rounded" aria-hidden="true">menu_book</span> Página</label><input id="page-${prefix}" class="chapter-page" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="Ex.: 42" aria-label="Página" value="${escapeHtml(chapter.pagina || "")}"></div>
    </div>
  `;
}

/* 10. Filtra letras dos campos numéricos e verifica o ponto final do conteúdo. */
function attachNumericInputRules(row) {
  row.querySelectorAll(".chapter-number, .chapter-page").forEach((input) => input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "");
    input.removeAttribute("aria-invalid");
  }));
  const contentField = row.querySelector(".chapter-content");
  row.querySelectorAll("input").forEach((input) => input.addEventListener("input", () => {
    row.dataset.inserted = "false";
    const editor = row.closest(".subject-editor");
    if (editor) {
      editor.dataset.validated = "false";
      const sendButton = editor.querySelector(".send-discipline-button");
      if (sendButton) sendButton.hidden = true;
    }
    saveCurrentFormState();
  }));
  contentField?.addEventListener("input", () => contentField.removeAttribute("aria-invalid"));
  contentField?.addEventListener("blur", () => {
    contentField.value = capitalizeInitial(contentField.value);
    const normalized = normalizeContent(contentField.value);
    if (normalized) contentField.value = normalized;
  });
}

/* 11. Padroniza pontuação e transforma referências como “capítulo 10” em CAP 10. */
function capitalizeInitial(value) {
  const characters = [...String(value || "")];
  const firstLetter = characters.findIndex((character) => /\p{L}/u.test(character));
  if (firstLetter < 0) return characters.join("");
  characters[firstLetter] = characters[firstLetter].toLocaleUpperCase("pt-BR");
  return characters.join("");
}

function normalizeContent(content) {
  const trimmed = String(content || "").trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  const withChapter = trimmed.replace(/\b(?:cap(?:ítulo|itulo)?\s*)?(\d+)\b/gi, (match, number) => {
    return /^cap/i.test(match) ? `CAP ${number}` : match;
  });
  return withChapter.endsWith(".") ? withChapter : `${withChapter}.`;
}

/* 12. Monta um array com todos os segmentos, turmas e disciplinas do docente. */
function collectCurrentRecord() {
  for (const id of ["etapa", "tipo", "docente"]) {
    const field = byId(id);
    if (!field?.value) {
      field?.focus();
      throw new Error("Preencha etapa, tipo de avaliação e docente antes de continuar.");
    }
  }

  const teacher = byId("docente").value;
  const classEditors = [...document.querySelectorAll(".teacher-editor")];
  if (!classEditors.length) throw new Error("Selecione um docente para exibir as turmas e disciplinas.");
  byId("discipline-error")?.classList.add("hidden");

  const disciplinas = [];
  const turmas = [];
  classEditors.forEach((classEditor) => {
    const turma = classEditor.dataset.class;
    const segmento = turma.includes("EM") ? "ENSINO MÉDIO" : "ENSINO FUNDAMENTAL 2";
    turmas.push({ turma, segmento });
    classEditor.querySelectorAll(".subject-editor").forEach((subjectEditor) => {
      const subject = subjectEditor.dataset.subject;
      const capitulos = [...subjectEditor.querySelectorAll(".chapter-row")].map((row) => {
        const numberField = row.querySelector(".chapter-number");
        const pageField = row.querySelector(".chapter-page");
        const contentField = row.querySelector(".chapter-content");
        const numero = numberField.value.trim();
        const pagina = pageField.value.trim();
        const conteudo = normalizeContent(contentField.value);
        const hasAnyValue = Boolean(numero || pagina || conteudo);
        if (!hasAnyValue) return null;
        if (row.dataset.inserted !== "true") {
          throw new Error(`Clique em VALIDAR ROTEIRO após preencher ou alterar os capítulos de ${subject} em ${turma}.`);
        }
        let valid = true;
        [[numberField, numero], [pageField, pagina], [contentField, conteudo]].forEach(([field, value]) => {
          if (!value) {
            field.setAttribute("aria-invalid", "true");
            valid = false;
          } else field.removeAttribute("aria-invalid");
        });
        if (!valid) throw new Error(`Complete o capítulo, conteúdo e página de ${subject} em ${turma}.`);
        contentField.value = conteudo;
        return { capitulo: `CAP ${numero}`, numeroCapitulo: Number(numero), conteudo, pagina: Number(pagina) };
      }).filter(Boolean);
      const roteiroPersonalizado = subjectEditor.querySelector(".discipline-script").value.trim();
      if (capitulos.length || roteiroPersonalizado) {
        disciplinas.push({
          segmento,
          turma,
          disciplina: subject,
          capitulos,
          roteiroPersonalizado
        });
      }
    });
  });

  if (!disciplinas.length) throw new Error("Preencha ao menos um capítulo ou roteiro personalizado antes de organizar.");

  const segments = [...new Set(turmas.map((item) => item.segmento))];
  return {
    id: globalThis.crypto?.randomUUID?.() || `roteiro-${Date.now()}`,
    criadoEm: new Date().toISOString(),
    etapa: byId("etapa").value,
    tipoAvaliacao: byId("tipo").value,
    segmento: segments.join(" E "),
    turma: turmas.map((item) => item.turma).join(", "),
    turmas,
    docente: teacher,
    disciplinas
  };
}

/* Monta e valida somente a turma/disciplina cujo botão foi acionado. */
function collectDisciplineRecord(subjectEditor) {
  for (const id of ["etapa", "tipo", "docente"]) {
    const field = byId(id);
    if (!field?.value) {
      field?.focus();
      throw new Error("Preencha etapa, tipo de avaliação e docente antes de enviar.");
    }
  }
  if (subjectEditor.dataset.validated !== "true") throw new Error("Clique em VALIDAR ROTEIRO antes de enviar esta disciplina.");
  const turma = subjectEditor.closest(".teacher-editor")?.dataset.class;
  const disciplina = subjectEditor.dataset.subject;
  const segmento = turma?.includes("EM") ? "ENSINO MÉDIO" : "ENSINO FUNDAMENTAL 2";
  const capitulos = [...subjectEditor.querySelectorAll(".chapter-row")].map((row) => {
    const numberField = row.querySelector(".chapter-number");
    const pageField = row.querySelector(".chapter-page");
    const contentField = row.querySelector(".chapter-content");
    const numero = numberField.value.trim();
    const pagina = pageField.value.trim();
    const conteudo = normalizeContent(contentField.value);
    if (!numero && !pagina && !conteudo) return null;
    if (row.dataset.inserted !== "true") throw new Error(`Clique em VALIDAR ROTEIRO após alterar os capítulos de ${disciplina} em ${turma}.`);
    if (!numero || !pagina || !conteudo) throw new Error(`Complete capítulo, conteúdo e página de ${disciplina} em ${turma}.`);
    contentField.value = conteudo;
    return { capitulo: `CAP ${numero}`, numeroCapitulo: Number(numero), conteudo, pagina: Number(pagina) };
  }).filter(Boolean);
  const roteiroPersonalizado = subjectEditor.querySelector(".discipline-script").value.trim();
  if (!capitulos.length && !roteiroPersonalizado) throw new Error(`Preencha o roteiro de ${disciplina} em ${turma} antes de enviar.`);
  return {
    id: globalThis.crypto?.randomUUID?.() || `roteiro-${Date.now()}`,
    criadoEm: new Date().toISOString(),
    etapa: byId("etapa").value,
    tipoAvaliacao: byId("tipo").value,
    segmento,
    turma,
    turmas: [{ turma, segmento }],
    docente: byId("docente").value,
    disciplinas: [{ segmento, turma, disciplina, capitulos, roteiroPersonalizado }],
    atualizarNaPlanilha: subjectEditor.dataset.sent === "true"
  };
}

function persistSubmittedDiscipline(record) {
  const records = readRecords();
  let saved = records.find((item) => item.etapa === record.etapa
    && item.tipoAvaliacao === record.tipoAvaliacao && item.docente === record.docente);
  if (!saved) {
    saved = { ...record, disciplinas: [], turmas: [], segmento: "", turma: "" };
    records.push(saved);
  }
  const incoming = record.disciplinas[0];
  const existingIndex = saved.disciplinas.findIndex((item) => item.turma === incoming.turma && item.disciplina === incoming.disciplina);
  if (existingIndex >= 0) saved.disciplinas[existingIndex] = incoming;
  else saved.disciplinas.push(incoming);
  const classMap = new Map((saved.turmas || []).map((item) => [item.turma, item]));
  classMap.set(record.turma, { turma: record.turma, segmento: record.segmento });
  saved.turmas = [...classMap.values()];
  saved.turma = saved.turmas.map((item) => item.turma).join(", ");
  saved.segmento = [...new Set(saved.turmas.map((item) => item.segmento))].join(" E ");
  saved.atualizadoEm = new Date().toISOString();
  writeRecords(records);
}

/* 15. Apresenta mensagens de validação no painel e deixa o campo incompleto visível. */
function showFormError(message) {
  const error = byId("form-error");
  if (!error) return;
  error.textContent = message;
  error.classList.remove("hidden");
  error.scrollIntoView({ behavior: "smooth", block: "center" });
}
function clearFormError() {
  byId("form-error")?.classList.add("hidden");
}

/* Envia em um POST de formulário para evitar bloqueios CORS do Apps Script.
   O retorno do Web App confirma a gravação por postMessage no iframe oculto. */
function ensureSheetStatusDialog() {
  if (sheetSubmissionState) return sheetSubmissionState;
  const style = document.createElement("style");
  style.textContent = `
    .sheet-status-backdrop{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:rgba(14,31,22,.48);backdrop-filter:blur(4px)}
    .sheet-status-backdrop[hidden]{display:none!important}
    .sheet-status-dialog{width:min(360px,100%);padding:28px 24px 22px;border:1px solid #b8d1bd;border-radius:22px;background:#fff;box-shadow:0 22px 70px rgba(12,36,20,.25);text-align:center;color:#183d25;font-family:inherit}
    .sheet-status-icon{position:relative;width:96px;height:96px;margin:0 auto 17px;display:grid;place-items:center;border:4px solid #e0eee2;border-radius:50%;color:#23663a}
    .sheet-status-icon:before{content:"";position:absolute;inset:-5px;border:4px solid transparent;border-top-color:#276b3c;border-right-color:#71a47d;border-radius:50%;animation:sheet-status-spin 1s linear infinite}
    .sheet-status-icon .material-symbols-rounded{font-size:42px}
    .sheet-status-icon.is-done:before{animation:none;border-color:#579365}
    .sheet-status-icon.is-error:before{animation:none;border-color:#b94a48}
    .sheet-status-message{min-height:3em;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;margin:0;color:#304b38;font-size:15px;line-height:1.5;font-weight:600}
    .sheet-status-close{margin-top:16px;padding:9px 18px;border:0;border-radius:10px;background:#1f1f1f;color:#fff;font:inherit;font-weight:700;cursor:pointer}
    .sheet-status-close[hidden]{display:none}
    .subject-editor-title{flex-wrap:wrap}
    .sent-status{display:inline-flex;align-items:center;gap:5px;margin-left:5px;padding:4px 9px;border:1px solid #000;border-radius:999px;background:#000;color:#fff;font-size:10px;font-weight:800;letter-spacing:.055em;box-shadow:0 2px 7px rgba(0,0,0,.14)}
    .sent-status:before{content:"✓";display:grid;width:15px;height:15px;place-items:center;border-radius:50%;background:#fff;color:#000;font-size:10px}
    .script-action-row{display:flex;justify-content:flex-end;margin-top:8px}
    .send-discipline-button[hidden]{display:none!important}
    .send-discipline-button{min-height:39px;padding:8px 13px;border-color:#000;background:#000;color:#fff;box-shadow:0 4px 11px rgba(0,0,0,.14)}
    .send-discipline-button:hover{border-color:#222;background:#222;color:#fff}
    .send-discipline-button:disabled{cursor:wait;opacity:.7}
    @keyframes sheet-status-spin{to{transform:rotate(360deg)}}
    @media(prefers-reduced-motion:reduce){.sheet-status-icon:before{animation-duration:3s}}
  `;
  document.head.append(style);
  const backdrop = document.createElement("div");
  backdrop.className = "sheet-status-backdrop";
  backdrop.hidden = true;
  backdrop.innerHTML = `<section class="sheet-status-dialog" role="dialog" aria-modal="true" aria-labelledby="sheet-status-title"><div class="sheet-status-icon"><span class="material-symbols-rounded" aria-hidden="true">database</span></div><h2 id="sheet-status-title" class="sr-only">Conexão com a planilha</h2><p class="sheet-status-message" aria-live="polite">Iniciando conexão com a planilha…</p><button type="button" class="sheet-status-close" hidden>Fechar</button></section>`;
  document.body.append(backdrop);
  const state = {
    backdrop,
    icon: backdrop.querySelector(".sheet-status-icon"),
    message: backdrop.querySelector(".sheet-status-message"),
    close: backdrop.querySelector(".sheet-status-close"),
    busy: false,
    finish: null,
    closeTimer: null,
    resolveClose: null
  };
  const dismiss = () => {
    if (state.busy) return;
    backdrop.hidden = true;
    if (state.closeTimer !== null) {
      window.clearTimeout(state.closeTimer);
      state.closeTimer = null;
    }
    if (state.resolveClose) {
      state.resolveClose();
      state.resolveClose = null;
    }
  };
  state.close.addEventListener("click", dismiss);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) dismiss();
  });
  window.addEventListener("message", (event) => {
    const response = event.data;
    if (!response || response.type !== "criador-roteiros-sheet-result" || !state.finish || response.token !== state.finish.token) return;
    state.finish.callback(response);
  });
  sheetSubmissionState = state;
  return state;
}

function showSheetStatus(message, mode = "loading") {
  const state = ensureSheetStatusDialog();
  state.backdrop.hidden = false;
  state.message.textContent = message;
  state.icon.classList.toggle("is-done", mode === "success");
  state.icon.classList.toggle("is-error", mode === "error");
  state.close.hidden = mode === "loading" || mode === "success";
  state.close.disabled = mode === "loading" || mode === "success";
  state.busy = mode === "loading" || mode === "success";
  return state;
}

function buildSheetsBatch(record) {
  const contents = [];
  record.disciplinas.forEach((discipline) => {
    const text = String(discipline.roteiroPersonalizado || "").trim()
      || (discipline.capitulos || []).map((chapter) => `${chapter.capitulo} [ ${chapter.pagina} ]: ${chapter.conteudo}`).join("\n");
    if (text) contents.push({ turma: discipline.turma, disciplina: discipline.disciplina, conteudo: text });
  });
  if (!contents.length) throw new Error("Não há conteúdos validados para enviar à planilha.");
  const today = new Date();
  const date = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;
  return [
    date,
    record.etapa,
    record.tipoAvaliacao,
    record.docente,
    record.turma,
    record.segmento,
    contents
  ];
}

function submitRecordToGoogleSheets(record) {
  const configuredUrl = GOOGLE_SHEETS_CONFIG.webAppUrl.trim();
  const endpoint = configuredUrl.replace(/\/exe(?=\?|$)/, "/exec");
  if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/.test(endpoint)) {
    throw new Error("Configure a URL do Web App do Google Apps Script no aplicativo antes de enviar.");
  }
  const batch = buildSheetsBatch(record);
  const state = showSheetStatus("Iniciando conexão com a planilha…");
  const token = globalThis.crypto?.randomUUID?.() || `envio-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const iframe = document.createElement("iframe");
  iframe.name = `sheet-submit-${token}`;
  iframe.title = "Retorno da conexão com a planilha";
  iframe.hidden = true;
  const form = document.createElement("form");
  form.method = "POST";
  form.action = endpoint;
  form.target = iframe.name;
  form.enctype = "application/x-www-form-urlencoded";
  form.hidden = true;
  [["payload", JSON.stringify(batch)], ["token", token], ["mode", record.atualizarNaPlanilha ? "update" : "insert"]].forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.append(input);
  });
  document.body.append(iframe, form);

  return new Promise((resolve, reject) => {
    let settled = false;
    const timeout = window.setTimeout(() => finish({ ok: false, message: "Tempo esgotado ao aguardar a confirmação da planilha. Verifique a implantação e tente novamente." }), 45000);
    const cleanup = () => {
      window.clearTimeout(timeout);
      state.finish = null;
      form.remove();
      iframe.remove();
    };
    const finish = (response) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (response.ok) {
        showSheetStatus("Dados enviados com sucesso!", "success");
        state.resolveClose = resolve;
        window.setTimeout(() => {
          if (state.backdrop.hidden) return;
          state.message.textContent = "Fechando a conexão";
          state.icon.classList.remove("is-done", "is-error");
          state.busy = false;
          state.close.hidden = false;
          state.close.disabled = false;
          state.closeTimer = window.setTimeout(() => {
            state.closeTimer = null;
            state.backdrop.hidden = true;
            state.resolveClose?.();
            state.resolveClose = null;
          }, 700);
        }, 300);
      } else {
        showSheetStatus(response.message || "Não foi possível gravar os dados na planilha.", "error");
        reject(new Error(response.message || "Não foi possível gravar os dados na planilha."));
      }
    };
    state.finish = { token, callback: finish };
    form.submit();
  });
}

/* 16. Formata o JSON na área editável e persiste também o rascunho local. */
function initializeOrganizer() {
  const button = byId("organize-button");
  const output = byId("roteiro-output");
  const wrapper = byId("output-wrap");
  const applyButton = byId("apply-edit-button");
  if (!output || !wrapper) return;

  button?.addEventListener("click", async () => {
    clearFormError();
    try {
      const record = collectCurrentRecord();
      const records = readRecords();
      const currentDraft = JSON.parse(getSharedItem(STORAGE_KEYS.draft) || "null");
      const recordToUpdate = currentDraft
        && currentDraft.etapa === record.etapa
        && currentDraft.tipoAvaliacao === record.tipoAvaliacao
        && currentDraft.docente === record.docente
        ? records.findIndex((item) => item.id === currentDraft.id)
        : -1;

      if (recordToUpdate >= 0) {
        record.id = records[recordToUpdate].id;
        records[recordToUpdate] = record;
      } else {
        records.push(record);
      }

      writeRecords(records);
      setSharedItem(STORAGE_KEYS.draft, JSON.stringify(record, null, 2));
      output.value = JSON.stringify(record, null, 2);
      wrapper.classList.remove("hidden");
      byId("json-hint").textContent = "Roteiro organizado e salvo neste navegador. O envio à planilha será iniciado agora.";
      wrapper.scrollIntoView({ behavior: "smooth", block: "start" });
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      try {
        await submitRecordToGoogleSheets(record);
        byId("json-hint").textContent = "Roteiro enviado com sucesso à planilha Google e mantido neste navegador.";
      } finally {
        button.disabled = false;
        button.removeAttribute("aria-busy");
      }
    } catch (error) {
      if (!sheetSubmissionState?.backdrop || sheetSubmissionState.backdrop.hidden) {
        showFormError(error.message || "Revise os campos destacados e tente novamente.");
      }
    }
  });

  const savedState = readFormState();
  if (savedState?.jsonOutput && savedState.outputVisible) {
    output.value = savedState.jsonOutput;
    wrapper.classList.remove("hidden");
  }
  output.addEventListener("input", saveCurrentFormState);

  applyButton?.addEventListener("click", () => {
    const hint = byId("json-hint");
    try {
      const editedRecord = JSON.parse(output.value);
      validateEditableRecord(editedRecord);
      const records = readRecords();
      const existingIndex = records.findIndex((item) => item.id === editedRecord.id);
      if (existingIndex >= 0) records[existingIndex] = editedRecord;
      else records.push(editedRecord);
      writeRecords(records);
      setSharedItem(STORAGE_KEYS.draft, JSON.stringify(editedRecord, null, 2));
      hint.textContent = "Edição aplicada e salva. O array de roteiros foi atualizado.";
      hint.classList.remove("error-text");
    } catch (error) {
      hint.textContent = error instanceof SyntaxError
        ? "JSON inválido. Confira vírgulas, aspas e chaves antes de aplicar."
        : error.message;
      hint.classList.add("error-text");
    }
  });
}

/* 17. Checa campos fundamentais quando a pessoa edita o JSON diretamente. */
function validateEditableRecord(record) {
  const hasCoreFields = record && typeof record === "object"
    && ["id", "etapa", "tipoAvaliacao", "segmento", "turma", "docente"].every((key) => typeof record[key] === "string" && record[key].trim())
    && Array.isArray(record.disciplinas) && record.disciplinas.length > 0;
  if (!hasCoreFields) throw new Error("O JSON precisa manter identificação, avaliação, turma, docente e ao menos uma disciplina.");

  record.disciplinas.forEach((discipline) => {
    if (!discipline.disciplina || !discipline.turma || !Array.isArray(discipline.capitulos) || discipline.capitulos.length === 0) {
      throw new Error("Cada disciplina deve ter nome e ao menos um capítulo.");
    }
    discipline.capitulos.forEach((chapter) => {
      if (!chapter.capitulo || !Number.isInteger(Number(chapter.numeroCapitulo)) || !Number.isInteger(Number(chapter.pagina)) || !String(chapter.conteudo || "").trim()) {
        throw new Error(`Revise capítulo, conteúdo e página na disciplina ${discipline.disciplina}.`);
      }
    });
  });
}

/* 18. Mostra os registros já salvos, com ação para apagar cada um. */
function initializeSavedRecords() {
  const list = byId("saved-list");
  const jsonPreview = byId("saved-json");
  if (!list || !jsonPreview) return;

  const render = () => {
    const records = readRecords();
    jsonPreview.textContent = records.length ? JSON.stringify(records, null, 2) : "Nenhum roteiro salvo ainda.";
    if (!records.length) {
      list.innerHTML = '<div class="empty-state"><span class="material-symbols-rounded" aria-hidden="true">inbox</span><span>Você ainda não organizou nenhum roteiro. Comece na página “Escrever roteiro”.</span></div>';
      return;
    }
    list.innerHTML = records.map((record) => {
      const subjectNames = (record.disciplinas || []).map((item) => item.disciplina).join(", ");
      const chapterCount = (record.disciplinas || []).reduce((total, item) => total + (item.capitulos || []).length, 0);
      return `<article class="saved-card"><div class="saved-card-top"><span class="segment-label">${escapeHtml(record.segmento)}</span><span class="segment-divider">|</span><span class="class-badge">${escapeHtml(record.turma)}</span></div><h3>${escapeHtml(record.docente)} · ${escapeHtml(record.etapa)}</h3><p>${escapeHtml(record.tipoAvaliacao)} · ${escapeHtml(subjectNames)}</p><p>${chapterCount} capítulo(s) · salvo em ${new Date(record.criadoEm).toLocaleDateString("pt-BR")}</p><div class="saved-card-actions"><button class="button-small remove-record" type="button" data-record-id="${escapeHtml(record.id)}"><span class="material-symbols-rounded" aria-hidden="true">delete</span> Excluir roteiro</button></div></article>`;
    }).join("");
    list.querySelectorAll(".remove-record").forEach((button) => button.addEventListener("click", () => {
      const updated = readRecords().filter((record) => record.id !== button.dataset.recordId);
      writeRecords(updated);
      render();
    }));
  };
  render();
}

/* 19. Formulário de contato demonstrativo: valida localmente sem prometer envio. */
function initializeContactForm() {
  const form = byId("contact-form");
  const feedback = byId("contact-feedback");
  if (!form || !feedback) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    feedback.textContent = "Obrigado! O formulário está validado. O envio real será habilitado quando houver um canal de contato conectado.";
    feedback.classList.remove("hidden");
  });
}

/* 20. Transporta o rascunho na própria navegação entre documentos locais.
   Navegadores podem isolar localStorage e window.name para URLs file://. */
function restoreStateFromNavigation() {
  const marker = "#roteiro-state=";
  if (!window.location.hash.startsWith(marker)) return;
  try {
    const encoded = window.location.hash.slice(marker.length);
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64 + "=".repeat((4 - base64.length % 4) % 4);
    const decoded = decodeURIComponent(escape(atob(paddedBase64)));
    const state = JSON.parse(decoded);
    if (state && typeof state === "object") {
      if (state.formState) setSharedItem(STORAGE_KEYS.formState, state.formState);
      if (state.records) setSharedItem(STORAGE_KEYS.records, state.records);
      if (state.draft) setSharedItem(STORAGE_KEYS.draft, state.draft);
    }
  } catch (error) {
    console.warn("Não foi possível recuperar os dados incluídos na navegação.", error);
  }
  try {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  } catch (error) {
    /* O fragmento só contém uma cópia transportável do rascunho. */
  }
}

function initializeNavigationStateTransfer() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const targetUrl = new URL(link.href, window.location.href);
    const allowedPages = new Set(["index.html", "criando-roteiros.html", "sobre.html", "contato.html"]);
    if (targetUrl.origin !== window.location.origin || !allowedPages.has(targetUrl.pathname.split("/").pop())) return;

    saveCurrentFormState();
    const payload = {
      formState: getSharedItem(STORAGE_KEYS.formState),
      records: getSharedItem(STORAGE_KEYS.records),
      draft: getSharedItem(STORAGE_KEYS.draft)
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    targetUrl.hash = `roteiro-state=${encoded}`;
    event.preventDefault();
    window.location.href = targetUrl.href;
  });
}

/* Limpa o formulário em toda abertura, sem apagar os roteiros já salvos. */
function resetFormOnPageLoad() {
  const form = byId("roteiro-form");
  if (!form) return;

  form.reset();
  form.querySelectorAll("input, textarea").forEach((field) => {
    field.value = "";
  });

  const stageSelect = byId("etapa");
  const typeSelect = byId("tipo");
  const teacherSelect = byId("docente");
  if (stageSelect) stageSelect.value = "";
  if (typeSelect) {
    typeSelect.value = "";
    typeSelect.disabled = true;
  }
  if (teacherSelect) {
    teacherSelect.value = "";
    teacherSelect.disabled = false;
  }

  const output = byId("roteiro-output");
  if (output) output.value = "";
  byId("output-wrap")?.classList.add("hidden");

  const editors = byId("chapter-editors");
  if (editors) {
    editors.className = "chapter-editors empty-state";
    editors.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">post_add</span><span>Selecione um docente para exibir todas as turmas e disciplinas em que leciona.</span>';
  }

  [stageSelect, typeSelect, teacherSelect].forEach((select) => {
    select?.dispatchEvent(new Event("change", { bubbles: true }));
  });
  clearFormError();
  refreshSelectionStatus();
  removeSharedItem(STORAGE_KEYS.formState);
}

/* 21. Inicialização por página e gravação antes de trocar de arquivo ou aba. */
document.addEventListener("DOMContentLoaded", () => {
  restoreStateFromNavigation();
  initializeNavigationStateTransfer();
  initializeMenu();
  initializeAssessmentSelectors();
  initializeRosterSelectors();
  initializeIconSelects();
  initializeOrganizer();
  resetFormOnPageLoad();
  initializeSavedRecords();
  initializeContactForm();

  document.getElementById("roteiro-form")?.addEventListener("input", saveCurrentFormState);
  document.getElementById("roteiro-form")?.addEventListener("change", saveCurrentFormState);
  window.addEventListener("pagehide", saveCurrentFormState);
});
