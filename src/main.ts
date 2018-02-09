import * as msgpack from 'msgpack'
import * as assert from 'assert'
import * as net from 'net'
import * as Stream from 'stream'

console.log("msgpack-test")

const o = { "a": 1, "b": 2, "c": [1, 2, 3] }
const b = msgpack.pack(o)
const oo = msgpack.unpack(b)

assert.deepEqual(oo, o)

function stringify(s: net.Socket) {
  const addr = s.address()
  return `${addr.address}:${addr.port}`
}

class Connection {
  ms: msgpack.Stream

  constructor(s: net.Socket) {
    console.log(`Connection: ${stringify(s)}`)

    this.ms = new msgpack.Stream(s)

    this.ms.on('close', () => {

    })

    this.ms.on('msg', m => {
      console.log(`msg: ${JSON.stringify(m)}`)
    })
  }

  send(m: any) {
    this.ms.send(m)
  }
}

class Server {
  s: net.Server
  connections: Map<string, Connection> = new Map<string, Connection>()

  constructor(host: string, port: number) {
    this.s = net.createServer(s => {
      console.log(`Server connection: ${stringify(s)}`)
      this.connections.set(stringify(s), new Connection(s))
    })

    this.s.listen({host, port})
  }
}

class Client {
  connection: Connection
  promise: Promise<Connection>

  constructor(host: string, port: number) {
    this.promise = new Promise<Connection>(resolve => {
      const s = net.createConnection({ host, port }, () => {
        console.log(`Client connection: ${stringify(s)}`)
        this.connection = new Connection(s)
        resolve(this.connection)
      })
    })
  }
}

async function Test() {
  try
  {
    const server = new Server('localhost', 8888)

    const client = new Client('localhost', 8888)
    const c = await client.promise

    c.send('---hellofdsafdsafdsafdsafdsafdsafdsafdsafdsafdsa---')
    c.send({a: 0, b: 'hello', c: false})
    c.send('###safdsafdsafdsafdsafdsa###')
  }
  catch (e)
  {
    console.log(e)
  }
}

Test()
