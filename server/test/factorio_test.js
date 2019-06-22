var assert = require('assert');
var chai = require('chai');  
var expect = chai.expect;    // Using Expect style
const Event = require("../event");

var Server = require('../factorio');


describe('Factorio Server', function(){
    it('Has a constructor', () => {
        var server = new Server();
        assert(server != undefined);
    });

    describe('Sanity Checks - Negatives', () => {
        var server = new Server();
        it('Wont send a message without running', () => {
            assert.strictEqual(server.message("fail","test"),false)
        });
        it('Cant get online players', () => {   
            assert.strictEqual(server.online_players(), false)
        });
        it('Cant stop a not running server', async () => {
           try{await server.stop()}
           catch(e){
            expect(e).to.equal("server not running");
           }
        });
        
    describe('Message Processing',() => {
        it('CHAT', (done) => {
            event.register("chat_message", () => {done("failed")})
            var server = new Server();
            server.process_data("You better not fail");
            setTimeout(()=>{done()},1000);

        });
        it('ERROR', (done) => {
            event.register("error", () => {done("failed")})
            var server = new Server();
            server.process_data("you'd better not fail ");
            setTimeout(()=>{done()},1000);
        });
        
    });
    });
    describe('Message Processing',() => {
        it('CHAT', (done) => {
            event.register("chat_message",done)
            var server = new Server();
            server.process_data("adflkd [CHAT] testasdfs ");
        });
        it('ERROR', (done) => {
            event.register("error", done)
            var server = new Server();
            server.process_data("adflkd Error This is an error ");
        });
        
    });

});  
