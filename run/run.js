const path = require('path');
const util = require('util');
const fs = require('fs');
const os = require('os');

const core = require("@actions/core");
const toolCache = require("@actions/tool-cache");

const filename = 'istioctl';

export function getExecutableExtension() {
  if (os.type().match(/^Win/)) {
      return '.exe';
  }
  return '';
}

export function getDownloadUrl(version) {
  if (os.type() == 'Windows_NT') {
    return util.format('https://github.com/istio/istio/releases/download/%s/istioctl-%s-win.zip', version, version);
  } else if (os.type() == 'Darwin') {
    return util.format('https://github.com/istio/istio/releases/download/%s/istioctl-%s-osx.tar.gz', version, version);
  }
  return util.format('https://github.com/istio/istio/releases/download/%s/istioctl-%s-linux-amd64.tar.gz', version, version);
}

export async function download(version) {
  let file = '';
  let url = getDownloadUrl(version);

  try {
    file = await toolCache.downloadTool(url);
  } catch (exception) {
      if (exception instanceof toolCache.HTTPError && exception.httpStatusCode === 404) {
          throw new Error(util.format("Istioctl '%s' not found.", url));
      } else {
          throw new Error('DownloadIstioctlFailed');
      }
  }

  return file
}

export async function extract(file) {
  let dir = '';
  if (os.type() == 'Windows_NT') {
    dir = await toolCache.extractZip(file);
  } else {
    dir = await toolCache.extractTar(file);
  }

  return `${dir}/${filename}`
}

export async function sync(file, version) {
  let cached = toolCache.find(filename, version);

  cached = await toolCache.cacheFile(file, filename + getExecutableExtension(), filename, version);
  const filepath = path.join(cached, filename + getExecutableExtension());

  fs.chmodSync(filepath, '777');
  return filepath;
}

export async function execute(version) {
  let rawFile = await download(version)
  let file = await extract(rawFile)
  let filepath = await sync(file, version)

  core.addPath(path.dirname(filepath));

  return filepath
}

export async function run() {
  let version = core.getInput('version', { 'required': true });
  let filepath = await execute(version);
          
  console.log(`istioctl version: '${version}' has been cached at ${filepath}`);
  core.setOutput('istioctl-path', filepath);
}

run().catch(core.setFailed);
