import { getPreScheduleClass } from "../../lib/cu_utils";


export default async function handler(req, res){

    if (req.query.name == undefined) {
        res.status(406).json({error_msg: "Missing 'name' parameter!"});
        return;
    }

    var srcdb = req.query.srcdb;
    if (srcdb.length >= 10) srcdb = null;

    const res1 = await getPreScheduleClass(req.query.name, srcdb == null ? "" : srcdb);

    res.status(200).json(res1);

}