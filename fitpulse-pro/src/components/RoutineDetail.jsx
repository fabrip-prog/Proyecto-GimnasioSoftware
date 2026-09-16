import { useMemo } from "react";
import ExerciseCard from "./ExerciseCard";
import { Trophy } from "lucide-react";

export default function RoutineDetail({
  dayData,
  completedExercises,
  onToggleExercise,
  onSaveProgress,
  dayProgress = {},
}) {
  const totalExercises = dayData.exercises.length;
  const completedCount = useMemo(
    () => dayData.exercises.filter((ex) => completedExercises.has(ex.id)).length,
    [dayData.exercises, completedExercises]
  );
  const allDone = completedCount === totalExercises && totalExercises > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-ink">{dayData.title}</h2>
          <p className="text-sm text-ink-soft mt-0.5">{dayData.focus}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xl font-semibold text-ink">
            {completedCount}
            <span className="text-ink-muted text-base">/{totalExercises}</span>
          </span>
          <p className="text-xs text-ink-muted">ejercicios</p>
        </div>
      </div>

      {allDone && (
        <div className="alert-ok">
          <Trophy className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold">¡Rutina completada!</p>
            <p className="text-xs mt-0.5 opacity-90">
              Excelente trabajo, terminaste todos los ejercicios de hoy.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {dayData.exercises.map((exercise, i) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={i}
            completed={completedExercises.has(exercise.id)}
            onToggle={() => onToggleExercise(exercise.id)}
            onSaveProgress={
              onSaveProgress
                ? (weight, reps) => onSaveProgress(exercise.id, weight, reps)
                : undefined
            }
            defaultWeight={dayProgress[exercise.id]?.weight || ""}
            defaultReps={dayProgress[exercise.id]?.reps || ""}
          />
        ))}
      </div>
    </div>
  );
}
