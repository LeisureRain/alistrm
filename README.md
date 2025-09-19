# This tool scans AList files, converts them to STRM-format files, and serves these files simultaneously.

## Please note that it is currently in the early development stage.

- English | [中文](./README_cn.md) 

## TODO
- [ ] alistrm server url should be configed, because it is used by media servers such as jellyfin
- [ ] reduce docker image size, use alpine node
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
