const Sandbox = require("../../lib/").constructors.Sandbox;

class MySandbox extends Sandbox
{
    constructor(config)
    {
        super(config);
    }
}

module.exports = MySandbox;