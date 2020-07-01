module.exports = function(EnvironmentMod)
{
    return class Mod001 extends EnvironmentMod
    {
        constructor(config)
        {
            super(config);
        }

        onReceiveData(player, event, data)
        {
            super.onReceiveData(event, data);
            console.log(`ReceiveData from player ${player.username} from Env #Mod001 : ${event}`, data);
        }
    }
};