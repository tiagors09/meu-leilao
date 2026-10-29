/** @typedef {{ id:number, amount:number|string, bidder:string, created_at:string, previous_hash:string, hash:string, is_valid:boolean }} AuditEntry */
/** @typedef {{ lot_id:number, is_valid:boolean, is_tampered:boolean, chain:AuditEntry[] }} LotAudit */
export const auditLoadError = 'Nao foi possivel carregar a auditoria.'
