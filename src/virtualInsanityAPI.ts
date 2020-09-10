/*
TODO: poner condicionales para cuando la funcion se llama antes de haber sido cargada
if (typeof globalThis.virtualInButtonClick === 'function'){
    globalThis.virtualInButtonClick(this.buttonClickData, event.target);
} 
*/


export interface loadInfoByPostTitle{(title:string, idWindow: number):boolean}
export interface loadInfoByPostId{(id:number, idWindow: number):boolean}
export interface loadInfoByPostSlug{(slug:string, idWindow: number):boolean}
export interface loadInfoByPostTag{(tag:string, idWindow: number):boolean}
export interface loadInfoByUrl{(url:string, idWindow: number):boolean}
export interface showInfo{(idWindow: number):boolean}
export interface showInfoByPostTitle{(title:string, idWindow: number):boolean}
export interface showInfoByPostId{(id:number, idWindow: number):boolean}
export interface showInfoByPostSlug{(slug:string, idWindow: number):boolean}
export interface showInfoByPostTag{(tag:string, idWindow: number):boolean}
export interface showInfoByUrl{(url:string, idWindow: number):boolean}

console.log("This API ");
console.log(this);

