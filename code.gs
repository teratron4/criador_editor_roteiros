const SPREADSHEET_ID = "1px0Swt7T7WTWtuD9ubqMant5PbhoqcJz7PKmEB6hZ3o";
const SHEET_NAME = "ROTEIROS";
const FIRST_DATA_ROW = 4;
const LAST_GRADE_COLUMN = 13; // M

/** Recebe uma turma/disciplina por chamada e insere ou atualiza a linha correspondente. */
function doPost(e) {
  let token = "";
  try {
    const params = e && e.parameter ? e.parameter : {};
    token = String(params.token || "");
    const payload = JSON.parse(String(params.payload || "null"));
    const batch = normalizeBatch_(payload);
    const mode = String(params.mode || "insert").trim().toLowerCase();
    if (["insert", "update", "upsert"].indexOf(mode) < 0) {
      throw new Error("Modo de gravação inválido.");
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = spreadsheet.getSheetByName(SHEET_NAME);
      if (!sheet) throw new Error('A guia "' + SHEET_NAME + '" não foi encontrada.');
      ensureSheetRows_(sheet);
      const rowValues = buildSheetRow_(batch);
      const matchedRow = mode === "insert" ? 0 : findMatchingRow_(sheet, batch);

      if (matchedRow) {
        // Mantém os outros conteúdos da turma e troca apenas o roteiro desta disciplina.
        const item = batch.conteudos[0];
        const classColumn = gradeColumn_(item.turma);
        const cell = sheet.getRange(matchedRow, classColumn);
        const currentText = String(cell.getDisplayValue() || "");
        const blocks = currentText.split(/\n\s*\n/).filter(function(block) { return block.trim(); });
        const subjectKey = normalizeCompare_(item.disciplina);
        let replaced = false;
        const updatedBlocks = blocks.map(function(block) {
          const lines = block.split(/\r?\n/);
          if (normalizeCompare_(lines[0]) !== subjectKey) return block;
          replaced = true;
          return item.disciplina + "\n" + item.conteudo;
        });
        if (!replaced) throw new Error("Encontrei a linha da avaliação, mas não localizei a disciplina correspondente na coluna da turma. Nenhum dado foi alterado.");
        cell.setNumberFormat("@");
        cell.setValue(updatedBlocks.join("\n\n"));
      } else {
        if (mode === "update") {
          throw new Error("Não encontrei na planilha a linha já enviada para esta etapa, avaliação, docente, turma e disciplina. Nenhum dado foi alterado.");
        }
        // Primeiro envio (ou novo roteiro sem correspondência): sempre entra na linha 4.
        sheet.insertRowsBefore(FIRST_DATA_ROW, 1);
        sheet.getRange(FIRST_DATA_ROW, 2, 1, 4).setNumberFormat("@");
        sheet.getRange(FIRST_DATA_ROW, 7, 1, LAST_GRADE_COLUMN - 6).setNumberFormat("@");
        sheet.getRange(FIRST_DATA_ROW, 6).clearContent();
        sheet.getRange(FIRST_DATA_ROW, 2, 1, 4).setValues([rowValues.slice(0, 4)]);
        sheet.getRange(FIRST_DATA_ROW, 7, 1, LAST_GRADE_COLUMN - 6).setValues([rowValues.slice(4)]);
      }
    } finally {
      lock.releaseLock();
    }
    return responsePage_(token, true, "Dados enviados com sucesso!");
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return responsePage_(token, false, error && error.message ? error.message : "Falha ao processar o envio.");
  }
}

/** Permite testar a implantação abrindo a URL do Web App no navegador. */
function doGet() {
  return HtmlService.createHtmlOutput("<p>Conexão do Criador de Roteiros ativa. O envio é feito pelo aplicativo.</p>");
}

function ensureSheetRows_(sheet) {
  if (sheet.getMaxRows() < FIRST_DATA_ROW) {
    sheet.insertRowsAfter(sheet.getMaxRows(), FIRST_DATA_ROW - sheet.getMaxRows());
  }
}

/** Procura primeiro por C:E e, entre possíveis repetições, identifica disciplina na coluna da turma. */
function findMatchingRow_(sheet, batch) {
  const lastRow = sheet.getLastRow();
  if (lastRow < FIRST_DATA_ROW) return 0;
  const numRows = lastRow - FIRST_DATA_ROW + 1;
  const metadata = sheet.getRange(FIRST_DATA_ROW, 3, numRows, 3).getDisplayValues(); // C:E
  const targetColumn = gradeColumn_(batch.conteudos[0].turma);
  const gradeCells = sheet.getRange(FIRST_DATA_ROW, targetColumn, numRows, 1).getDisplayValues();
  const wantedStage = normalizeCompare_(batch.etapa);
  const wantedType = normalizeTypeCompare_(batch.tipo);
  const wantedTeacher = normalizeCompare_(batch.docente);
  const wantedSubject = normalizeCompare_(batch.conteudos[0].disciplina);

  for (let index = 0; index < numRows; index += 1) {
    const values = metadata[index].map(normalizeCompare_);
    if (values[0] !== wantedStage || normalizeTypeCompare_(values[1]) !== wantedType || values[2] !== wantedTeacher) continue;
    const cellLines = String(gradeCells[index][0] || "").split(/\r?\n/);
    if (cellLines.some(function(line) { return normalizeCompare_(line) === wantedSubject; })) {
      return FIRST_DATA_ROW + index;
    }
  }
  return 0;
}

function normalizeCompare_(value) {
  return String(value == null ? "" : value).trim().toLocaleUpperCase("pt-BR");
}

function normalizeTypeCompare_(value) {
  const text = normalizeCompare_(value);
  if (text === "AP" || text.indexOf("AVALIAÇÃO PARCIAL") >= 0 || text.indexOf("AVALIACAO PARCIAL") >= 0) return "AP";
  if (text === "AG" || text.indexOf("AVALIAÇÃO GLOBAL") >= 0 || text.indexOf("AVALIACAO GLOBAL") >= 0) return "AG";
  return text;
}

/** Valida o lote [DATA, ETAPA, TIPO, DOCENTE, TURMA, SEGMENTO, CONTEÚDOS[]]. */
function normalizeBatch_(payload) {
  if (!Array.isArray(payload) || payload.length !== 7) {
    throw new Error("O lote deve conter DATA, ETAPA, TIPO, DOCENTE, TURMA, SEGMENTO e CONTEÚDOS.");
  }
  const fields = payload.slice(0, 6).map(function(value) { return String(value == null ? "" : value).trim(); });
  if (fields.some(function(value) { return !value; })) {
    throw new Error("Um ou mais campos obrigatórios do roteiro estão vazios.");
  }
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fields[0])) {
    throw new Error("A data deve estar no formato DD/MM/AAAA.");
  }
  if (!Array.isArray(payload[6]) || payload[6].length !== 1) {
    throw new Error("Cada envio deve conter exatamente uma turma e disciplina.");
  }
  const contents = payload[6].map(function(item) {
    if (!item || typeof item !== "object") throw new Error("Há um conteúdo de disciplina inválido.");
    const turma = normalizeClass_(item.turma);
    const disciplina = String(item.disciplina || "").trim();
    const conteudo = String(item.conteudo || "").trim();
    if (!turma || !disciplina || !conteudo) throw new Error("Cada conteúdo precisa de turma, disciplina e roteiro.");
    return { turma: turma, disciplina: disciplina, conteudo: conteudo };
  });
  return {
    data: fields[0],
    etapa: fields[1],
    tipo: normalizeAssessmentType_(fields[2]),
    docente: fields[3],
    turma: fields[4],
    segmento: fields[5],
    conteudos: contents
  };
}

/** Distribui o conteúdo na coluna G:M da turma, mantendo as outras colunas vazias. */
function buildSheetRow_(batch) {
  const gradeContents = ["", "", "", "", "", "", ""];
  batch.conteudos.forEach(function(item) {
    const column = gradeColumn_(item.turma);
    const block = item.disciplina + "\n" + item.conteudo;
    gradeContents[column - 7] = block;
  });
  return [batch.data, batch.etapa, batch.tipo, batch.docente].map(safeCell_).concat(gradeContents.map(safeCell_));
}

function gradeColumn_(className) {
  const gradeColumns = {
    "6º ANO": 7,
    "7º ANO": 8,
    "8º ANO": 9,
    "9º ANO": 10,
    "1º ANO EM": 11,
    "2º ANO EM": 12,
    "3º ANO EM": 13
  };
  const column = gradeColumns[normalizeClass_(className)];
  if (!column) throw new Error("Turma não mapeada para as colunas da planilha: " + className);
  return column;
}

/** Mantém textos que poderiam ser interpretados como fórmulas apenas como texto. */
function safeCell_(value) {
  const text = String(value == null ? "" : value);
  return /^[=+@]/.test(text) || /^-/.test(text) ? "'" + text : text;
}

function normalizeAssessmentType_(value) {
  const normalized = String(value || "").trim().toLocaleUpperCase("pt-BR");
  if (["AP", "AVALIAÇÃO PARCIAL", "AVALIACAO PARCIAL"].indexOf(normalized) >= 0) return "AP";
  if (["AG", "AVALIAÇÃO GLOBAL", "AVALIACAO GLOBAL"].indexOf(normalized) >= 0) return "AG";
  return String(value || "").trim();
}

function normalizeClass_(value) {
  const normalized = String(value || "").trim().toLocaleUpperCase("pt-BR");
  const allowed = ["6º ANO", "7º ANO", "8º ANO", "9º ANO", "1º ANO EM", "2º ANO EM", "3º ANO EM"];
  return allowed.indexOf(normalized) >= 0 ? normalized : "";
}

/** Retorna uma página mínima que confirma o resultado ao aplicativo por postMessage. */
function responsePage_(token, ok, message) {
  const result = JSON.stringify({
    type: "criador-roteiros-sheet-result",
    token: String(token || ""),
    ok: Boolean(ok),
    message: String(message || "")
  }).replace(/</g, "\\u003c");
  const html = "<!doctype html><html><head><meta charset=\"utf-8\"></head><body><script>"
    + "window.top.postMessage(" + result + ", '*');"
    + "</script></body></html>";
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
