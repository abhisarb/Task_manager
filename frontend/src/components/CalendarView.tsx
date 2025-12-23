import React from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Priority } from '../types';
import type { Task } from '../types';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarViewProps {
    tasks: Task[];
    onEventClick: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onEventClick }) => {
    const events = tasks.map(task => ({
        title: task.title,
        start: new Date(task.dueDate),
        end: new Date(task.dueDate), // For now, single day event
        allDay: true,
        resource: task,
    }));

    return (
        <div className="h-full bg-[#1d2125] p-4 text-[#b6c2cf]">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 'calc(100vh - 150px)' }} // Adjust height
                onSelectEvent={(event) => onEventClick(event.resource)}
                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                defaultView={Views.MONTH}
                eventPropGetter={(event) => {
                    const priority = event.resource.priority;
                    const priorityColor =
                        priority === Priority.URGENT ? '#ae2e24' :
                            priority === Priority.HIGH ? '#563630' :
                                priority === Priority.MEDIUM ? '#5f3811' :
                                    '#164b35';
                    return {
                        style: {
                            backgroundColor: priorityColor,
                            color: 'white',
                            borderRadius: '4px',
                            border: 'none',
                        },
                    };
                }}
            />
        </div>
    );
};
