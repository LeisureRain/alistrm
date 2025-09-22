import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export default () => {
    const configPath = join(process.cwd(), 'config.json');

    if (existsSync(configPath) === false) {
        return {};
    }

    return JSON.parse(readFileSync(configPath, 'utf8'));
};