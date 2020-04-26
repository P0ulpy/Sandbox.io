class EventEmitter
{
    constructor() 
    {
        this.events = {};       
    }

    on(event, callback)
    {
        if(!this.events[event])
        {
            this.events[event] = [];
        } 

        if(typeof this.events[event] === 'object')
        {
            this.events[event].push(callback);
        }
    }

    once(event, callback)
    {
        if(!this.events[event])
        {
            this.events[event] = [];
        } 

        if(typeof this.events[event] === 'object')
        {
            this.events[event].push(callback);

            // TODO : supprimer le callback quand il est appeler
        }
    }

    emit(event, ...args)
    {
        if(typeof this.events[event] === 'object')
        {
            for(const callback of this.events[event])
            {
                if(typeof callback === 'function')
                {
                    callback(...args);
                }
            }
        }
    }
}

export default EventEmitter;