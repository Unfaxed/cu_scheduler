
import { Select, MenuItem } from '@mui/material';

export default function Settings({semester}){

    const semesters = ["Summer 2024", "Spring 2024", "Fall 2023"];
    const curr = semester == null ? "spring 2024" : semester.replace("-", " ").toLowerCase();

    return (
        <div>
            <Select size="small" value={1} sx={{color: "white", width: "100%"}}> 
                {semesters.map((sem, i) => {
                    if (semesters[i].toLowerCase() == curr) return (
                        <MenuItem value={1} key={"semester-" + i}>{sem}</MenuItem>
                    );
                    else return (
                        <a key={"semester-" + i} href={"/?semester=" + sem.toLowerCase().replace(" ", "-")}><MenuItem>{sem}</MenuItem></a>
                    )
                })}
            </Select>
        </div>
    );
}