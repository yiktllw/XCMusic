
export class OpenedPlaylist {
    constructor(){
        this._id = 0;
        this._onIdChange = [{
            func: null,
            id: null,
        }];
    }
    get id(){
        return this._id;
    }
    set id(id){
        this._id = id;
        this.execCallbacks();
    }
    Subscribe(callback, identifier){
        if(typeof callback !== 'function'){
            console.log('openedPlaylist.js error: callback is not a function: ', callback);
        }
        if(this._onIdChange.find((element) => element.id === identifier)){
            console.log('openedPlaylist.js error: identifier already exists: ', identifier);
            return;
        }
        this._onIdChange.push({
            func: callback,
            id: identifier,
        });
    }
    execCallbacks(){
        this._onIdChange.forEach((element) => {
            if(element.func){
                element.func();
            }
        });
    }
}