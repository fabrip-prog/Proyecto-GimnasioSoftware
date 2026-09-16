import { CheckCircle2, Circle, ChevronDown, ChevronUp, Target, Repeat, Timer } from "lucide-react";
import { useState } from "react";

export default function ExerciseCard({
  exercise,
  completed,
  onToggle,
  index,
  onSaveProgress,
  defaultWeight = "",
  defaultReps = "",
}) {
  const [expanded, setExpanded] = useState(false);
  const [weight, setWeight] = useState(defaultWeight);
  const [reps, setReps] = useState(defaultReps);
  const [justSaved, setJustSaved] = useState(false);

  function handleSave() {
    onSaveProgress(weight, reps);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  return (
    <div
      className={`rounded-xl border transition-colors overflow-hidden ${
        completed ? "bg-ok-soft border-ok-line" : "bg-surface border-line"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={onToggle}
            className="mt-0.5 shrink-0 cursor-pointer transition-transform hover:scale-110 active:scale-95"
            aria-label={completed ? "Marcar como pendiente" : "Marcar como completado"}
          >
            {completed ? (
              <CheckCircle2 className="w-5 h-5 text-ok" />
            ) : (
              <Circle className="w-5 h-5 text-ink-muted" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-mono text-ink-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3
                className={`text-sm font-semibold leading-tight ${
                  completed ? "text-ok" : "text-ink"
                }`}
              >
                {exercise.name}
              </h3>
            </div>

            <p className="text-xs text-ink-soft mt-1">{exercise.muscle}</p>

            <div className="flex flex-wrap gap-3 mt-3 text-xs text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-ink-muted" />
                {exercise.sets} series
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-ink-muted" />
                {exercise.reps} reps
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-ink-muted" />
                {exercise.rest} descanso
              </span>
            </div>
          </div>

          {exercise.mediaUrl && (
            <div className="hidden sm:block shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-line">
              <img src={exercise.mediaUrl} alt={exercise.name} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-ink-soft hover:text-ink hover:bg-sunken rounded-lg transition-colors cursor-pointer"
        >
          {expanded
            ? "Ocultar detalle"
            : onSaveProgress
              ? "Ver instrucciones y registrar carga"
              : "Ver instrucciones de ejecución"}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-line pt-4">
          {exercise.instructions && (
            <p className="text-sm text-ink-soft leading-relaxed">{exercise.instructions}</p>
          )}

          {onSaveProgress && (
            <div className="bg-sunken rounded-lg p-3 flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[110px]">
                <label className="label mb-1 text-xs">Peso (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ej: 50"
                  className="input py-2"
                />
              </div>
              <div className="flex-1 min-w-[110px]">
                <label className="label mb-1 text-xs">Reps logradas</label>
                <input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="Ej: 10"
                  className="input py-2"
                />
              </div>
              <button onClick={handleSave} className="btn-primary py-2">
                {justSaved ? "Guardado" : "Guardar"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
