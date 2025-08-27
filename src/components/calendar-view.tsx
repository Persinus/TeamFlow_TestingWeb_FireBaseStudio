
"use client"

import * as React from "react"
import { parseISO, format, isSameDay } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Task } from "@/types"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface CalendarViewProps {
  tasks: Task[]
  onSelectTask: (task: Task) => void
}

export default function CalendarView({ tasks, onSelectTask }: CalendarViewProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const tasksByDueDate = React.useMemo(() => {
    const map = new Map<string, Task[]>()
    tasks.forEach(task => {
      if (task.dueDate) {
        const dueDate = typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate;
        const dateKey = format(dueDate, "yyyy-MM-dd")
        if (!map.has(dateKey)) {
          map.set(dateKey, [])
        }
        map.get(dateKey)?.push(task)
      }
    })
    return map
  }, [tasks])

  const tasksForSelectedDate = React.useMemo(() => {
    if (!date) return [];
    const dateKey = format(date, "yyyy-MM-dd");
    return tasksByDueDate.get(dateKey) || [];
  }, [date, tasksByDueDate]);
  
  const DayWithTasks: React.FC<{ date: Date }> = ({ date }) => {
    const dateKey = format(date, "yyyy-MM-dd")
    const tasksForDay = tasksByDueDate.get(dateKey) || []

    return (
        <div className="relative flex items-center justify-center h-full w-full">
            <span>{format(date, "d")}</span>
            {tasksForDay.length > 0 && (
                <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
            )}
        </div>
    )
  }

  return (
    <Card className="md:grid md:grid-cols-3 md:divide-x">
       <div className="p-4 md:col-span-2">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-0"
                components={{
                    DayContent: DayWithTasks
                }}
            />
       </div>
      <div className="p-4 border-t md:border-t-0">
          <h3 className="text-lg font-semibold mb-2">
            Công việc cho {date ? format(date, 'PPP') : '...'}
          </h3>
          {tasksForSelectedDate.length > 0 ? (
            <div className="space-y-2">
                {tasksForSelectedDate.map(task => (
                <button
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="w-full text-left p-2 rounded-md hover:bg-accent text-sm"
                >
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", {
                            "bg-green-500": task.status === 'done',
                            "bg-blue-500": task.status === 'todo',
                            "bg-yellow-500": task.status === 'in-progress',
                            "bg-gray-400": task.status === 'backlog',
                        })} />
                        <span className="flex-1 truncate font-medium">{task.title}</span>
                    </div>
                </button>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Không có công việc nào đến hạn vào ngày này.</p>
          )}
      </div>
    </Card>
  )
}
