class Player
{
    constructor(config = {}) 
    {
        this.name = config.name || 'unamedPlayer';
        this.socket = config.socket || null;
    }
}

module.exports = Player;