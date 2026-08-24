import { useMemo } from "react";
import ExerciseCard from "./ExerciseCard";
import { ListChecks, Trophy } from "lucide-react";

export default function RoutineDetail({ dayData, completedExercises, onToggleExercise, onSaveProgress, dayProgress = {} }) {
  const totalExercises = dayData.exercises.length;
  const completedCount = useMemo(
    () => dayData.exercises.filter((ex) => completedExercises.has(ex.id)).length,
    [dayData.exercises, completedExercises]
  );
  const allDone = completedCount === totalExercises;

  return (
    <div className="space-y-4">
      {/* Day header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-emerald-400" />
            {dayData.title}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">{dayData.focus}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-white">
            {completedCount}
            <span className="text-slate-500 text-lg">/{totalExercises}</span>
          </span>
          <p className="text-xs text-slate-500">ejercicios</p>
        </div>
      </div>

      {/* All done celebration */}
      {allDone && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl animate-pulse">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <div>
            <p className="text-emerald-400 font-semibold">¡Rutina completada!</p>
            <p className="text-sm text-slate-400">
              Excelente trabajo. Has terminado todos los ejercicios de hoy.
            </p>
          </div>
        </div>
      )}

      {/* Exercise list */}
      <div className="space-y-3">
        {dayData.exercises.map((exercise, i) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={i}
            completed={completedExercises.has(exercise.id)}
            onToggle={() => onToggleExercise(exercise.id)}
            onSaveProgress={onSaveProgress ? (weight, reps) => onSaveProgress(exercise.id, weight, reps) : undefined}
            defaultWeight={dayProgress[exercise.id]?.weight || ""}
            defaultReps={dayProgress[exercise.id]?.reps || ""}
          />
        ))}
      </div>
    </div>
  );
}
