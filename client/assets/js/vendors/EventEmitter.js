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

    emit(event, ...args)
    {
        if(typeof this.events[event] === 'object')
        {
            for(const callback of this.events[event])
            {
                callback(...args);
            }
        }
    }
}

export default EventEmitter;