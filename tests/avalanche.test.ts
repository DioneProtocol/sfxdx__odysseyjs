import mockAxios from "jest-mock-axios"
import { Odyssey, OdysseyCore } from "../src"
import { ALPHAAPI } from "../src/apis/alpha/api"
import { AdminAPI } from "../src/apis/admin/api"
import { HealthAPI } from "../src/apis/health/api"
import { InfoAPI } from "../src/apis/info/api"
import { KeystoreAPI } from "../src/apis/keystore/api"
import { MetricsAPI } from "../src/apis/metrics/api"
import { OmegaVMAPI } from "../src/apis/omegavm/api"
import { TestAPI } from "./testlib"
import { AxiosRequestConfig } from "axios"
import { HttpResponse } from "jest-mock-axios/dist/lib/mock-axios-types"

describe("Odyssey", (): void => {
  const blockchainID: string =
    "6h2s5de1VC65meajE1L2PjvZ1MXvHc3F6eqPCGKuDt4MxiweF"
  let host: string = "127.0.0.1"
  const port: number = 9650
  const networkID: number = 1337
  let protocol: string = "https"
  let odyssey: Odyssey
  let odysseyCore: OdysseyCore
  const api: string = "api.dione.network"
  const url: string = "https://api.dione.network:9650"
  const encrypted: string = "https"
  const skipinit: boolean = true
  beforeAll((): void => {
    odyssey = new Odyssey(
      host,
      port,
      protocol,
      networkID,
      undefined,
      undefined,
      undefined,
      skipinit
    )
    odyssey.addAPI("admin", AdminAPI)
    odyssey.addAPI("achain", ALPHAAPI, "/ext/subnet/alpha", blockchainID)
    odyssey.addAPI("health", HealthAPI)
    odyssey.addAPI("info", InfoAPI)
    odyssey.addAPI("keystore", KeystoreAPI)
    odyssey.addAPI("metrics", MetricsAPI)
    odyssey.addAPI("ochain", OmegaVMAPI)
  })
  test("Remove special characters", (): void => {
    host = "a&&&&p#i,.@a+v(a)x$.~n%e't:w*o?r<k>"
    protocol = "h@t&@&@t#p+s()$"
    odyssey = new Odyssey(host, port, protocol, networkID)
    expect(odyssey.getHost()).toBe(api)
    expect(odyssey.getProtocol()).toBe(encrypted)
    expect(odyssey.getURL()).toBe(url)
    odysseyCore = new OdysseyCore(host, port, protocol)
    expect(odysseyCore.getHost()).toBe(api)
    expect(odysseyCore.getProtocol()).toBe(encrypted)
    expect(odysseyCore.getURL()).toBe(url)
  })
  test("Can specify base endpoint", (): void => {
    odyssey = new Odyssey()
    odyssey.setAddress(api, port, encrypted, "rpc")
    odyssey.setNetworkID(networkID)
    expect(odyssey.getHost()).toBe(api)
    expect(odyssey.getProtocol()).toBe(encrypted)
    expect(odyssey.getPort()).toBe(port)
    expect(odyssey.getBaseEndpoint()).toBe("rpc")
    expect(odyssey.getURL()).toBe(`${url}/rpc`)
    expect(odyssey.getNetworkID()).toBe(networkID)
  })
  test("Can initialize without port", (): void => {
    protocol = encrypted
    host = api
    odyssey = new Odyssey(host, undefined, protocol, networkID)
    expect(odyssey.getPort()).toBe(undefined)
    expect(odyssey.getURL()).toBe(`${protocol}://${api}`)
    odysseyCore = new OdysseyCore(host, undefined, protocol)
    expect(odysseyCore.getPort()).toBe(undefined)
    expect(odysseyCore.getURL()).toBe(`${protocol}://${api}`)
  })
  test("Can initialize with port", (): void => {
    protocol = encrypted
    odyssey = new Odyssey(host, port, protocol, networkID)
    expect(odyssey.getIP()).toBe(host)
    expect(odyssey.getHost()).toBe(host)
    expect(odyssey.getPort()).toBe(port)
    expect(odyssey.getProtocol()).toBe(protocol)
    expect(odyssey.getURL()).toBe(`${protocol}://${host}:${port}`)
    expect(odyssey.getNetworkID()).toBe(1337)
    expect(odyssey.getHeaders()).toStrictEqual({})
    odyssey.setNetworkID(50)
    expect(odyssey.getNetworkID()).toBe(50)
    odyssey.setNetworkID(12345)
    expect(odyssey.getNetworkID()).toBe(12345)
  })

  test("Endpoints correct", (): void => {
    expect(odyssey.Admin()).not.toBeInstanceOf(ALPHAAPI)
    expect(odyssey.Admin()).toBeInstanceOf(AdminAPI)

    expect(odyssey.AChain()).not.toBeInstanceOf(AdminAPI)
    expect(odyssey.AChain()).toBeInstanceOf(ALPHAAPI)

    expect(odyssey.Health()).not.toBeInstanceOf(KeystoreAPI)
    expect(odyssey.Health()).toBeInstanceOf(HealthAPI)

    expect(odyssey.Info()).not.toBeInstanceOf(KeystoreAPI)
    expect(odyssey.Info()).toBeInstanceOf(InfoAPI)

    expect(odyssey.OChain()).not.toBeInstanceOf(KeystoreAPI)
    expect(odyssey.OChain()).toBeInstanceOf(OmegaVMAPI)

    expect(odyssey.NodeKeys()).not.toBeInstanceOf(OmegaVMAPI)
    expect(odyssey.NodeKeys()).toBeInstanceOf(KeystoreAPI)

    expect(odyssey.Metrics()).not.toBeInstanceOf(KeystoreAPI)
    expect(odyssey.Metrics()).toBeInstanceOf(MetricsAPI)

    expect(odyssey.Admin().getRPCID()).toBe(1)
    expect(odyssey.AChain().getRPCID()).toBe(1)
    expect(odyssey.OChain().getRPCID()).toBe(1)
    expect(odyssey.NodeKeys().getRPCID()).toBe(1)
  })

  test("Create new API", (): void => {
    odyssey.addAPI("alpha2", ALPHAAPI)
    expect(odyssey.api("alpha2")).toBeInstanceOf(ALPHAAPI)

    odyssey.addAPI("keystore2", KeystoreAPI, "/ext/keystore2")
    expect(odyssey.api("keystore2")).toBeInstanceOf(KeystoreAPI)

    odyssey.api("keystore2").setBaseURL("/ext/keystore3")
    expect(odyssey.api("keystore2").getBaseURL()).toBe("/ext/keystore3")

    expect(odyssey.api("keystore2").getDB()).toHaveProperty("namespace")
  })

  test("Customize headers", (): void => {
    odyssey.setHeader("A-Custom-Header", "example")
    odyssey.setHeader("A-Foo", "Foo")
    odyssey.setHeader("A-Bar", "Bar")
    expect(odyssey.getHeaders()).toStrictEqual({
      "A-Custom-Header": "example",
      "A-Foo": "Foo",
      "A-Bar": "Bar"
    })
    odyssey.removeHeader("A-Foo")
    expect(odyssey.getHeaders()).toStrictEqual({
      "A-Custom-Header": "example",
      "A-Bar": "Bar"
    })
    odyssey.removeAllHeaders()
    expect(odyssey.getHeaders()).toStrictEqual({})
  })

  test("Customize request config", (): void => {
    expect(odyssey.getRequestConfig()).toStrictEqual({})
    odyssey.setRequestConfig("withCredentials", true)
    odyssey.setRequestConfig("withFoo", "Foo")
    odyssey.setRequestConfig("withBar", "Bar")
    expect(odyssey.getRequestConfig()).toStrictEqual({
      withCredentials: true,
      withFoo: "Foo",
      withBar: "Bar"
    })
    odyssey.removeRequestConfig("withFoo")
    expect(odyssey.getRequestConfig()).toStrictEqual({
      withCredentials: true,
      withBar: "Bar"
    })
    odyssey.removeAllRequestConfigs()
    expect(odyssey.getRequestConfig()).toStrictEqual({})
  })
})

describe("HTTP Operations", (): void => {
  const host: string = "127.0.0.1"
  const port: number = 8080
  const protocol: string = "http"
  const path: string = "/ext/testingrequests"
  let odyssey: Odyssey
  beforeAll((): void => {
    odyssey = new Odyssey(
      host,
      port,
      protocol,
      12345,
      undefined,
      undefined,
      undefined,
      true
    )
    odyssey.addAPI("testingrequests", TestAPI, path)
  })

  afterEach((): void => {
    mockAxios.reset()
  })

  test("GET works", async (): Promise<void> => {
    const input: string = "TestGET"
    const api: TestAPI = odyssey.api("testingrequests")
    const result: Promise<object> = api.TestGET(input, `/${input}`)
    const payload: object = {
      result: {
        output: input
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }
    mockAxios.mockResponse(responseObj)
    const response: any = await result
    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response.output).toBe(input)
  })

  test("DELETE works", async (): Promise<void> => {
    const input: string = "TestDELETE"
    const api: TestAPI = odyssey.api("testingrequests")
    const axiosConfig: AxiosRequestConfig = {
      baseURL: `${protocol}://${host}:${port}`,
      responseType: "text"
    }
    const result: Promise<object> = api.TestDELETE(
      input,
      `/${input}`,
      axiosConfig
    )
    const payload: object = {
      result: {
        output: input
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }
    mockAxios.mockResponse(responseObj)
    const response: any = await result
    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response.output).toBe(input)
  })

  test("POST works", async (): Promise<void> => {
    const input: string = "TestPOST"
    const api: TestAPI = odyssey.api("testingrequests")
    const result: Promise<object> = api.TestPOST(input, `/${input}`)
    const payload: object = {
      result: {
        output: input
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }
    mockAxios.mockResponse(responseObj)
    const response: any = await result
    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response.output).toBe(input)
  })

  test("PUT works", async (): Promise<void> => {
    const input: string = "TestPUT"
    const api: TestAPI = odyssey.api("testingrequests")
    const result: Promise<object> = api.TestPUT(input, `/${input}`)
    const payload: object = {
      result: {
        output: input
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }
    mockAxios.mockResponse(responseObj)
    const response: any = await result
    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response.output).toBe(input)
  })

  test("PATCH works", async (): Promise<void> => {
    const input: string = "TestPATCH"
    const api: TestAPI = odyssey.api("testingrequests")
    const result: Promise<object> = api.TestPATCH(input, `/${input}`)
    const payload: object = {
      result: {
        output: input
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }
    mockAxios.mockResponse(responseObj)
    const response: any = await result
    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response.output).toBe(input)
  })
})
