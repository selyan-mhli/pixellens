/**
 * Contrat du pont entre le serveur MCP (Node) et l'extension (navigateur).
 *
 * Copie du contrat défini dans mcp/src/protocol.ts. Les deux moitiés ne sont pas
 * dans le même bundle : toute modification se fait ICI ET LÀ-BAS, sinon le champ
 * `protocol` ci-dessous doit être incrémenté pour que le pont refuse la connexion.
 * Il est volontairement sans dépendance : c'est la seule chose que les deux
 * moitiés partagent, et elles ne sont pas dans le même bundle.
 */

/** Version du protocole. Un pont qui annonce autre chose est refusé. */
export const BRIDGE_PROTOCOL = 1

export const DEFAULT_PORT = 8787

/** Ce que l'extension sait faire, vu du serveur. */
export type BridgeMethod =
  | 'read_page'
  | 'read_url'
  | 'design_system'
  | 'bundle'

export interface BridgeRequest {
  id: string
  method: BridgeMethod
  params: Record<string, unknown>
}

export type BridgeResponse =
  | { id: string; ok: true; result: unknown }
  | { id: string; ok: false; error: string }

/** Premier message de l'extension. Sans lui, la connexion est fermée. */
export interface BridgeHello {
  type: 'hello'
  protocol: number
  token: string
  /** Nom affiché côté serveur, purement informatif. */
  client: string
}

export interface BridgePing {
  type: 'ping'
}

export function isBridgeResponse(value: unknown): value is BridgeResponse {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.id === 'string' && typeof v.ok === 'boolean'
}

export function isBridgeHello(value: unknown): value is BridgeHello {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    v.type === 'hello' &&
    typeof v.protocol === 'number' &&
    typeof v.token === 'string'
  )
}
