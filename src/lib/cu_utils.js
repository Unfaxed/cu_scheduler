export function CUtoModelTime(x){ //900 -> 12
    let mins = x % 100, hours = Math.trunc(x / 100);
    return ((hours-8)*12) + Math.trunc(mins/5);
}
export function ModelToCUTime(x){ //12 -> 900
    let mins = x % 12, hours = Math.trunc(x/12);
    return ((hours+8)*100) + (mins*5);
}

/*
{
    title: "CSCI 1234",
    type: "LEC",
    offerings: [
        {
            instructor: "A. Paradise",
            full: false,
            section: "011",
            meeting_times: [
                {day: 0, start_time: 0, end_time: 10},
                {day: 2, start_time: 0, end_time: 10}
            ]
        },
    ]
}
*/

export async function getPreScheduleClass(name, srcdb) { //fetch class data from CU API
    //spring classes released oct 12
    const res1 = await fetch("https://classes.colorado.edu/api/?page=fose&route=search&alias=" + name.toLowerCase(), {
        method: "POST",
        body: '{"other":{"srcdb":"' + srcdb + '"},"criteria":[{"field":"alias","value":"' + name.toLowerCase() + '"}]}'
    });
    const res = await res1.json();
    
    const types = [];
    const preschedule = [] //addition to full preschedule

    if (res.results == undefined || res.results.length == 0) return null;

    for (let i = 0; i < res.results.length; i++){
        const offering = res.results[i];
        const type = offering.schd, instructor = offering.instr, section = offering.no, full = offering.stat != "A";
        if (type == undefined || instructor == undefined){
            console.error("Could not find data from CU API response!");
            continue;
        }

        var preschedule_index = types.indexOf(type);
        if (preschedule_index == -1){
            preschedule_index = types.length;
            types.push(type);
            preschedule.push({
                title: name.toUpperCase(),
                type,
                offerings: []
            });
        }

        var meetings;
        try{
            meetings = JSON.parse(offering.meetingTimes);
        } catch (ex){
            console.error(ex);
            continue;
        }

        const meeting_times = [];
        for (let j = 0; j < meetings.length; j++){
            meeting_times.push({
                day: parseInt(meetings[j].meet_day),
                start_time: CUtoModelTime(parseInt(meetings[j].start_time)),
                end_time: CUtoModelTime(parseInt(meetings[j].end_time))
            })
        }

        const cl_offering = {instructor, type, section, full, meeting_times};

        //check if class is only offered for a quarter
        const offering_start = new Date(offering.start_date),
            offering_end = new Date(offering.end_date),
            fall_start = new Date(offering_start.getFullYear() + "-08-20");
            
        const spring = offering_end < fall_start;
        const threshold = 20;
        const semester_start = spring ? new Date(offering_start.getFullYear() + "-01-08") : new Date(offering_start.getFullYear() + "-08-20");
        const semester_end = spring ? new Date(offering_end.getFullYear() + "-05-02") : new Date(offering_end.getFullYear() + "-12-01");

        if (Math.abs(semester_start - offering_start) / 86400000 > threshold) cl_offering['quarter'] = 1;
        else if (Math.abs(semester_end - offering_end) / 86400000 > threshold) cl_offering['quarter'] = 0;

        preschedule[preschedule_index].offerings.push(cl_offering)

    }
    return preschedule;
}