import { execFileSync } from "node:child_process";
import DataBase from "../config/Database.js";

const DEFAULT_XLSX_PATH = "/Users/nicolas/Desktop/htM6TatHpa_base_de_pacientes_1.xlsx";
const DEFAULT_FALLBACK_DATE = "1900-01-01";
const DEFAULT_TEXT = "No especificado";
const DEFAULT_COUNTRY = "Chile";
const DEFAULT_PREVISION_ID = 1;

function parseArgs(argv) {
    const options = {
        file: DEFAULT_XLSX_PATH,
        dryRun: false,
        limit: null,
    };

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        if (arg === "--dry-run") {
            options.dryRun = true;
            continue;
        }
        if (arg === "--file" && argv[i + 1]) {
            options.file = argv[i + 1];
            i += 1;
            continue;
        }
        if (arg === "--limit" && argv[i + 1]) {
            options.limit = Number(argv[i + 1]);
            i += 1;
        }
    }

    return options;
}

function readWorkbookRows(xlsxPath) {
    const pythonCode = `
import json
import sys
import zipfile
import xml.etree.ElementTree as ET

path = sys.argv[1]
ns = {
    'a': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
}

def col_ref(cell_ref):
    letters = ''.join(ch for ch in cell_ref if ch.isalpha())
    return letters

with zipfile.ZipFile(path) as z:
    shared = []
    if 'xl/sharedStrings.xml' in z.namelist():
        root = ET.fromstring(z.read('xl/sharedStrings.xml'))
        for si in root.findall('a:si', ns):
            shared.append(''.join((t.text or '') for t in si.iterfind('.//a:t', ns)))

    workbook = ET.fromstring(z.read('xl/workbook.xml'))
    rels = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    rel_map = {rel.attrib['Id']: rel.attrib['Target'] for rel in rels}
    first_sheet = workbook.find('a:sheets/a:sheet', ns)
    target = 'xl/' + rel_map[first_sheet.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']]
    sheet = ET.fromstring(z.read(target))

    rows = []
    headers = []
    for row_idx, row in enumerate(sheet.findall('.//a:sheetData/a:row', ns)):
        current = {}
        for cell in row.findall('a:c', ns):
            cell_type = cell.attrib.get('t')
            ref = cell.attrib.get('r', '')
            value_node = cell.find('a:v', ns)
            value = ''
            if cell_type == 's' and value_node is not None and value_node.text is not None:
                value = shared[int(value_node.text)]
            elif cell_type == 'inlineStr':
                value = ''.join((text.text or '') for text in cell.findall('.//a:t', ns))
            elif value_node is not None and value_node.text is not None:
                value = value_node.text
            current[col_ref(ref)] = value

        if row_idx == 0:
            max_col = max(current.keys(), key=len) if current else 'A'
            headers = current
            continue

        rows.append(current)

    print(json.dumps(rows, ensure_ascii=False))
`;

    const stdout = execFileSync("python3", ["-c", pythonCode, xlsxPath], {
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 50,
    });

    return JSON.parse(stdout);
}

function toText(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
}

function normalizeRut(value) {
    return toText(value).replace(/[^0-9kK]/g, "").toUpperCase();
}

function normalizePhone(value) {
    const text = toText(value);
    if (!text) return DEFAULT_TEXT;
    const normalized = text.replace(/\D/g, "");
    return normalized || DEFAULT_TEXT;
}

function normalizeEmail(value) {
    return toText(value).toLowerCase();
}

function uniqueFallbackEmail(rut, usedEmails) {
    let attempt = 0;
    while (true) {
        const suffix = attempt === 0 ? rut : `${rut}-${attempt}`;
        const candidate = `no-especificado+${suffix}@import.local`;
        if (!usedEmails.has(candidate)) {
            return candidate;
        }
        attempt += 1;
    }
}

function buildEmail(rawEmail, rut, usedEmails) {
    const email = normalizeEmail(rawEmail);
    if (
        email &&
        email.includes("@") &&
        !usedEmails.has(email)
    ) {
        return email;
    }
    return uniqueFallbackEmail(rut || "sin-rut", usedEmails);
}

function toSentenceCase(value) {
    const text = toText(value);
    if (!text) return DEFAULT_TEXT;
    return text;
}

function buildApellido(paterno, materno) {
    const parts = [toText(paterno), toText(materno)].filter(Boolean);
    return parts.length ? parts.join(" ") : DEFAULT_TEXT;
}

function parseDate(value) {
    const text = toText(value);
    if (!text) return DEFAULT_FALLBACK_DATE;

    const match = text.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (!match) return DEFAULT_FALLBACK_DATE;

    const [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm}-${dd}`;
}

function normalizeRow(row, usedEmails) {
    const rut = normalizeRut(row.B);
    const nombre = toSentenceCase(row.E);
    const apellido = buildApellido(row.F, row.G);
    const telefono = normalizePhone(row.M || row.L);
    const correo = buildEmail(row.K, rut, usedEmails);
    const direccion = toText(row.Q) || DEFAULT_TEXT;
    const sexo = toSentenceCase(row.I);
    const nacimiento = parseDate(row.J);
    const observacion1 = toText(row.Y) || DEFAULT_TEXT;
    const observacion2 = DEFAULT_TEXT;
    const observacion3 = DEFAULT_TEXT;
    const apoderado = DEFAULT_TEXT;
    const apoderadoRut = DEFAULT_TEXT;
    const medicamentosUsados = DEFAULT_TEXT;
    const habitos = DEFAULT_TEXT;
    const comentariosAdicionales = DEFAULT_TEXT;

    return {
        nombre,
        apellido,
        rut,
        nacimiento,
        sexo,
        prevision_id: DEFAULT_PREVISION_ID,
        telefono,
        correo,
        direccion,
        pais: DEFAULT_COUNTRY,
        observacion1,
        observacion2,
        observacion3,
        apoderado,
        apoderado_rut: apoderadoRut,
        medicamentosUsados,
        habitos,
        comentariosAdicionales,
    };
}

function isInsertable(patient) {
    return Boolean(patient.rut && patient.nombre !== DEFAULT_TEXT);
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const rows = readWorkbookRows(options.file);
    const limitedRows = Number.isInteger(options.limit) && options.limit > 0
        ? rows.slice(0, options.limit)
        : rows;

    const db = DataBase.getInstance();
    const existingRows = await db.ejecutarQuery("SELECT rut, correo FROM pacienteDatos");
    const existingRuts = new Set(existingRows.map((row) => normalizeRut(row.rut)).filter(Boolean));
    const usedEmails = new Set(existingRows.map((row) => normalizeEmail(row.correo)).filter(Boolean));

    const insertQuery = `
        INSERT INTO pacienteDatos (
            nombre, apellido, rut, nacimiento, sexo, prevision_id, telefono, correo,
            direccion, pais, observacion1, observacion2, observacion3, apoderado,
            apoderado_rut, medicamentosUsados, habitos, comentariosAdicionales
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const summary = {
        totalFilasExcel: limitedRows.length,
        insertados: 0,
        omitidosPorRutDuplicado: 0,
        omitidosPorDatosInsuficientes: 0,
        errores: 0,
    };

    for (const row of limitedRows) {
        const patient = normalizeRow(row, usedEmails);

        if (!isInsertable(patient)) {
            summary.omitidosPorDatosInsuficientes += 1;
            continue;
        }

        if (existingRuts.has(patient.rut)) {
            summary.omitidosPorRutDuplicado += 1;
            continue;
        }

        const params = [
            patient.nombre,
            patient.apellido,
            patient.rut,
            patient.nacimiento,
            patient.sexo,
            patient.prevision_id,
            patient.telefono,
            patient.correo,
            patient.direccion,
            patient.pais,
            patient.observacion1,
            patient.observacion2,
            patient.observacion3,
            patient.apoderado,
            patient.apoderado_rut,
            patient.medicamentosUsados,
            patient.habitos,
            patient.comentariosAdicionales,
        ];

        try {
            if (!options.dryRun) {
                await db.ejecutarQuery(insertQuery, params);
            }

            existingRuts.add(patient.rut);
            usedEmails.add(patient.correo);
            summary.insertados += 1;
        } catch (error) {
            summary.errores += 1;
            console.error(`Error insertando RUT ${patient.rut}: ${error.message}`);
        }
    }

    console.log("Resumen importacion pacientes");
    console.log(JSON.stringify({
        archivo: options.file,
        dryRun: options.dryRun,
        ...summary,
    }, null, 2));

    await db.cerrarConexion();
    db.pool = null;
}

main().catch(async (error) => {
    console.error("Fallo la importacion:", error);
    try {
        const db = DataBase.getInstance();
        await db.cerrarConexion();
        db.pool = null;
    } catch (_) {
        // noop
    }
    process.exit(1);
});
