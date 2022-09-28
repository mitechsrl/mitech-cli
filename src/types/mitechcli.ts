import { type } from 'os';

export type SshTargetPassword = {
    algo: string,
    iv: string,
    encryptedData: string
};

export type SshTarget = {
    // target name
    name: string,
    // Targte host
    'host': string,

    // targte ssh port
    'port': 22,

    // default sh username
    'username': 'root',

    // access type
    'accessType': 'sshKey' | 'password',

    // Path of the ssh file. Defined only if accessType = sshKey
    'sshKey'?: string,
    // Password for ssh access. Defined only if accessType = password
    'password'?: SshTargetPassword | string,

    // User for node processes
    'nodeUser': 'node',

    // "activate": true,
};

export type MitechCliFileContentProjectDeployment = {
    name: string,
    path: string,
    target: string,
};
export type MitechCliFileContentProject = {
    name?: string,
    uptimeCheck?: string,
    commonDependencies?: { [k:string]:string },
    deployments: { [k:string]: MitechCliFileContentProjectDeployment }
};

export type MitechCliFileContent = {
    targets: SshTarget[],
    projects: MitechCliFileContentProject[]
};

export type MitechCliFile = {
    file: string,
    content: MitechCliFileContent
}; 