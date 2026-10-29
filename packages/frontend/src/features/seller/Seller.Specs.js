/** @typedef {{ id:number, title:string, image_url?:string|null }} CatalogItem */
/** @typedef {{ title:string, initial_price:string, min_increment:string, start_time:string, end_time:string }} LotForm */
export const emptyLotForm = Object.freeze({ title: '', initial_price: '', min_increment: '', start_time: '', end_time: '' })
