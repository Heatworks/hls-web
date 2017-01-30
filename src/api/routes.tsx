module.exports = function(app){

    app.get('/api/data', function(req, res){
        res.send({
            data: [{
                title: 'A'
            }, {
                title: 'B'
            }]
        })
    });

    //other routes..
}