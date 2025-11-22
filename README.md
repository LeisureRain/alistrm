# This tool scans AList files, converts them to STRM-format files, and serves these files simultaneously.

## Please note that it is currently in the early development stage.

- English | [中文](./README_cn.md) 

## TODO
- [x] alistrm server url should be configed, because it is used by media servers such as jellyfin
- [x] reduce docker image size, use alpine node
- [ ] web ui
- [ ] login verification
- [ ] scan specified folder
- [ ] cron scan
- [ ] incremental scan

## api
```javascript
// rescan all alist files
/scanner/rescan
```

## features
1. Works with AList
2. Scan alist folder structure, make all files to .strm files, keep folder structure (for easy scraping, by tools such as nas-tool)
3. Proxies .strm files, sends requests to AList to obtain direct links, and redirects to those direct links

## configuration
Refer to the .env.demo file to create the .env file.
```
VERSION=0.0.1

ALIST_SERVER_URL=http://192.168.1.200:5244
ALIST_USER_NAME=admin
ALIST_PASSWORD=your_password_here

PORT=5255

SCAN_BASE_PATH=/
STRM_BASE_PATH=D:\strm
```

## run
1. npm install
2. start:dev

## docker build
1. docker pull node:20
2. docker build -t alistrm:0.0.1 .
3. docker save -o alistrm-0.0.1.tar alistrm:0.0.1
4. upload to your docker server

## Docker / Deployment

This repository includes a Dockerfile and an example `docker-compose.yml` for easy deployment. The image creates runtime directories under `/app` and supports configuring the runtime UID/GID so generated files (like `.strm`) are owned by the correct host user.

Environment variables of interest:
- `PUID` (default `1000`) — UID to run the process as inside the container.
- `PGID` (default `100`) — GID to run the process as inside the container.
- `ADMIN_USER` / `ADMIN_PASS` — initial admin credentials (used only on first run when `data/auth.json` is created).
- `ALIST_SERVER_URL`, `ALIST_USER_NAME`, `ALIST_PASSWORD` — alist backend configuration.
- `STRM_BASE_PATH` — where .strm files will be written inside the container (should be under `/app/data` when using volumes).

Example `docker run` (override PUID/PGID so files are owned by host user 1001:1001):
```powershell
docker run -d -p 5255:5255 \
	-e PUID=1001 -e PGID=1001 \
	-e ADMIN_USER=admin -e ADMIN_PASS=admin \
	-e ALIST_SERVER_URL=http://alist:5244 -e ALIST_USER_NAME=admin -e ALIST_PASSWORD=yourpass \
	-v C:\path\to\data:/app/data \
	-v C:\path\to\config:/app/config \
	-v C:\path\to\logs:/app/logs \
	--name alistrm leisure-rain/alistrm:latest
```

Example `docker-compose.yml` (provided at `docker-compose.yml`):
```yaml
version: '3.8'
services:
	alistrm:
		image: leisure-rain/alistrm:latest
		ports:
			- "5255:5255"
		environment:
			PUID: 1000
			PGID: 100
			ADMIN_USER: admin
			ADMIN_PASS: admin
			ALIST_SERVER_URL: http://127.0.0.1:5244
			ALIST_USER_NAME: admin
			ALIST_PASSWORD: your_password_here
			STRM_BASE_PATH: /app/data/strm
			LOG_DIR: /app/logs
		volumes:
			- ./data:/app/data
			- ./config:/app/config
			- ./logs:/app/logs
		restart: unless-stopped
```

Notes and platform caveats:
- On Linux hosts the `PUID`/`PGID` mapping usually works as expected: files created under the mounted volumes will be owned by the UID/GID you specify. On Windows, volume ownership mapping is limited by the host filesystem and Docker Desktop behavior; you may still need to adjust permissions on the host.
- If you mount an existing host directory whose current files are owned by another UID, the container may not be able to chown them depending on filesystem semantics; adjust host permissions if needed.

Quick checklist when deploying:
1. Ensure the host directories (data/config/logs) exist and are writable by the chosen UID/GID (or let the container create them on first run).
2. Set `PUID`/`PGID` to match the host user you want to own the files.
3. Start the container with the volumes mounted; check the container logs to confirm the entrypoint created `appuser` and set ownership.

