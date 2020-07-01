module.exports = function(OverlayMod)
{
    return class Mod001 extends OverlayMod
    {
        constructor(config)
        {
            super(config);
        }

        onReceiveData(player, event, data)
        {
            super.onReceiveData(player, event, data);
            console.log(`ReceiveData from player ${player.username} from Ove #Mod001 : ${event}`, data);
            this.sendToPlayer(player, "responseOverlay", "bonjour");
        }
    }
};