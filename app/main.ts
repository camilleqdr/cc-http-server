import * as net from "net";
import { readFile, writeFile } from "fs/promises";

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });

  socket.on('data', async (data) => {
    const [requestLine, ...headers] = data.toString().split("\r\n");
    const [body] = headers.splice(headers.length - 1);
    const [method, path] = requestLine.split(" ");
    let res = 'HTTP/1.1 404 Not Found\r\n\r\n';
    if (path === '/') {
    res = 'HTTP/1.1 200 OK\r\n\r\n';
    }
    if (path.startsWith('/echo/') && method === 'GET') {
      const str = path.slice('/echo/'.length);
      res = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${str.length}\r\n\r\n${str}`;
    }
    else if (path === '/user-agent' && method === 'GET'){
      const str = headers.find((el) => el.toLowerCase().includes('user-agent:'))!.slice('user-agent:'.length).trim();
      res = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${str.length}\r\n\r\n${str}`;
    }
    else if (path.startsWith('/files/') && method === 'GET'){
      const fileName = path.slice('/files/'.length).trim();
      try {
      const fileContent = await readFile(process.argv[3]+fileName);
      res = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n${fileContent}`;
      } catch {
        res = `HTTP/1.1 404 Not Found\r\n\r\n`;
      }
    }
    else if (path.startsWith('/files/') && method === 'POST'){
      const fileName = path.slice('/files/'.length).trim();
      try {
        await writeFile(process.argv[3]+'/'+fileName,body);
        res = `HTTP/1.1 201 Created\r\n\r\n`;
      } catch {
        res = `HTTP/1.1 404 Not Found\r\n\r\n`;
      }
    }
    socket.write(res);
    socket.end();
  });
});

server.listen(4221, "localhost");


