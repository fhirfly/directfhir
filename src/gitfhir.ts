import path from 'path';
import { config } from './config';

const cwd = process.cwd();

export const getGitfhirDir = () => {
  if (path.isAbsolute(config.GITFHIR_DIR)) {
    return config.GITFHIR_DIR;
  }

  return path.join(cwd, config.GITFHIR_DIR);
}

export const getGitfhirFilepath = (folder: string, file: string) => {
  return path.join(getGitfhirDir(), folder, file);
}

export const getGitfhirFolderPath = (folder: string) => {
  return path.join(getGitfhirDir(), folder);
}

export const getGitfhirMetadata = () => {
  return path.join(getGitfhirDir(), 'metadata');
}