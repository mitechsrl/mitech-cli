import yargs from 'yargs';
import { SshTarget } from '../../../../types';
import fs from 'fs';
import path from 'path';
export async function deploy (target: SshTarget, params: yargs.ArgumentsCamelCase<unknown>): Promise<void>{

    const certificate = path.join(
        process.cwd(),
        (params.certificate as string) ?? 'sign-certificate.cer'
    );

    const trustPolicyJson = path.join(
        process.cwd(),
        (params.trustJson as string) ?? 'trustpolicy.json'
    );

    // Ensure file existence
    if (!fs.existsSync(certificate)) throw new Error('Certificate file not found');        
    if (!fs.existsSync(trustPolicyJson)) throw new Error('trust policy json file not found');
    
    // --store test-kv-1-abb-mitech deve essere uguale a quello definito in trustpolicy.json
    // notation cert add --type ca --store test-kv-1-abb-mitech test-cert-1-acr.cert

    // notation policy import ./trustpolicy.json (deve sovrascrivere config attuale)

}