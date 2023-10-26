const generateRandom = require('../functions/RandomGen');
const geneticAlgorithm = require('../functions/GeneticAlgo');
const fs = require('fs');
const router = require('express').Router();

router.post('/randomGen', async (req, res) => {
    const { min, max, selectedVis } = req.body;
    const random = await generateRandom(min, max, selectedVis)
    // console.log("DBO pop is: ")
    // console.log(random.DBo);
    res.status(200).json({
        status: 'success',
        data: {
            Dbo: random.DBo,
            DBo_eval: random.DBo_evaluation,
        }
    });
});

router.post('/geneticAlgo', async (req, res) => {
    const { DBo_POP, DBo_POP_EVAL } = req.body;
    const random = await geneticAlgorithm(DBo_POP, DBo_POP_EVAL);
    res.status(200).json({
        final_DBo_all: random.final_DBo_all,
        final_DBo_eval: random.final_DBo_eval,
        last_DBo: random.last_updated_DBo_new,
    })
})

module.exports = router;