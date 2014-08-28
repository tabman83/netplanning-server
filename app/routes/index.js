/*!
 * NetPlanning Routes
 * Antonino Parisi <tabman83@gmail.com>
 * Created:		8/26/2014 00.16
 * Description:	API routes
 */

var Routes = function(router) {

    router.get('/Login', require('./login') );

    router.get('/Tokens', require('./tokensGet') );
    router.post('/Tokens', require('./tokensPost') );
    router.delete('/Tokens', require('./tokensDelete') );

    router.get('/Lessons', require('./lessonsGet') );
}

module.exports = Routes;
