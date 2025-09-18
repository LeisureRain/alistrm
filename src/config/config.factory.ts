import { readFileSync } from 'fs';
import { join } from 'path';

export default () => {
    const configPath = join(process.cwd(), 'config.json');
    return JSON.parse(readFileSync(configPath, 'utf8'));
};