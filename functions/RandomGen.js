const generateRandom = async (min, max, selectedVis) => {
    // 1. compatibility of each visulization for a given data file using meta data ()
    // 2. display the type of visulization 

    //================================================================================================================================

    // //////////////// File:1 == "File:1 == visualization_table.csv"  ///////////////////////////////////
    const fs_vis_table = require("fs");
    var vis_table = fs_vis_table.readFileSync("static_file/vis_table.csv", "utf8");
    vis_table = vis_table.split("\n"); // SPLIT ROWS (STRING TO ARRAY)
    for (let i in vis_table) { // SPLIT COLUMNS
        vis_table[i] = vis_table[i].split(",");
    }
    if (!selectedVis.includes("Histogram")) {
        vis_table = vis_table.filter((e) => { return e[0] != 'Histogram' });
    }
    if (!selectedVis.includes("Bar Chart")) {
        vis_table = vis_table.filter((e) => { return !String(e[0]).includes("BarChart") });
    }
    if (!selectedVis.includes("Pie Chart")) {
        vis_table = vis_table.filter((e) => { return !String(e[0]).includes("PieChart") });
    }
    if (!selectedVis.includes("LineChart")) {
        vis_table = vis_table.filter((e) => {return !String(e[0]).includes("LineChart"); });
    }
    if (!selectedVis.includes("Scatterplot")) {
        vis_table = vis_table.filter((e) => { return !String(e[0]).includes("Scatterplot") });
    }

    // //////////////// File:2 == "Data type" from meta data (md_data):  "md_data.csv"  ///////////////////////////////////
    var meta_data = fs_vis_table.readFileSync("output_file/metadata.csv", "utf8"); // From Screen1 Input
    meta_data = meta_data.split("\n"); // SPLIT ROWS (STRING TO ARRAY)
    for (let i in meta_data) { // SPLIT COLUMNS
        meta_data[i] = meta_data[i].split(",");
    }

    // console.log(meta_data);

    // // ////////////////  File:3 ==  "DT" and Max#Val" meta data (data_md):  "importance_visualization_detail_table.csv"  ///////////////////////////////////
    var vis_table_imp = fs_vis_table.readFileSync("output_file/imp_detail_vis_table.csv", "utf8");
    vis_table_imp = vis_table_imp.split("\n"); // SPLIT ROWS (STRING TO ARRAY)
    for (let i in vis_table_imp) { // SPLIT COLUMNS
        vis_table_imp[i] = vis_table_imp[i].split(",");
    }

    
    // console.log(vis_table_imp);

    //================================== Crossover DBo without repetation  ===============================================
    function CO_DBo_repetation(CO_DBo) {
        updated_CO = []
        let unique_vis_CO = []

        function contains_row(current_DBo, row_2) {
            for (let i = 0; i < current_DBo.length; i++) {
                let count = 0
                //console.log("current_DBo[0].length", current_DBo[i].length)
                for (let j = 1; j < current_DBo[i].length; j++) {
                    if (current_DBo[i][j] == row_2[j])
                        count++
                }
                if (count == (current_DBo[i].length) - 1) {
                    //console.log("current_DBo[0].length", count, current_DBo[i].length)
                    return true;
                }
            }
            return false;
        }

        function check_row(DBo_row) {
            if (!DBo_row.length) return false; // if array is empty
            if (!contains_row(unique_vis_CO, DBo_row)) {
                unique_vis_CO.push(DBo_row);
                return DBo_row;
            }
            return false;
        }

        for (let i = 0; i < CO_DBo.length; i++) {
            let row = check_row(CO_DBo[i]); // unique vis in DBo list
            //console.log("row", row, row.length)
            if (row != false)
                updated_CO.push(row)
        }
        return updated_CO
    }
    //================================== End Crossover DBo without repetation  ===============================================

    //========================= CO_DBo fitness Evaluation==========================
    //DBo_evaluation= [["DBo", "Match_Score", "Coverage_imp", "Complexity", "Fitness"]]
    function DBo_evaluation_fxn(CO_DBo, no, len_DA) {
        let CO_DBo_evaluation = [];
        let match_DA_list_final = [];
        let coverage_DA_count = [];
        let coverage_imp = 0;
        let complexity = 0;

        //let match_sum = 0;
        for (let i = 0; i < CO_DBo.length; i++) {
            match_DA_list = Array.from(CO_DBo.length).fill("")
            const row = CO_DBo[i];
            // for complexity calculation
            const result = vis_table.find((e) => e[0] === row[1]);
            if (result) complexity += Number(result[3]);
            // count no of DA covered with out repetation
            for (var j = 2; j < row.length; j++) {
                if (row[j]) {
                    coverage_DA_count[j] = 1;
                    // repeated DA coverage gets overwritten  
                }
            }

            // for match score calculation
            for (let j = 2; j < row.length; j++) {
                DA_count = 0
                if (row[j]) {
                    for (var k = 1; k < vis_table_imp.length; k++) {
                        // consider the DA secquance in meta_data and vis_table_imp is same (vis_table_imp is just 1 column ahead)
                        if (CO_DBo[i][1] == vis_table_imp[k][0] && meta_data[1][j - 1] == vis_table_imp[k][4]) {
                            match_DA_list[j - 2] = Number(vis_table_imp[k][7]);
                        }
                    }
                }
            }
            match_DA_list_final.push(match_DA_list);
        }
        // Match Score sum calculation
        match_VA_imp_sum = 0
        match_count = 0;
        for (var i = 0; i < match_DA_list_final.length; i++) {
            const row = CO_DBo[i];
            // for complexity calculation
            for (var j = 0; j < len_DA; j++) {
                if (match_DA_list_final[i][j]) {
                    match_VA_imp_sum += Number(match_DA_list_final[i][j]);
                    //console.log("match_DA_list_final",match_DA_list_final[i][j], match_VA_imp_sum, match_count)
                    match_count++
                }
            }
        }
        // Match Score Normalization calculation
        match_score_nomalized = match_VA_imp_sum / (match_count * 100);

        // coverage_imp sum calculation
        // coverage_DA_count_sum = coverage_DA_count.length?((coverage_DA_count.reduce((p,e)=>p=p+e))):0;
        coverage_DA_count_sum = meta_data[3].slice(1).length ? ((meta_data[3].slice(1).reduce((p, e) => p = Number(p) + Number(e)))) : 0;

        for (let i = 2; i < coverage_DA_count.length; i++) {
            if (coverage_DA_count[i]) {
                coverage_imp += Number(meta_data[3][i - 1]);
            }
        }
        //console.log("coverage_DA_count,coverage_imp,coverage_DA_count_sum, match_VA_imp_sum,match_count,complexity,CO_DBo.length", coverage_DA_count,coverage_imp, coverage_DA_count_sum, match_VA_imp_sum, match_count,complexity,CO_DBo.length)

        // Fx = (( match_score_nomalized) + (coverage_imp/(coverage_DA_count_sum)) 
        //     -(complexity/(CO_DBo.length*100)))

        // Fx = ((2*match_score_nomalized) + (2*(coverage_imp/(coverage_DA_count_sum))) -
        //        (complexity/(CO_DBo.length*100)))

        // Fx = ((4*match_score_nomalized) + (4*(coverage_imp/(coverage_DA_count_sum))) -
        //        (1*(complexity/(CO_DBo.length*100))))

        // Fx = ((match_score_nomalized + (coverage_imp/(coverage_DA_count_sum))) +
        //         (1-(complexity/(CO_DBo.length*100)))) / 3

        Fx = ((match_score_nomalized) * (coverage_imp / (coverage_DA_count_sum))) -
            (complexity / (CO_DBo.length * 100))

        // Fx = ((match_score_nomalized) * (coverage_imp/(coverage_DA_count_sum))) *
        //         (1-(complexity/(CO_DBo.length*100)))    

        // Fx = (0.5*(match_score_nomalized)) * (0.3*(coverage_imp/(coverage_DA_count_sum))) *
        //         (0.2*(1-(complexity/(CO_DBo.length*100))))    

        // Fx = (((match_score_nomalized) * (coverage_imp/(coverage_DA_count_sum))) -
        //         (0.1*(complexity/(CO_DBo.length*100))))    

        // push to array for output
        CO_DBo_evaluation.push([
            no,
            Number(match_score_nomalized).toFixed(3),
            Number((coverage_imp / (coverage_DA_count_sum))).toFixed(3),
            Number((complexity / (CO_DBo.length * 100))).toFixed(3),
            Fx.toFixed(3)
        ]);

        return CO_DBo_evaluation;
    }

    //==================== End of CO_DBo fitness Evaluation=========================



    //// function to check Mandatory value (0/1) of each VA of each visualization for selected dashboard
    function check_mendatory(array) {
        const chart_name = array[1];
        const matched_chart_array = vis_table_imp.filter(ch => ch[0] == chart_name)
        return matched_chart_array.filter(chart => (chart[5] && array.includes(chart[2]))).length == matched_chart_array.length
    }


    DBo = [["DBo", "vis_name", ...meta_data[0].slice(1)]];
    // Total population of DBo for the random selection of candidates for crossover
    DBo_POP_num = 50

    for (var DBo_id = 1; DBo_id <= DBo_POP_num; DBo_id++) {
        each_DBo = [];
        var vis_table_row = vis_table.length;
        const DB_vis_no = Math.floor(Math.random() * (max - min)) + min; // DBo with 2 to 9 vis
        for (var DB_vis = 1; DB_vis <= DB_vis_no && DB_vis >= 1; DB_vis++) {
            // randomly selection of visulization
            const random_chart = Math.floor(Math.random() * (vis_table_row - 1)) + 1
            // loop to store DA_type in meta_data_DA without "DA_type as first column"
            let meta_data_DA = (meta_data[0].slice(1));
            let meta_data_DT = (meta_data[1].slice(1));
            let unique_md_DT = [];
            let unique_md_DA_DT = {};

            unique_md_DA_DT = meta_data_DT.map((e, i) => ({
                label: meta_data_DA[i],
                key: e
            }))
            //  finding uniques
            let unique = meta_data_DT.filter((item, i, ar) => ar.indexOf(item) === i);
            unique_md_DT.push(unique);

            let vis_details_matched = [];
            for (i = 1; i < vis_table_imp.length; i++) {
                // match random_chart with visualization present vis_table_imp and store them in "vis_details_matched" array
                if (vis_table_imp[i][0] == vis_table[random_chart][0]) {
                    vis_details_matched.push(vis_table_imp[i])
                }
            }
            if (!vis_details_matched.length) {
                DB_vis -= 1;
                continue;
            }

            DA_unique_val = meta_data[2].slice(1);
            // condition check=1 (DA presence in meta data) and check=2 (Max number of unique values)
            function vis_DT_check(DT, MaxDiffValue) {
                const len = unique_md_DA_DT.filter(e => e.key === DT).length;
                if (!len)
                    false;
                const MatchedDT_Array = unique_md_DA_DT.filter(e => e.key === DT);
                if (!MatchedDT_Array.length)
                    return false;
                const random_Matched_DT = Math.floor(Math.random() * (MatchedDT_Array.length))
                const label = MatchedDT_Array[random_Matched_DT].label;
                const var_index = meta_data_DA.findIndex(e => e === label);
                if (var_index != -1 && DA_unique_val[var_index] <= MaxDiffValue) {
                    return label;
                }
                return false;
            }
            // End condition check=1 and check=2

            /// add visulization mark for vega lite
            vis_name = []
            vis_mark = []
            // loop to store DA_type in meta_data_DA without "DA_type as first column"
            for (var i = 0; i < vis_table_row; i++) {
                vis_name.push(vis_table[i][0]);
                vis_mark.push(vis_table[i][1]);
            }
            let vis_name_mark = {};
            vis_name_mark = vis_mark.map((e, i) => ({
                label: vis_name[i],
                key: e
            }))

            DBo_rows = []
            const temp = Array.from(DBo.length).fill("")
            // console.log(DBo.length)
            temp[0] = "DBo_" + DBo_id    //+ "_"+ DB_vis;

            // randomly matching the the VA with DA present in meta data
            for (let i in vis_details_matched) {
                const label_randoly_DA = vis_DT_check(vis_details_matched[i][4], Number(vis_details_matched[i][6]))
                if (label_randoly_DA) {
                    const Label_Index = meta_data_DA.findIndex(e => e === label_randoly_DA);
                    if (Label_Index != -1)
                        temp[Label_Index + 2] = vis_details_matched[i][2] // +2 in temp for DBo and Vis_name
                    const charttypeobject = vis_name_mark.find(e => e.label == vis_details_matched[i][0])
                    // if (charttypeobject){
                    //     temp[1]=charttypeobject.key;
                    // }
                    if (charttypeobject) {
                        temp[1] = charttypeobject.label;
                    }
                    DBo_rows.push(temp);
                }
                else {
                    DB_vis -= 1
                    break;
                }
            }
            if (DBo_rows.length < vis_details_matched.length || temp.length == 1)
                continue;

            else if (temp.length > 2 && check_mendatory(temp)) {
                each_DBo.push(temp)
            }
            else {
                DB_vis -= 1;
                continue;
            }
        }// End of vis (1-9) repeatation loop

        vis_repeat = CO_DBo_repetation(each_DBo)
        // Any DBo that contains repeated visulization with same mapping will be discarded 
        if (each_DBo.length != vis_repeat.length) {
            // console.log("before vis_repeat",each_DBo.length, each_DBo)
            // console.log("after vis_repeat",vis_repeat.length, vis_repeat)
            DBo_id -= 1;
            continue;
        }

        for (var i = 0; i < vis_repeat.length; i++) {
            DBo.push(vis_repeat[i]);
        }
    }// End of DBo POP loop
    //console.log("DBo",DBo.length,DBo)


    //==================================Evaluation of DBo_POP===============================================
    DBo_evaluation = [["DBo", "Match_Score", "Coverage_imp", "Complexity", "Fitness"]]
    DBo_Eval_temp = {};
    DBo_Eval = [];
    // fetch each DBo individually from DBo array to evaluate it
    for (var i = 1; i < DBo.length; i++) {
        const DBo_row = DBo[i]
        if (!DBo_Eval_temp[DBo_row[0]]) {
            DBo_temp = [DBo_row]
            for (var j = i + 1; j < DBo.length; j++) {
                const DBo_row_2 = DBo[j]
                if (DBo_row_2[0] == DBo_row[0]) {
                    DBo_temp.push(DBo_row_2)
                }
            }
            DBo_Eval_temp[DBo_row[0]] = DBo_temp
        }
    }

    Object.keys(DBo_Eval_temp).forEach(key => {
        const obj = DBo_Eval_temp[key]
        // DBo will be created having length between 2 to 9
        if (obj.length > 9 || obj.length < 2)
            console.log("objlength", obj.length, obj)

        DBo_eval_id = obj[0][0];
        eval_result = DBo_evaluation_fxn(obj, DBo_eval_id, meta_data[0].slice(1).length)
        DBo_evaluation.push([eval_result])
        //console.log(eval_res)
    })
    //================================== End of Evaluation of DBo_POP===============================================

    // writing DBo_evaluation to csv file
    for (let i in DBo_evaluation) { // join COLUMNS
        DBo_evaluation[i] = DBo_evaluation[i].join(",");
    }
    var DBo_evaluation = DBo_evaluation.join("\n"); // join ROWS (STRING TO ARRAY)
    fs_vis_table.writeFile('output_file/DBo_evaluation.csv', DBo_evaluation, function (err) {
        if (err) throw err;
        console.log('DBo_evaluation is created successfully.');
    });


    // writing DBo to csv file
    for (let i in DBo) { // join COLUMNS
        DBo[i] = DBo[i].join(",");
    }
    DBo = DBo.join("\n"); // join ROWS (STRING TO ARRAY)
    fs_vis_table.writeFile('output_file/DBo_POP.csv', DBo, function (err) {
        if (err) throw err;
        console.log('DBo_POP is created successfully.');
    });

    return {
        DBo,
        DBo_evaluation
    }
}

module.exports = generateRandom;