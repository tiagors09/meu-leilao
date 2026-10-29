/** @typedef {{ id:number, title:string, status:string, initial_price:number|string, min_increment:number|string, start_time:string, end_time:string, image_url?:string|null }} AuctionLot */
export const auctionTabs = Object.freeze([
  { id: 'LIVE', label: 'Ao vivo', tone: 'green', stateLabel: 'AO VIVO' },
  { id: 'SCHEDULED', label: 'Agendados', tone: 'yellow', stateLabel: 'EM BREVE' },
  { id: 'CLOSED', label: 'Encerrados', tone: 'purple', stateLabel: 'ENCERRADO' },
])
