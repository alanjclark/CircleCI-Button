const {Builder, By, Key, until} = require('selenium-webdriver');

module.exports = {
    'Test button click' : function (browser) {
        browser
            .url('http://localhost:8002')
            .waitForElementVisible('button[type=button]', 5000)
            .click('button[type=button]'), function(result) {
                this.assert.strictEqual(result.status, 0)
            .pause(1000)
//          .assert.containsText('You clicked the button!')
            .end();
    }
};
