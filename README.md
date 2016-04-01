# vis-docker
[![Docker Pulls](https://img.shields.io/docker/pulls/wyvernnot/vis-docker.svg?style=flat-square)]()

Realtime visualization of docker events using vis.js

# Run in Docker environment

```sh
docker run -v /var/run/docker.sock:/var/run/docker.sock:ro -p 9587:3000 -d wyvernnot/vis-docker
```

# Screenshot

![](./screenshot.png)

# Development

```sh
git clone git@github.com:wyvernnot/vis-docker.git
cd vis-docker
npm install
npm start
```

# License

MIT