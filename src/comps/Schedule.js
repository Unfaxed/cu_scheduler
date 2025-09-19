import styles from "../styles/Main.module.css";
import { QUARTER_MAX } from "../lib/json/consts.js";

export default function Schedule({width, height, state, scheduleClick, options}) {
    const marginx_right = 5, marginx_left = 9000/width, marginy_top = 7, marginy_bottom = 2.5; //percent
    //to add back login link, set marginy_top=4, day text y=2.75%
    const w = (100 - (marginx_left + marginx_right)), h = (100 - (marginy_top + marginy_bottom));
    const daylen = 12.75; //10.75
    const height_scalar = 1.7;
    
    const getX = (i) => {return (marginx_left + (i*w/5.0))};
    const getY = (i) => {return ((i*h/daylen) + marginy_top)};

    let ut_editing = state.ut_editing;

    //hover over schedule time event listener
    function scheduleHover(day, time) {
        state.scheduleHover(day, time);
    }
    
    //const colors = ["#666A86", "#788AA3", "#92B6B1", "#B2C9AB", "#E8DDB5"] //slate palette

    let color_count = Object.entries(state.color_key).length % 5;

    const r = (
        <svg width={width} height={height_scalar*height}>

            {/* Draw numbers to select schedule variants on left side */}
            {state.schedule && (<>
                <g className={styles.avoid_times}>
                {state.schedule?.avoid_times?.map((hours_list, i) => (<g key={"avoid-day-" + i}>
                    {hours_list.map((hour_set, j) => {
                    //unavailable times display
                    if (hour_set.length < 2) return (<g key={"avoid-" + i + "-" + j}></g>);

                    return (<g key={"avoid-" + i + "-" + j}>                            
                            <rect x={getX(i) + "%"} y={getY(hour_set[0]/12.0) + "%"} 
                            height={(getY(hour_set[1]/12.0) - getY(hour_set[0]/12.0)) + "%"} width={(w/5) + "%"}></rect>
                        </g>
                    )})}
                </g>))}
                </g>
            </>)}

            {/* Draw horizontal grid lines and add day labels */}
            <g fill="white">
                {Array.from(new Array(13), (x, i) => i).map(i => (<g key={"horizontal-" + i}>
                    <rect x={(marginx_left) + "%"} y={getY(i) + "%"} height="2" width={w + "%"}></rect>
                    <text x={(0.2*marginx_left) + "%"} y ={(getY(i) + 1) + "%"}>{(((i+7) % 12) + 1) + ":00"}</text>
                </g>))}
                {["M", "T", "W", "Th", "F"].map((day, i) => (<g key={"day-label-" + i}>
                    <text x={(getX(i) + (w/10) - 0.5) + "%"} y="4.5%" width="2" height={h + "%"}>{day}</text>
                </g>))}
            </g>

            {state.schedule && (<>
            <g>
                {/* Render classes on selected schedule */}
                {state.schedule.classes.map((cl, i) => (<g key={"class-set-" + i}>
                    {cl.meeting_times.map(meeting_time => {
                        let x = getX(meeting_time.day) + 0.14, y = getY(meeting_time.start_time/12.0) + 0.08;

                        let color_num = state.color_key[cl.title]; //get color for class name if not already defined
                        if (color_num == undefined) {
                            color_num = color_count;
                            state.color_key[cl.title] = color_num;
                            color_count = (color_count+1) % 5;
                        }

                        let rect_width = (w/5) - 0.14;
                        if (cl.quarter != null){
                            rect_width /= QUARTER_MAX;
                            x += rect_width*cl.quarter;
                        }

                        return (
                            <g key={"class-" + i + "-day-" + meeting_time.day}>
                            <rect x={x + "%"} y={y + "%"} width={rect_width + "%"} 
                            height={(getY(meeting_time.end_time/12.0) - y) + "%"} 
                            className={styles["palette-" + color_num]} rx="6" ry="6"></rect>
                            
                            <g style={{fill: "#FFF"}} fontSize={width > 900 ? "13pt" : "8pt"}>
                                <text x={(x+0.5) + "%"} y={(y+2.4) + "%"} fontWeight="bold">{cl.title}</text>
                                <text x={(x+0.5) + "%"} y={(y+5) + "%"}>{((width > 590 && cl.quarter == null) ? "Section " : "") + cl.section + (width > 400 ? " (" + cl.type + ")" : "")}</text>
                            </g>
                            </g>
                        );
                    })}
                </g>))}
            </g>
            </>)}

            {/* Set up click & hover event listeners */}
            <g>
                {Array.from(new Array(5), (x, i) => i).map(xc => (<g key={"click-event-set-" + xc}>
                    {Array.from(new Array(Math.trunc(daylen*12)), (x, i) => i).map(yc => (
                        <rect x={getX(xc) + "%"} y={getY(yc/12)+ "%"} width={(w/5) + "%"} height={(h/daylen/12) + "%"} 
                        onMouseDown={() => scheduleClick(xc, yc)} onMouseUp={() => {
                            if (options.scheduleClickUp != undefined) options.scheduleClickUp(xc, yc)}
                        } onMouseOver={() => scheduleHover(xc, yc)} key={"click-event-" + xc + "-" + yc} style={{fill: "rgba(0, 0, 0, 0)", cursor: "crosshair"}}></rect>
                    ))}
                </g>))}
            </g>

            {/* Render avoid times and set up event listeners for clicks */}
            {(state.schedule != null && options.removeUT != undefined) && (<>
            <g>
                {state.schedule.avoid_times.map((hours_list, i) => (<g key={"avoid-x-day-" + i}>
                    {hours_list.map((hour_set, j) => {
                    if (hour_set.length < 2) return (<g key={"avoid-x-" + i + "-" + j}></g>);

                    const topClick = () => {
                        if (ut_editing == null) state.setUTEditing({day: i, index: j, top: true});
                        else { //send schedule click, z index higher than click event listeners
                            const coords = state.schedule.avoid_times[ut_editing.day][ut_editing.index];
                            scheduleClick(ut_editing.day, coords[0], true);
                        }
                    };
                    const bottomClick = () => {
                        if (ut_editing == null) state.setUTEditing({day: i, index: j, top: false});
                        else {
                            const coords = state.schedule.avoid_times[ut_editing.day][ut_editing.index];
                            scheduleClick(ut_editing.day, coords[1], true);
                        }
                    };

                    //render the x button to remove an unavailable time
                    return (<g key={"avoid-x-" + i + "-" + j}>
                    <g key={"avoid-x-" + i + "-" + j} style={{marginRight: "20px", marginTop: "5px"}}>
                        <image x={((getX(i+1)*width/100) - 20) + "px"} y={((getY(hour_set[0]/12.0)*height*height_scalar/100) + 8) + "px"} height="14" width="14" href="/icons/close.png" style={{cursor: "pointer"}} alt="Delete Time" 
                        onClick={()=> options.removeUT(i, j)}></image>
                    </g>
                    <g>
                        <g x={getX(i) + "%"} y={getY((hour_set[0]-2)/12.0) + "%"} className={styles.avoid_times_edit_container}
                        height="4%" width={(w/5) + "%"} onMouseDown={topClick} onMouseUp={topClick} onDragStart={topClick} onDragEnd={topClick}>
                            <g className={styles.avoid_times_edit}>
                                <rect x={getX(i) + "%"} y={getY(hour_set[0]/12.0) + "%"}
                                height="6px" width={(w/5) + "%"}
                                ></rect>
                            </g>
                        </g>
                        
                        <g x={getX(i) + "%"} y={(((getY(hour_set[1]/12.0)-2)*height*height_scalar/100) - 5) + "px"} className={styles.avoid_times_edit_container}
                        height="10px" width={(w/5) + "%"} onMouseDown={bottomClick} onMouseUp={bottomClick}>
                            <g className={styles.avoid_times_edit}>
                                <rect x={getX(i) + "%"} y ={((getY(hour_set[1]/12.0)*height*height_scalar/100)-5) + "px"}
                                height="6px" width={(w/5) + "%"}></rect>
                            </g>
                        </g>
                    </g>
                    </g>)})}
                </g>))}
            </g>
            </>)}

            {/* Draw the vertical grid lines, should be highest z-index */}
            <g fill="white">
                {Array.from(new Array(6), (x, i) => i).map(i => (<g key={"vertical-" + i}>
                    <rect x={getX(i) + "%"} y={marginy_top + "%"} width="2" height={h + "%"}></rect>
                </g>))}
            </g>

        </svg>
    );
    state.setColorKey(state.color_key);
    return r;
}