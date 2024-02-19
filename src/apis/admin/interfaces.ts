/**
 * @packageDocumentation
 * @module Admin-Interfaces
 */

export interface AliasParams {
  endpoint: string
  alias: string
}

export interface AliasChainParams {
  chain: string
  alias: string
}

export interface GetChainAliasesParams {
  chain: string
}

export interface GetLoggerLevelParams {
  loggerName?: string
}

export interface Level {
  logLevel: string
  displayLevel: string
}

export interface LoggerLevels {
  D: Level
  "D.http": Level
  O: Level
  "O.http": Level
  A: Level
  "A.http": Level
  http: Level
  main: Level
}

export interface GetLoggerLevelResponse {
  loggerLevels: LoggerLevels
}

export interface LoadVMsResponse {
  newVMs: object
  failedVMs?: object
}

export interface SetLoggerLevelParams {
  loggerName?: string
  logLevel?: string
  displayLevel?: string
}

export interface SetLoggerLevelResponse {
  success: boolean
}
