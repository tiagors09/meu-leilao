/** @typedef {{ id:number, title:string, status:string, initial_price:string|number, min_increment:string|number, start_time:string, end_time:string, current_bid?:{ bidder_id:number|string, amount:string|number }|null, image_url?:string|null }} LotDetail */
export const LOT_POLL_INTERVAL_MS = 3000
export const DEFAULT_LOT_ERROR = 'Nao foi possivel carregar este lote.'
export const DEFAULT_BID_ERROR = 'Nao foi possivel registrar seu lance.'
