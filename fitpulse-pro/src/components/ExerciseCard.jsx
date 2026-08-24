import { CheckCircle2, Circle, ChevronDown, ChevronUp, Info, Flame, Target, Timer } from "lucide-react";
import { useState } from "react";

export default function ExerciseCard({ exercise, completed, onToggle, index, onSaveProgress, defaultWeight="", defaultReps="" }) {
  const [expanded, setExpanded] = useState(false);
  const [weight, setWeight] = useState(defaultWeight);
  const [reps, setReps] = useState(defaultReps);

  return (
    <div
      className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${
        completed
          ? "bg-emerald-500/5 border-emerald-500/30"
          : "bg-slate-800/50 border-slate-700/40 hover:border-slate-600/60"
      }`}
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-4">
          {/* Completion toggle */}
          <button
            onClick={onToggle}
            className="mt-0.5 shrink-0 transition-transform duration-200 hover:scale-110 active:scale-95"
            aria-label={completed ? "Marcar como pendiente" : "Marcar como completado"}
          >
            {completed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <Circle className="w-6 h-6 text-slate-500 group-hover:text-slate-400" />
            )}
          </button>

          {/* Exercise info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-slate-500">
                #{String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3
              className={`text-base font-semibold leading-tight transition-colors ${
                completed ? "text-emerald-400 line-through decoration-emerald-500/40" : "text-white"
              }`}
            >
              {exercise.name}
            </h3>
            <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              {exercise.muscle}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium border border-emerald-500/20">
                <Flame className="w-3.5 h-3.5" />
                {exercise.sets} Series
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg text-xs font-medium border border-cyan-500/20">
                <Target className="w-3.5 h-3.5" />
                {exercise.reps} Reps
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/10 text-violet-400 rounded-lg text-xs font-medium border border-violet-500/20">
                <Timer className="w-3.5 h-3.5" />
                {exercise.rest} Descanso
              </span>
            </div>
          </div>

          {/* Visual demo placeholder */}
          <div className="hidden sm:flex shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-slate-700/60 to-slate-800/60 border border-slate-600/30 items-center justify-center overflow-hidden">
            {exercise.mediaUrl ? (
              <img src={exercise.mediaUrl} alt={exercise.name} className="w-full h-full object-cover" />
            ) : (
              <Flame className="w-7 h-7 text-emerald-500/40" />
            )}
          </div>
        </div>

        {/* Expand instructions toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-400 hover:text-emerald-400 bg-slate-700/20 hover:bg-slate-700/40 rounded-lg transition-all"
        >
          <Info className="w-3.5 h-3.5" />
          {expanded ? "Ocultar instrucciones" : "Ver instrucciones de ejecución"}
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Expandable instructions */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5 pt-1 space-y-3">
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/30">
            <p className="text-sm text-slate-300 leading-relaxed">
              {exercise.instructions}
            </p>
          </div>
          {onSaveProgress && (
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/30 flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs text-slate-400 mb-1">Peso (kg)</label>
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Ej: 50" className="w-full px-3 py-2 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs text-slate-400 mb-1">Reps logradas</label>
                <input type="number" value={reps} onChange={e => setReps(e.target.value)} placeholder="Ej: 10" className="w-full px-3 py-2 bg-slate-800 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
              </div>
              <button onClick={() => onSaveProgress(weight, reps)} className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
                Guardar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
