module.exports = {
    'Test button click' : function (browser) {
        browser.url('http://localhost:80')
        browser.waitForElementVisible('button[type=button]', 1000)
        browser.click('button[type=button]'), function(result) {
            this.assert.strictEqual(result.status, 0);
        }
        browser.expect.element('p').text.to.contain('I clicked the button!')
        browser.end();
    }
};
