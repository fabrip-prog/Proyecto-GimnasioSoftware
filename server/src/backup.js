import fs from "node:fs";
import path from "node:path";
import { DB_PATH } from "./db.js";

const BACKUP_DIR = process.env.BACKUP_DIR
  ? path.resolve(process.env.BACKUP_DIR)
  : path.join(path.dirname(DB_PATH), "backups");

const KEEP = Number(process.env.BACKUP_KEEP || 14);
const INTERVAL_HOURS = Number(process.env.BACKUP_INTERVAL_HOURS || 24);

/**
 * Copia la base a un archivo con fecha. Se usa la API VACUUM INTO de SQLite,
 * que genera una copia consistente aunque haya escrituras en curso — copiar el
 * archivo a mano con WAL activo puede dejar un respaldo corrupto.
 */
export function runBackup() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const target = path.join(BACKUP_DIR, `kinefix-${stamp}.db`);

  // Import diferido: evita un ciclo con db.js al cargar el módulo.
  return import("./db.js").then(({ db }) => {
    db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
    prune();
    return target;
  });
}

/** Deja sólo los últimos KEEP respaldos. */
function prune() {
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith("kinefix-") && f.endsWith(".db"))
    .sort()
    .reverse();

  for (const stale of files.slice(KEEP)) {
    fs.rmSync(path.join(BACKUP_DIR, stale), { force: true });
  }
}

export function scheduleBackups() {
  if (process.env.BACKUP_DISABLED === "1") {
    console.log("Respaldos automáticos desactivados (BACKUP_DISABLED=1).");
    return;
  }

  const announce = (target) =>
    console.log(`Respaldo creado: ${target} (se conservan los últimos ${KEEP}).`);
  const complain = (err) => console.error("No se pudo crear el respaldo:", err.message);

  runBackup().then(announce).catch(complain);

  const timer = setInterval(
    () => runBackup().then(announce).catch(complain),
    INTERVAL_HOURS * 60 * 60 * 1000
  );

  // No mantener vivo el proceso sólo por el temporizador.
  timer.unref?.();
}

export { BACKUP_DIR };
