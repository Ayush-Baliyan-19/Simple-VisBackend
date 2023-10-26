const geneticAlgorithm = async (DBo_POP,DBo_POP_eval) => {
    const fs_DBo_POP = require("fs");

    // Load meta data file
    // //////////////// File:2 == "Data type" from meta data (md_data):  "md_data.csv"  ///////////////////////////////////
    var meta_data = fs_DBo_POP.readFileSync("output_file/metadata.csv", "utf8");
    meta_data = meta_data.split("\n"); // SPLIT ROWS (STRING TO ARRAY)
    for (let i in meta_data) {
        // SPLIT COLUMNS 
        meta_data[i] = meta_data[i].split(",");
    }

    // //////////////// File:1 == "File:1 == visualization_table.csv"  ///////////////////////////////////
    var vis_table = fs_DBo_POP.readFileSync("static_file/vis_table.csv", "utf8");
    vis_table = vis_table.split("\n"); // SPLIT ROWS (STRING TO ARRAY)
    for (let i in vis_table) {
        // SPLIT COLUMNS
        vis_table[i] = vis_table[i].split(",");
    }

    // // ////////////////  File:3 ==  "DT" and Max#Val" meta data (data_md):  "importance_visualization_detail_table.csv"  ///////////////////////////////////
    var imp_detail_vis_table = fs_DBo_POP.readFileSync(
        "output_file/imp_detail_vis_table.csv",
        "utf8"
    );
    imp_detail_vis_table = imp_detail_vis_table.split("\n"); // SPLIT ROWS (STRING TO ARRAY)
    for (let i in imp_detail_vis_table) {
        imp_detail_vis_table[i] = imp_detail_vis_table[i].split(",");
    }

    // //////////////// File:1 == "File:1 == visualization_table.csv"  ///////////////////////////////////
    var vis_table_imp = fs_DBo_POP.readFileSync(
        "output_file/imp_detail_vis_table.csv",
        "utf8"
    );
    vis_table_imp = vis_table_imp.split("\n"); // SPLIT ROWS (STRING TO ARRAY)
    for (let i in vis_table_imp) {
        // SPLIT COLUMNS
        vis_table_imp[i] = vis_table_imp[i].split(",");
    }

    // Evaluate each all 4 Pairs (compare Fitness values and select best of each pair)
    // //////////////// File:1 == "File:1 == DBo_POP.csv"  ///////////////////////////////////
    // var DBo_POP = fs_DBo_POP.readFileSync("output_file/DBo_POP.csv", "utf8");
    DBo_POP = DBo_POP.split("\n"); // SPLIT ROWS (STRING TO ARRAY)
    for (let i in DBo_POP) {
        // SPLIT COLUMNS
        DBo_POP[i] = DBo_POP[i].split(",");
    }


    // //////////////////////////////////
    // var DBo_POP_eval = fs_DBo_POP.readFileSync(
    //     "output_file/DBo_evaluation.csv",
    //     "utf8"
    // );
    DBo_POP_eval = DBo_POP_eval.split("\n"); // SPLIT ROWS (STRING TO ARRAY)
    for (let i in DBo_POP_eval) {
        // SPLIT COLUMNS
        DBo_POP_eval[i] = DBo_POP_eval[i].split(",");
    }
    //================================== Crossover DBo without repetation  ===============================================

    function contains_row(current_DBo, row_2) {
        for (let i = 0; i < current_DBo.length; i++) {
            let count = 0;
            //console.log("current_DBo[0].length", current_DBo[i].length)
            for (let j = 1; j < current_DBo[i].length; j++) {
                if (current_DBo[i][j] == row_2[j]) count++;
            }
            if (count == current_DBo[i].length - 1) {
                //console.log("current_DBo[0].length", count, current_DBo[i].length)
                return true;
            }
        }
        return false;
    }

    function check_row(DBo_row, unique_vis_CO, callback) {
        // console.log(DBo_row.length);
        if (!DBo_row.length) return false; // if array is empty
        if (!contains_row(unique_vis_CO, DBo_row)) {
            callback();
            return Array.from(DBo_row);
        }
        return false;
    }

    function CO_DBo_repetation(CO_DBo) {
        updated_CO = [];
        let unique_vis_CO = [];
        // console.log(CO_DBo);
        for (let i = 0; i < CO_DBo.length; i++) {
            let row = check_row(CO_DBo[i], unique_vis_CO, () =>
                unique_vis_CO.push(CO_DBo[i])
            ); // unique vis in DBo list
            //console.log("row", row, row.length)
            if (row != false) updated_CO.push(row);
        }
        return Array.from(updated_CO);
    }
    //================================== End Crossover DBo without repetation  ===============================================

    //========================= CO_DBo fitness Evaluation==========================
    //DBo_evaluation= [["DBo", "Match_Score", "Coverage_imp", "Complexity", "Fitness"]]
    function DBo_evaluation(CO_DBo, no, len_DA) {
        let CO_DBo_evaluation = [];
        let match_DA_list_final = [];
        let coverage_DA_count = [];
        let coverage_imp = 0;
        let complexity = 0;

        //let match_sum = 0;
        for (let i = 0; i < CO_DBo.length; i++) {
            match_DA_list = Array.from(CO_DBo.length).fill("");
            const row = Array.from(CO_DBo[i]);
            // for complexity calculation
            const result = vis_table.find((e) => e[0] === row[1]);
            if (result) complexity += Number(result[3]);
            // count no of DA covered with out repetation
            for (let j = 2; j < row.length; j++) {
                if (row[j]) {
                    coverage_DA_count[j] = 1;
                    // repeated DA coverage gets overwritten
                }
            }

            // for match score calculation
            for (let j = 2; j < row.length; j++) {
                DA_count = 0;
                if (row[j]) {
                    for (let k = 1; k < vis_table_imp.length; k++) {
                        // consider the DA secquance in meta_data and vis_table_imp is same (vis_table_imp is just 1 column ahead)
                        if (
                            CO_DBo[i][1] == vis_table_imp[k][0] &&
                            meta_data[1][j - 1] == vis_table_imp[k][4]
                        ) {
                            match_DA_list[j - 2] = Number(vis_table_imp[k][7]);
                        }
                    }
                }
            }
            match_DA_list_final.push(Array.from(match_DA_list));
        }
        // Match Score sum calculation
        match_VA_imp_sum = 0;
        match_count = 0;
        for (let i = 0; i < match_DA_list_final.length; i++) {
            // const row = CO_DBo[i];
            // for complexity calculation
            for (let j = 0; j < len_DA; j++) {
                if (match_DA_list_final[i][j]) {
                    match_VA_imp_sum += Number(match_DA_list_final[i][j]);
                    //console.log("match_DA_list_final",match_DA_list_final[i][j], match_VA_imp_sum, match_count)
                    match_count++;
                }
            }
        }
        // Match Score Normalization calculation
        match_score_nomalized = match_VA_imp_sum / (match_count * 100);

        // coverage_imp sum calculation
        // coverage_DA_count_sum = coverage_DA_count.length?((coverage_DA_count.reduce((p,e)=>p=p+e))):0;
        coverage_DA_count_sum = meta_data[3].slice(1).length
            ? meta_data[3].slice(1).reduce((p, e) => (p = Number(p) + Number(e)))
            : 0;

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

        Fx =
            match_score_nomalized * (coverage_imp / coverage_DA_count_sum) -
            complexity / (CO_DBo.length * 100);

        // Fx = ((match_score_nomalized) * (coverage_imp/(coverage_DA_count_sum))) *
        //         (1-(complexity/(CO_DBo.length*100)))

        // Fx = (0.5*(match_score_nomalized)) * (0.3*(coverage_imp/(coverage_DA_count_sum))) *
        //         (0.2*(1-(complexity/(CO_DBo.length*100))))

        // Fx = (((match_score_nomalized) * (coverage_imp/(coverage_DA_count_sum))) -
        //         (0.1*(complexity/(CO_DBo.length*100))))

        // push to array for output
        CO_DBo_evaluation.push(
            Array.from([
                "DBo_Eval_" + no,
                Number(match_score_nomalized).toFixed(3),
                Number(coverage_imp / coverage_DA_count_sum).toFixed(3),
                Number(complexity / (CO_DBo.length * 100)).toFixed(3),
                Fx.toFixed(3),
            ])
        );

        return Array.from(CO_DBo_evaluation);
    }

    //==================== End of CO_DBo fitness Evaluation=========================

    bf_exe_ts = [];
    af_exe_ts = [];
    ga_exe_ts = [];
    worst_fv = [];
    best_fv = [];
    date = [];
    avg_fv = [];
    ga_analysis = [
        [
            "gen_num",
            "date_time",
            "time_start(ms)",
            "time_end(ms)",
            "exe_time(ms)",
            "best_fv",
            "worst_fv",
            "avg_fv",
        ],
    ];

    var first_now = new Date(),
        bf_exe = +first_now;
    (if_c = 0), (el_c = 0);
    CO_num = 20000;

    function in_array(array, el) {
        for (let i = 0; i < array.length; i++) if (array[i] == el) return true;
        return false;
    }

    function get_rand(array, gen_nums, callback) {
        if (!array.length) return false; // if array is empty
        let rand = array[Math.floor(Math.random() * array.length)]; // between 0 and length
        if (!in_array(gen_nums, rand) && gen_nums.length <= 4) {
            callback(rand);
            return rand;
        }
        if (gen_nums.length <= 4) return get_rand(array, gen_nums, callback);
        return false;
    }

    // to get random values
    function random_num(DT_matched, index_id) {
        var random_index_id = Math.floor(Math.random() * DT_matched.length);
        if (DT_matched[random_index_id] == index_id)
            return random_num(DT_matched, index_id);
        else return random_index_id;
    }

    // to find index of new VA type having same DA_name
    function vis_DA_varation(index_id, unique_md_DA_DT, meta_data_DT) {
        temp_index = [];
        for (let i = 0; i < unique_md_DA_DT.length; i++) {
            if (unique_md_DA_DT[i].key == meta_data_DT[index_id]) temp_index.push(i);
        }
        let random_index_id = random_num(temp_index, index_id);
        return temp_index[random_index_id];
    }

    for (let num = 1; num <= CO_num; num++) {
        temp_DBo = [];
        // find best of (Pair1_1 vs Pair1_2) and (Pair2_1 vs Pair2_2)
        for (let i = 1; i < DBo_POP.length; i++) {
            temp_DBo[i - 1] = DBo_POP[i][0];
        }
        // fxn count unique no of DBo from list of all repeted DBo in DBo_POP file
        let temp_DBo_unique = temp_DBo.filter(
            (item, i, ar) => ar.indexOf(item) === i
        );

        ////////////////////////////////  Random selection of 2 pairs for crossover from Population //////////////////////////////////////////////////////////////////
        // check do random selected no is already present in array if present: true else: false
        let gen_nums = [];

        const rand_CO_pair = [];
        for (let i = 0; i < 4; i++) {
            let a = get_rand(temp_DBo_unique, gen_nums, (rand) => gen_nums.push(rand)); // unique DBo list
            rand_CO_pair.push(a);
        }
        const Pair1_1 = rand_CO_pair[0];
        const Pair1_2 = rand_CO_pair[1];
        const Pair2_1 = rand_CO_pair[2];
        const Pair2_2 = rand_CO_pair[3];

        ////////////////////////////////  End of Random selection of 2 pairs for crossover from Population //////////////////////////////////////////////////////////////////

        //Find index of all 4 DBo in evaluation file and compare theirs fitness value keep best of each for crossover
        // // find best of (Pair1_1 vs Pair1_2) and (Pair2_1 vs Pair2_2)

        pair_values = [];
        for (let k = 0; k < 4; k++) {
            for (let j = 1; j < DBo_POP_eval.length; j++) {
                if (rand_CO_pair[k] === DBo_POP_eval[j][0]) {
                    pair_values[k] = DBo_POP_eval[j][4];
                }
            }
        }

        // find best candidate of (Pair1_1 vs Pair1_2) and (Pair2_1 vs Pair2_2) for crossover
        let candidate_1;
        let candidate_2;
        if (pair_values[0] > pair_values[1]) candidate_1 = Pair1_1;
        else candidate_1 = Pair1_2;
        if (pair_values[2] > pair_values[3]) candidate_2 = Pair2_1;
        else candidate_2 = Pair2_2;
        // storing all vis(rows) of best DBo for CO
        candidate_1_DBo = [];
        candidate_2_DBo = [];
        for (let i = 0; i < DBo_POP.length; i++) {
            if (candidate_1 == DBo_POP[i][0])
                candidate_1_DBo.push(Array.from(DBo_POP[i]));
            if (candidate_2 == DBo_POP[i][0])
                candidate_2_DBo.push(Array.from(DBo_POP[i]));
        }

        // // // randomly selection for different crossover points of candidate "candidate_1_DBo" and "candidate_2_DBo"
        candi_1_len = candidate_1_DBo.length;
        candi_2_len = candidate_2_DBo.length;
        if (candi_1_len > 9 || candi_2_len > 9) num -= 1;
        // console.log("candidate 1 and 2", candi_1_len, candi_2_len);

        // random number to selecte generation of "offspring_1" or "offspring_2"
        rand_candi_point = Math.floor(Math.random() * 2) + 1;
        if (rand_candi_point == 1) {
            selected_CO_points_candi_1 =
                Math.floor(Math.random() * (candi_1_len - 1)) + 1;
            selected_CO_points_candi_2 =
                9 -
                (Math.floor(Math.random() * (9 - selected_CO_points_candi_1 - 1)) + 1);
        }
        if (rand_candi_point == 2) {
            selected_CO_points_candi_2 =
                Math.floor(Math.random() * (candi_2_len - 1)) + 1;
            selected_CO_points_candi_1 =
                9 -
                (Math.floor(Math.random() * (9 - selected_CO_points_candi_2 - 1)) + 1);
        }

        // // // crossover of candidate "candidate_1_DBo" and "candidate_2_DBo" with randomly selected crossover points
        // / // "candidate_1_DBo" into 2 parts based on randomly selected crossover points
        steps_candi1_part1 = selected_CO_points_candi_1 - 1;
        steps_candi1_part2 = candi_1_len - selected_CO_points_candi_1 - 1;
        var part1_candidate_1_DBo = candidate_1_DBo.slice(
            0,
            selected_CO_points_candi_1,
            steps_candi1_part1
        );
        var part2_candidate_1_DBo = candidate_1_DBo.slice(
            selected_CO_points_candi_1,
            candi_1_len,
            steps_candi1_part2
        );
        // // // "candidate_2_DBo" into 2 parts based on randomly selected crossover points
        steps_candi2_part1 = selected_CO_points_candi_2 - 1;
        steps_candi2_part2 = candi_1_len - selected_CO_points_candi_2 - 1;
        var part1_candidate_2_DBo = candidate_2_DBo.slice(
            0,
            selected_CO_points_candi_2,
            steps_candi2_part1
        );
        var part2_candidate_2_DBo = candidate_2_DBo.slice(
            selected_CO_points_candi_2,
            candi_2_len,
            steps_candi2_part2
        );

        /////////////////////////////////////  End of generation of 2 offspring ///////////////////////////////////
        function offspring(rand_point) {
            // generation of "offspring_1"
            // join both candiate_1 part_1 and  candiate_2 part_2 to generate "offspring_1"
            if (rand_point == 1) {
                offspring_1 = [];
                offspring_1 = part1_candidate_1_DBo.concat(part2_candidate_2_DBo);
                return [...offspring_1];
            }
            // generation of "offspring_2"
            // join both candiate_1 part_2 and  candiate_2 part_1 to generate "offspring_2"
            if (rand_point == 2) {
                offspring_2 = [];
                offspring_2 = part2_candidate_1_DBo.concat(part1_candidate_2_DBo);
                return [...offspring_2];
            }
        }

        final_CO_offspring_temp = offspring(rand_candi_point);
        // 1. here is repetation of vis in DBo,  we need CO_DBo_repetation() ==> crossover
        final_CO_offspring = CO_DBo_repetation(final_CO_offspring_temp);
        final_CO_offspring_eval = DBo_evaluation(
            final_CO_offspring,
            num,
            meta_data[0].slice(1).length
        );

        /////////////////////////////////////  End of generation of 2 offspring ///////////////////////////////////

        //////////////////////////////////////==== Perform mutaion on this offspring  ===///////////////////////////////////////
        // Two Steps:
        // 1. Map given vis VA with other DA
        // 2. Add and remove vis from given vis table and final_CO_offspring respectively

        // possible cases of mutation
        // 1. only 1
        // if (Only_1_2==1)

        // 2. Only 1 and 2(a)
        // if (Only_1_2==1 && only_2a_2b==1)

        // 3. Only 1 and 2(b)
        // if (Only_1_2==1 && only_2a_2b==2)

        // 4. only 2(a)
        // if (Only_1_2==1 && only_2a_2b==1)

        // 5. only 2(b)
        // if (Only_1_2==1 && only_2a_2b==2)

        // 6. only 2(a) and 2(b)
        // if (Only_1_2==2)

        Only_1_2 = Math.floor(Math.random() * 10) + 1;
        Only_2ab_check = 0;
        // // 1. Map given vis VA with other DA
        // loop to store DA_type in meta_data_DA without "DA_type as first column"
        mapping_muted_offspring = [];
        let mapping_muted_offspring_eval = [];
        if (Only_1_2 <= 8 && final_CO_offspring.length > 1) {
            // console.log("Mapping",final_CO_offspring.length)
            let meta_data_DA = meta_data[0].slice(1);
            let meta_data_DT = meta_data[1].slice(1);
            let unique_md_DA_DT = [];

            // map DA_type to DA_name
            unique_md_DA_DT = meta_data_DT.map((e, i) => ({
                label: meta_data_DA[i],
                key: e,
            }));

            //to get the value and index of the each vis of dashboard contains VA
            let VA_index;
            let VA_value;
            for (let i = 0; i < final_CO_offspring.length; i++) {
                for (let j = 2; j < meta_data[0].length; j++) {
                    if (
                        final_CO_offspring[i][j] !== "" &&
                        final_CO_offspring[i][j] !== undefined
                    ) {
                        VA_index = j - 2;
                        VA_value = final_CO_offspring[i][j];
                        var new_VA_index = vis_DA_varation(
                            VA_index,
                            unique_md_DA_DT,
                            meta_data_DT
                        );
                        if (!final_CO_offspring[i][new_VA_index + 2]) {
                            // there could be issues if newly chosen DA_name present on index greater than currently chosen index: it will get replaced again
                            final_CO_offspring[i][j] = "";
                            final_CO_offspring[i][new_VA_index + 2] = VA_value;
                        } else {
                            j -= 1;
                            continue;
                        }
                    }
                }
            }
            mapping_muted_offspring_temp = Array.from(final_CO_offspring);
            // 2. here is repetation of vis in DBo,  we need CO_DBo_repetation() ==> Mapping

            mapping_muted_offspring = CO_DBo_repetation(mapping_muted_offspring_temp);
            mapping_muted_offspring_eval = DBo_evaluation(
                final_CO_offspring,
                num,
                meta_data[0].slice(1).length
            );
        } // end for (Only_1_2<=8)

        // // 2. Add and remove vis from given vis table and final_CO_offspring respectively
        if ((Only_1_2 > 8 && Only_1_2 < 11) || Only_2ab_check == 1) {
            only_2a_2b = Math.floor(Math.random() * 2) + 1;

            // a. remove visualization:
            if (only_2a_2b == 1 && final_CO_offspring.length > 2) {
                var offspring_len = final_CO_offspring.length;
                const random_vis = Math.floor(Math.random() * offspring_len) + 1; // between 0 and length
                vis_remove_muted_offspring = [];
                function deleteRow(arr, row) {
                    arr = arr.slice(0); // make copy
                    arr.splice(row - 1, 1);
                    return [...arr];
                }
                vis_remove_muted_offspring = deleteRow(final_CO_offspring, random_vis);
                vis_remove_muted_offspring_eval = DBo_evaluation(
                    vis_remove_muted_offspring,
                    num,
                    meta_data[0].slice(1).length
                );
                mapping_muted_offspring = [...vis_remove_muted_offspring];
                mapping_muted_offspring_eval = [...vis_remove_muted_offspring_eval];
            } // end for (only_2a_2b==1)

            //========================================// b. add new visualization:========================================================================================
            // b. add new visualization:
            if (only_2a_2b == 2) {
                //|| (only_1>5 && only_1<11)
                function DB_generation() {
                    //// function to check Mandatory value (0/1) of each VA of each visualization for selected dashboard
                    function check_mendatory(array) {
                        const chart_name = array[1];
                        const matched_chart_array = imp_detail_vis_table.filter(
                            (ch) => ch[0] == chart_name
                        );
                        return (
                            matched_chart_array.filter(
                                (chart) => chart[5] && array.includes(chart[2])
                            ).length == matched_chart_array.length
                        );
                    }
                    DBo = [];
                    // loop for generating 1 random visualization
                    for (var DB_vis = 1; DB_vis <= 1 && DB_vis >= 1; DB_vis++) {
                        // randomly selection of visulization
                        const random_chart =
                            Math.floor(Math.random() * (vis_table.length - 1)) + 1;
                        // loop to store DA_type in meta_data_DA without "DA_type as first column"
                        let meta_data_DA = meta_data[0].slice(1);
                        let meta_data_DT = meta_data[1].slice(1);
                        let unique_md_DT = [];
                        let unique_md_DA_DT = {};

                        unique_md_DA_DT = meta_data_DT.map((e, i) => ({
                            label: meta_data_DA[i],
                            key: e,
                        }));
                        //  finding uniques
                        let unique = meta_data_DT.filter(
                            (item, i, ar) => ar.indexOf(item) === i
                        );
                        unique_md_DT.push([...unique]);

                        let vis_details_matched = [];
                        for (i = 1; i < imp_detail_vis_table.length; i++) {
                            // match random_chart with visualization present imp_detail_vis_table and store them in "vis_details_matched" array
                            if (imp_detail_vis_table[i][0] == vis_table[random_chart][0]) {
                                vis_details_matched.push([...imp_detail_vis_table[i]]);
                            }
                        }

                        DA_unique_val = meta_data[2].slice(1);
                        // // condition check=1 (DA presence in meta data) and check=2 (Max number of unique values)
                        function vis_DT_check(DT, MaxDiffValue) {
                            const len = unique_md_DA_DT.filter((e) => e.key === DT).length;
                            if (!len) false;
                            const MatchedDT_Array = unique_md_DA_DT.filter((e) => e.key === DT);
                            if (!MatchedDT_Array.length) return false;
                            const random_Matched_DT = Math.floor(
                                Math.random() * MatchedDT_Array.length
                            );
                            const label = MatchedDT_Array[random_Matched_DT].label;
                            const var_index = meta_data_DA.findIndex((e) => e === label);
                            if (var_index != -1 && DA_unique_val[var_index] <= MaxDiffValue) {
                                return label;
                            }
                            return false;
                        }

                        /// add visulization mark for vega lite
                        vis_name = [];
                        vis_mark = [];
                        // loop to store DA_type in meta_data_DA without "DA_type as first column"
                        for (var i = 0; i < vis_table.length; i++) {
                            vis_name.push(vis_table[i][0]);
                            vis_mark.push(vis_table[i][1]);
                        }
                        let vis_name_mark = {};
                        vis_name_mark = vis_mark.map((e, i) => ({
                            label: vis_name[i],
                            key: e,
                        }));

                        DBo_rows = [];
                        const temp = Array.from(DBo.length).fill("");
                        temp[0] = "DBo_0";

                        // randomly matching the the VA with DA present in meta data
                        for (let i in vis_details_matched) {
                            const label_randoly_DA = vis_DT_check(
                                vis_details_matched[i][4],
                                Number(vis_details_matched[i][6])
                            );
                            if (label_randoly_DA) {
                                const Label_Index = meta_data_DA.findIndex(
                                    (e) => e === label_randoly_DA
                                );
                                if (Label_Index != -1)
                                    temp[Label_Index + 2] = vis_details_matched[i][2]; // +2 in temp for DBo and Vis_name
                                const charttypeobject = vis_name_mark.find(
                                    (e) => e.label == vis_details_matched[i][0]
                                );
                                if (charttypeobject) {
                                    temp[1] = charttypeobject.label;
                                }
                                DBo_rows.push([...temp]);
                            } else {
                                DB_vis -= 1;
                                break;
                            }
                        }
                        if (DBo_rows.length < vis_details_matched.length || temp.length == 1)
                            continue;
                        else if (temp.length > 1 && check_mendatory(temp))
                            DBo.push([...temp]);
                        else {
                            DB_vis -= 1;
                            continue;
                        }
                    } // End of vis
                    return [...DBo];
                }
                gen_DBo = DB_generation();
                vis_add_muted_offspring = [];
                vis_add_muted_offspring = final_CO_offspring.concat([...gen_DBo]);
                mapping_muted_offspring_temp = [...vis_add_muted_offspring];
                // 3. here is repetation of vis in DBo,  we need CO_DBo_repetation() ==> add visualization
                mapping_muted_offspring = CO_DBo_repetation(mapping_muted_offspring_temp);
                vis_add_muted_offspring_eval = DBo_evaluation(
                    vis_add_muted_offspring,
                    num,
                    meta_data[0].slice(1).length
                );
                mapping_muted_offspring_eval = [...vis_add_muted_offspring_eval];
            } // end for (only_2a_2b==2)
        } // end for (Only_1_2>8 && Only_1_2<11)

        //========================================= End of Perform mutaion on this offspring =========================================

        // //========================================= Replacement of final muted DBo with worst DBo in DBo_Eval file =========================================
        // // 1. Sort the all DBo based of fitness values present in DBo_Eval file
        // // 2. Find worst worst candidate (DBo) from in DBo_Eval file
        // // 3. calculate fitness value of muted DBo
        // // 4. compare fitness value (muted DBo vs worst candidate (DBo))
        // // 5. if fitness (muted DBo > worst candidate (DBo)): replacement of muted DBo
        // // 6. repeat the loop

        // 1. Sort the all DBo based of fitness values present in DBo_Eval file
        fitness = [];
        sorted_fitness = [];
        for (var i = 0; i < DBo_POP_eval.length; i++) {
            fitness.push(DBo_POP_eval[i][4]);
        }
        sorted_fitness = fitness.sort((fitness, b) => fitness - b);
        // 2. Find worst worst candidate (DBo) from in DBo_Eval file
        worst_candidate = sorted_fitness[1];
        worst_fv.push(Number(worst_candidate));
        best_fv.push(Number(sorted_fitness[sorted_fitness.length - 1]));

        sorted_fv_sum = 0;
        for (var i = 1; i < sorted_fitness.length; i++) {
            sorted_fv_sum = sorted_fv_sum + Number(sorted_fitness[i]);
        }
        avg_value = (
            Number(sorted_fv_sum) / Number(sorted_fitness.length - 1)
        ).toFixed(2);
        avg_fv.push(Number(avg_value));

        // 4. compare fitness value (muted DBo vs worst candidate (DBo))
        // 5. if fitness (muted DBo > worst candidate (DBo)): replacement of muted DBo

        if (
            Number(mapping_muted_offspring_eval?.[0]?.[4]) > Number(worst_candidate)
        ) {
            if_c++;
            // console.log(" if test", mapping_muted_offspring_eval?.[0]?.[4]);
            updated_DBo = [];
            last_updated_DBo = [];
            updated_DBo_eval = [];
            mapping_muted_offspring_test = [];

            result = DBo_POP_eval.find((e) => e[4] === worst_candidate);
            DBo_id = result[0];

            slice_index = [];
            // to find DBo having same DBo_id in DBo_POP
            for (var i = 0; i < DBo_POP.length; i++) {
                if (DBo_POP[i][0] === DBo_id) slice_index.push(i);
            }
            // replace worst candidate DBo_id in DBo_POP with muted DBo's DBo_id and value
            if (slice_index.length >= 1) {
                DBo_part_1 = DBo_POP.slice(0, Number(slice_index[0]));
                DBo_part_2 = DBo_POP.slice(
                    slice_index[slice_index.length - 1] + 1,
                    DBo_POP.length + 1
                );
            }
            mapping_muted_offspring_test = [...mapping_muted_offspring];

            for (
                var i = 0;
                i < mapping_muted_offspring_test.length &&
                mapping_muted_offspring_test.length > 0;
                i++
            ) {
                mapping_muted_offspring_test[i] = [
                    "Rep_" + String(DBo_id).replace("Rep_", ""),
                    ...mapping_muted_offspring_test[i].slice(1),
                ];
            }

            last_updated_DBo_temp = [...mapping_muted_offspring_test];
            // 4. works perfect, here is repetation of vis in DBo, we don't need "CO_DBo_repetation ()" ==> Final DBo Before replacement (if part)
            // console.log(last_updated_DBo_temp);
            last_updated_DBo = CO_DBo_repetation(last_updated_DBo_temp);
            updated_DBo_1 = mapping_muted_offspring_test.concat(DBo_part_2);
            updated_DBo = DBo_part_1.concat([...updated_DBo_1]);

            // to find DBo having same DBo_id in DBo_Evaluation
            for (var i = 0; i < DBo_POP_eval.length; i++) {
                if (DBo_POP_eval[i][0] === DBo_id) DBo_eval_index = i;
            }
            // replace worst candidate DBo_id in DBo_Evaluation with muted DBo_evalution's DBo_id and value
            DBo_eval_part_1 = DBo_POP_eval.slice(0, DBo_eval_index);
            DBo_eval_part_2 = DBo_POP_eval.slice(
                DBo_eval_index + 1,
                DBo_POP_eval.length
            );
            mapping_muted_offspring_eval[0][0] =
                "Rep_" + String(DBo_id).replace("Rep_", "");
            updated_DBo_eval = DBo_eval_part_1.concat(
                mapping_muted_offspring_eval.concat([...DBo_eval_part_2])
            );
            // copy updated_DBo into DBo_POP
            DBo_POP = [...updated_DBo];
            // copy updated_DBo_eval into DBo_POP_eval
            DBo_POP_eval = [...updated_DBo_eval];
        } // end of if
        else {
            el_c++;
            // console.log(
            //   " else test",
            //   mapping_muted_offspring_eval?.[0]?.[4],
            //   mapping_muted_offspring_eval?.[0]?.[0]
            // );
            last_updated_DBo_temp = [];
            last_updated_DBo = [];
            var best_candidate = sorted_fitness[sorted_fitness.length - 1];
            result = DBo_POP_eval.find((e) => e[4] === best_candidate);
            DBo_id = result[0];
            for (var i = 1; i < DBo_POP.length; i++) {
                if (DBo_POP[i][0] === DBo_id) last_updated_DBo_temp.push([...DBo_POP[i]]);
            }

            // 5. here is repetation of vis in DBo,  we need CO_DBo_repetation() ==> Final DBo Before replacement (else part)
            last_updated_DBo = CO_DBo_repetation([...last_updated_DBo_temp]);

            // copy updated_DBo into DBo_POP
            DBo_POP = [...DBo_POP];
            // copy updated_DBo_eval into DBo_POP_eval
            DBo_POP_eval = [...DBo_POP_eval];
        }
    } // loop for Selection, crossover, mutation and replacement (repeat)
    var now = new Date(),
        af_exe = +now;
    ga_time = af_exe - bf_exe;

    /// analysis of GA Evaluation
    for (var i = 0; i < CO_num; i++) {
        ga_analysis.push([
            i + 1,
            first_now,
            Number(bf_exe),
            Number(af_exe),
            Number(ga_time),
            Number(best_fv[i]),
            Number(worst_fv[i]),
            Number(avg_fv[i]),
        ]);
    }
    // console.log("ga_analysis",ga_analysis)

    // writing final DBo to DBo_for_VL.csv file
    var meta_data_DA = meta_data[0].slice(1);
    DBo_head = [];
    last_updated_DBo_new = [];
    DBo_head.push(["DBo", "vis_name", ...meta_data_DA]);
    last_updated_DBo_new = DBo_head.concat([...last_updated_DBo]);

    // 1. writing final_DBo_for_VL csv file
    for (let i in last_updated_DBo_new) {
        // join COLUMNS
        last_updated_DBo_new[i] = last_updated_DBo_new[i].join(",");
    }
    for(let i in last_updated_DBo_new){
        last_updated_DBo_new[i] = last_updated_DBo_new[i].split("\n");
    }
    last_updated_DBo_new = last_updated_DBo_new.join("\n"); // join ROWS (STRING TO ARRAY)
    fs_DBo_POP.writeFile(
        "final_output/final_DBo_for_VL_10.csv",
        // "analysis/DBo/final_DBo_for_VL_"+file+ ".csv",
        last_updated_DBo_new,
        function (err) {
            if (err) throw err;
            console.log("final_DBo_for_VL.csv is created successfully");
        }
    );

    // // 5. writing analysis to csv file
    // for (let i in ga_analysis) {
    //   // join COLUMNS
    //   ga_analysis[i] = ga_analysis[i].join(",");
    // }
    // ga_analysis = ga_analysis.join("\n"); // join ROWS (STRING TO ARRAY)
    // fs_DBo_POP.writeFile(
    //   // "analysis/GA_files/ga_analysis_"+file+ ".csv",
    //   "analysis/GA_files/ga_analysis_10.csv",
    //   ga_analysis,
    //   function (err) {
    //     if (err) throw err;
    //     console.log("ga_analysis.csv File is created successfully");
    //   }
    // );

    // 2. writing updated DBo to DBo_POP csv file
    
    let updated_DBO_final= updated_DBo;
    for (let i in updated_DBo) {
        // join COLUMNS
        updated_DBo[i] = updated_DBo[i].join(",");
    }
    updated_DBo = updated_DBo.join("\n"); // join ROWS (STRING TO ARRAY)
    fs_DBo_POP.writeFile(
        "final_output/final_DBo_POP.csv",
        updated_DBo,
        function (err) {
            if (err) throw err;
            console.log("final_DBo_POP.csv File is created successfully");
        }
    );

    // 3. writing updated_DBo_eval to DBo_POP_eval csv file
    let updated_DBo_eval_final= updated_DBo_eval;
    // console.log(updated_DBo_eval_final);
    // updated_DBo_eval_final=updated_DBo_eval_final.split("\n");
    // for(let i in updated_DBo_eval_final){
    //     updated_DBo_eval_final[i] = updated_DBo_eval_final[i].split(",");
    // }
    for (let i in updated_DBo_eval) {
        // join COLUMNS
        updated_DBo_eval[i] = updated_DBo_eval[i].join(",");
    }
    updated_DBo_eval = updated_DBo_eval.join("\n"); // join ROWS (STRING TO ARRAY)
    fs_DBo_POP.writeFile(
        "final_output/final_DBo_evaluation.csv",
        updated_DBo_eval,
        function (err) {
            if (err) throw err;
            console.log("final_DBo_evaluation.csv File is created successfully");
        }
    );

    return {
        last_updated_DBo_new:last_updated_DBo_new,
        final_DBo_all:updated_DBO_final,
        final_DBo_eval:updated_DBo_eval_final,
    }
}

module.exports = geneticAlgorithm;