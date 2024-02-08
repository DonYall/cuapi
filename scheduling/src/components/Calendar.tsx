import { useStyletron } from "baseui";
import { useState, useLayoutEffect } from "react";
import { CourseDetails, MeetingDetails } from "../api/api";
import "./Calendar.css";
import { Button } from "baseui/button";
import { exportEventsToICS } from "../api/icsGenerator";
import { observer } from "mobx-react-lite";
import { useAppManager } from "../main";
import { toaster } from "baseui/toast";
import { Column, Row } from "./util";
import { ChevronLeft, ChevronRight } from "baseui/icon";
import { Popover } from "@mui/material";

/**
 * The CalendarTime interface is used to represent a time in the calendar.
 * @param hour The hour of the day (0-23)
 * @param minute The minute of the hour (0-59)
 */
export interface CalendarTime {
    hour: number;
    minute: number;
}

const getCalendarTimeString = (time: CalendarTime) => {
    // takes an hour and a minute and reutrns a string representation of the time in 12 hour format
    let hour = time.hour;
    let minute = time.minute;
    let suffix = "am";
    if (hour > 12) {
        hour = hour - 12;
        suffix = "pm";
    }
    if (hour === 0) {
        hour = 12;
    }
    if (minute < 10) {
        return `${hour}:0${minute} ${suffix}`;
    }
    return `${hour}:${minute} ${suffix}`;
};

export const CalendarTime = (props: { time: CalendarTime }) => {
    return <span>{getCalendarTimeString(props.time)}</span>;
};

export interface CalendarEvent {
    startTime: CalendarTime;
    endTime: CalendarTime;
    day: number; // 0-4 (Monday to Friday)
    title: string;
    course: CourseDetails;
    meeting: MeetingDetails;
    body: React.ReactNode;
    onClick: () => void;
    onHover: () => void;
    onLeave: () => void;
    color: string;
}

export interface CalendarProps {
    events: CalendarEvent[];
}

const CalendarGrid = observer(() => {
    /*
    Calendar grid will be a 5x13 grid that will be used to display the events.
    */

    const appManager = useAppManager();
    const [css, $theme] = useStyletron();

    const hours = [
        "8 am",
        "9 am",
        "10 am",
        "11 am",
        "12 pm",
        "1 pm",
        "2 pm",
        "3 pm",
        "4 pm",
        "5 pm",
        "6 pm",
        "7 pm",
        "8 pm",
    ];

    return (
        <table className="calendar-grid">
            <tr className="header-row">
                <td className="time-td" id="calendar-time-header"></td>
                <td id="calendar-monday-header">Monday</td>
                <td>Tuesday</td>
                <td>Wednesday</td>
                <td>Thursday</td>
                <td>Friday</td>
            </tr>
            {hours.map((hour) => {
                const cellClass = css({
                    transition: "all 0.2s",
                    ":hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                    },
                });

                return (
                    <tr>
                        <td className={"time-td"}>{hour}</td>
                        <td className={cellClass}></td>
                        <td className={cellClass}></td>
                        <td className={cellClass}></td>
                        <td className={cellClass}></td>
                        <td className={cellClass}></td>
                    </tr>
                );
            })}
        </table>
    );
});

const makeHexTransparent = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const EventPositioner = (props: {
    event: CalendarEvent;
    children: React.ReactNode;
}) => {
    // This div will be used to position the event on the grid
    // we use the start and end times to calculate the position of the event
    // firstly, the column will be the day of the week
    // the row will be the start time
    // the height will be the end time - start time

    const [css, $theme] = useStyletron();
    const [layout, setLayout] = useState({
        top: 0,
        left: 0,
        width: 0,
        height: 0,
    });

    useLayoutEffect(() => {
        const calculateLayout = () => {
            const startHour = props.event.startTime.hour - 7;
            const startMinute = props.event.startTime.minute;
            const endHour = props.event.endTime.hour - 7;
            const endMinute = props.event.endTime.minute;

            const timeHeaderCell = document.getElementById(
                "calendar-time-header"
            );
            // we will use this to calculate contextual size
            // the height of this cell is the same as the height of every hour
            // the width of this cell will be used as an offset as the first column represents the time (and not a day)
            const mondayHeaderCell = document.getElementById(
                "calendar-monday-header"
            );
            // we will use this to calculate contextual size
            // the width of this cell is the same as the width of every day
            // the height of this cell will be the same as the height of every hour
            const cellHeight = timeHeaderCell?.clientHeight + 1; // we add 1 to account for the border
            const dayWidth = mondayHeaderCell?.clientWidth + 1; // we add 1 to account for the border

            let leftPos = timeHeaderCell?.clientWidth + 2; // start by offsetting
            let topPos =
                startHour * cellHeight! + (startMinute / 60) * cellHeight!;
            let width = dayWidth - 2; // we subtract 2 to account for the border
            leftPos =
                leftPos! + width! * 1 * props.event.day + props.event.day * 2; // we add the width of the day cell

            let height =
                (endHour - startHour) * cellHeight! +
                ((endMinute - startMinute) / 60) * cellHeight! -
                3; // we subtract 2 to account for the border
            setLayout({
                top: topPos,
                left: leftPos,
                width: width,
                height: height,
            });
        };

        window.addEventListener("resize", calculateLayout);
        calculateLayout();

        return () => window.removeEventListener("resize", calculateLayout);
    }, [props.event.startTime, props.event.endTime]);

    return (
        <>
            <div
                className={css({
                    position: "absolute",
                    top: `${layout.top}px`,
                    left: `${layout.left}px`,
                    width: `${layout.width}px`,
                    height: `${layout.height}px`,
                    backgroundColor: makeHexTransparent(props.event.color, 0.5),
                    borderRadius: "12px",
                    // dashed inside border
                    border: "2px dashed black",
                    zIndex: 1,
                    overflow: "hidden",
                    padding: 0,
                    margin: 0,
                })}
                onClick={() => {
                    setPopoverOpen((prev) => !prev);
                }}
            >
                <div
                    className={css({
                        position: "relative",
                        display: "flex",
                        justifyContent: "left",
                        alignItems: "left",
                        height: "100%",
                        width: "100%",
                    })}
                >
                    <EventDisplay event={props.event} />
                </div>
            </div>
        </>
    );
};

const EventDisplay = (props: { event: CalendarEvent }) => {
    const [css, $theme] = useStyletron();
    // grid that has three rows or three columns depending on the container size
    return (
        <div
            className={css({
                display: "grid",
                gridTemplateColumns: "1fr",
                gridTemplateRows: "1fr 1fr",
                height: "30%",
                width: "100%",
                padding: "2px",
                margin: 0,
                fontFamily: "Inconsolata, monospace",
            })}
        >
            <div
                className={css({
                    display: "flex",
                    padding: 0,
                    margin: 0,
                    fontSize: "1.25em",
                    color: "white",
                })}
            >
                {props.event.title}
            </div>
            <span>
                <CalendarTime time={props.event.startTime} />
                {" - "}
                <CalendarTime time={props.event.endTime} />
            </span>
        </div>
    );
};

const CalendarButtonRow = (props: {
    onExport: () => void;
    onNextPage: () => void;
    onPrevPage: () => void;
    hasPrev: boolean;
    hasNext: boolean;
}) => {
    const [css, $theme] = useStyletron();
    return (
        <div
            className={css({
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                padding: "10px",

                backgroundColor: "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(10px)",
                borderRadius: "10px",
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
            })}
        >
            <Button kind="tertiary" onClick={props.onExport}>
                Export to ICS
            </Button>
            <Row
                $style={{
                    gap: "5px",
                }}
            >
                <Button
                    kind="tertiary"
                    disabled={!props.hasPrev}
                    onClick={props.onPrevPage}
                >
                    <ChevronLeft size={25} />
                </Button>
                <Button
                    kind="tertiary"
                    disabled={!props.hasNext}
                    onClick={props.onNextPage}
                >
                    <ChevronRight size={25} />
                </Button>
            </Row>
            <Button kind="tertiary">Export to Carleton Central</Button>
        </div>
    );
};

const CalendarEventsOverlay = (props: { events: CalendarEvent[] }) => {
    const [css, $theme] = useStyletron();

    return (
        <div
            className={css({
                position: "absolute",
                top: 0,
                left: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "100%",
                pointerEvents: "none",
            })}
        >
            {props.events.map((event) => {
                return (
                    <EventPositioner event={event}>
                        <EventDisplay event={event} />
                    </EventPositioner>
                );
            })}
        </div>
    );
};
/**
 * The Calendar component is a simple 5 day calendar that can display events.
 * It works by first creating a grid of 5 columns and 13 rows (8 am to 8 pm) and then it will overlay events on top of the grid.
 * @param props
 * @returns
 */
export const Calendar = observer((props: CalendarProps) => {
    // we want a div that will contain the grid and have the event overlay displayed directly on top of it
    const [css, $theme] = useStyletron();
    const appManager = useAppManager();

    return (
        <Column
            $style={{
                gap: "10px",
            }}
        >
            <div
                className={css({
                    display: "flex",
                    flexDirection: "column",
                    marginRight: "50px",
                    gap: "10px",
                })}
            >
                <Row>
                    <div
                        className={css({
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            userSelect: "none",
                        })}
                    >
                        <CalendarGrid />
                        <CalendarEventsOverlay events={props.events} />
                    </div>
                </Row>
                <Row>
                    <CalendarButtonRow
                        onExport={() => {
                            const icsString = exportEventsToICS(props.events);
                            const blob = new Blob([icsString], {
                                type: "text/calendar",
                            });
                            // trigger download
                            const link = document.createElement("a");
                            link.href = window.URL.createObjectURL(blob);
                            const currentDateStr = new Date().toISOString();
                            const name = `Carleton-Schedule-(${appManager.selectedTerm})-${currentDateStr}.ics`;
                            link.download = name;
                            link.click();
                        }}
                        onNextPage={() => {
                            appManager.nextSchedule();
                        }}
                        onPrevPage={() => {
                            appManager.previousSchedule();
                        }}
                        hasPrev={appManager.hasPreviousSchedule}
                        hasNext={appManager.hasNextSchedule}
                    />
                </Row>
            </div>
        </Column>
    );
});
