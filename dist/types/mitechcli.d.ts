export type SshTargetPassword = {
    algo: string;
    iv: string;
    encryptedData: string;
};
export type SshTarget = {
    name: string;
    'host': string;
    'port': 22;
    'username': 'root';
    'accessType': 'sshKey' | 'password';
    'sshKey'?: string;
    'password'?: SshTargetPassword | string;
    'nodeUser': 'node';
};
export type MitechCliFileContentProjectDeployment = {
    name: string;
    path: string;
    target: string;
};
export type MitechCliFileContentProject = {
    name?: string;
    uptimeCheck?: string;
    commonDependencies?: {
        [k: string]: string;
    };
    deployments: {
        [k: string]: MitechCliFileContentProjectDeployment;
    };
};
export type MitechCliFileContentDb = {
    type?: string;
    name?: string;
    host?: string;
    port?: string;
    username?: string;
    password?: string;
    tls?: boolean;
    databaseNames?: string[];
    dst?: string;
};
export type MitechCliFileContent = {
    targets: SshTarget[];
    projects: MitechCliFileContentProject[];
    dbs: MitechCliFileContentDb[];
};
export type MitechCliFile = {
    file: string;
    content: MitechCliFileContent;
};
