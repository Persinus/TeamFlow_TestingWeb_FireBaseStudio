
"use client"

import * as React from "react"
import { parseISO, format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Task } from "@/types"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"

interface CalendarViewProps {
  tasks: Task[]
  onSelectTask: (task: Task) => void
}

export default function CalendarView({ tasks, onSelectTask }: CalendarViewProps) {
  const [month, setMonth] = React.useState(new Date())

  // Memoize tasks by due date for quick lookup
  const tasksByDueDate = React.useMemo(() => {
    const map = new Map<string, Task[]>()
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = format(parseISO(task.dueDate), "yyyy-MM-dd")
        if (!map.has(dateKey)) {
          map.set(dateKey, [])
        }
        map.get(dateKey)?.push(task)
      }
    })
    return map
  }, [tasks])

  const DayWithTasks: React.FC<{ displayMonth: Date, date: Date }> = ({ displayMonth, date }) => {
    const dateKey = format(date, "yyyy-MM-dd")
    const tasksForDay = tasksByDueDate.get(dateKey) || []

    return (
      <Popover>
        <PopoverTrigger asChild disabled={tasksForDay.length === 0}>
           <div className={cn(
               "h-full w-full relative flex items-center justify-center", 
               tasksForDay.length > 0 && "cursor-pointer"
            )}>
                <span>{format(date, "d")}</span>
                {tasksForDay.length > 0 && (
                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                )}
           </div>
        </PopoverTrigger>
        {tasksForDay.length > 0 && (
          <PopoverContent className="w-80 p-2 space-y-2">
            <p className="text-sm font-semibold px-2">{format(date, 'PPP')}</p>
            {tasksForDay.map(task => (
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
                    <span className="flex-1 truncate">{task.title}</span>
                </div>
              </button>
            ))}
          </PopoverContent>
        )}
      </Popover>
    )
  }

  return (
    <Card>
      <Calendar
        mode="single"
        month={month}
        onMonthChange={setMonth}
        className="p-0"
        classNames={{
            months: "flex flex-col sm:flex-row",
            month: "space-y-4 p-4",
            caption: "flex justify-center pt-1 relative items-center",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 h-16",
            day: cn(buttonVariants({ variant: "ghost" }), "h-full w-full p-0 font-normal aria-selected:opacity-100 rounded-none"),
            day_selected: "bg-accent text-accent-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
        }}
        components={{
          Day: DayWithTasks
        }}
      />
    </Card>
  )
}
