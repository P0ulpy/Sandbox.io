// @TODO gérer les instances d'UID globalement : ModUID.get("001") par exemple pour pouvoir les
// utiliser comme clé de map car sinon nouvelle instance à chaque fois = clé différente

export abstract class UID
{
    protected _UID: string;

    constructor(UID: string)
    {
        this._UID = UID;
    }

    get value(): string
    {
        return this._UID;
    }

    abstract isValid(UID: string): boolean;

    public toString(): string
    {
        return this._UID;
    }
}

export class ModUID extends UID
{
    isValid(): boolean
    {
        return /^[0-9]{3}$/.test(this._UID); 
    }
}

export class SandboxUID extends UID
{
    isValid(): boolean
    {
        return /^[0-9]{3}$/.test(this._UID); 
    }
}

/* Utiliser cette fonction permet de récupérer les mêmes instances de SandboxUID si l'UID
est le même, afin que l'on puisse utiliser cette instance en clé dans un objet tel que Map :
(getSandboxUID("001") === getSandboxUID("001"))    // true
(new SandboxUID("001") === new SandboxUID("001"))  // false
*/
const SandboxUIDs: Map<string, SandboxUID> = new Map<string, SandboxUID>();

export function getSandboxUID(UID: string): SandboxUID
{
    if (!SandboxUIDs.has(UID))
    {
        SandboxUIDs.set(UID, new SandboxUID(UID));
    }

    return SandboxUIDs.get(UID) as SandboxUID;
}

/* Même but :
(getModUID("001") === getModUID("001"))    // true
(new ModUID("001") === new ModUID("001"))  // false
*/
const ModUIDs: Map<string, ModUID> = new Map<string, ModUID>();

export function getModUID(UID: string): ModUID
{
    if (!ModUIDs.has(UID))
    {
        ModUIDs.set(UID, new ModUID(UID));
    }

    return ModUIDs.get(UID) as ModUID;
}