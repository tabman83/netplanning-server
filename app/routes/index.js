/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   index.js
 * Created:		8/26/2014 00.16
 * Description:	API routes
 */

var Routes = function(router) {

    router.post('/Login', require('./login') );

    router.get('/Tokens', require('./tokensGet') );
    router.post('/Tokens', require('./tokensPost') );
    router.delete('/Tokens', require('./tokensDelete') );

    router.get('/Items', require('./itemsGet') );
    router.get('/Items', require('./itemsDelete') );
    router.get('/Changes', require('./changesGet') );
}

module.exports = Routes;
