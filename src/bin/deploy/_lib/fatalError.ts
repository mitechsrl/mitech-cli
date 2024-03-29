import { StringError } from '../../../types';

/**
 * Processa output di deployScript.call per determinare fallimenti
 * @param result output di deployScript.call ((await deployScript.call()).output)
 */
export function throwOnFatalError (result:string){
    // search and match the generic fatal erro tag error tag
    const fatalErrorMatch = '[FATAL-ERROR]';
    const fatalErrorLine = result.split('\n').find(line => line.indexOf(fatalErrorMatch) >= 0);
    if (fatalErrorLine) {
        throw new StringError('Deploy fallito');
    }
}
