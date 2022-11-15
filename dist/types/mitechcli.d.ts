export declare type SshTargetPassword = {
    algo: string;
    iv: string;
    encryptedData: string;
};
export declare type SshTarget = {
    name: string;
    'host': string;
    'port': 22;
    'username': 'root';
    'accessType': 'sshKey' | 'password';
    'sshKey'?: string;
    'password'?: SshTargetPassword | string;
    'nodeUser': 'node';
};
export declare type MitechCliFileContentProjectDeployment = {
    name: string;
    path: string;
    target: string;
};
export declare type MitechCliFileContentProject = {
    name?: string;
    uptimeCheck?: string;
    commonDependencies?: {
        [k: string]: string;
    };
    deployments: {
        [k: string]: MitechCliFileContentProjectDeployment;
    };
};
export declare type MitechCliFileContentDb = {
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
export declare type MitechCliFileContent = {
    targets: SshTarget[];
    projects: MitechCliFileContentProject[];
    dbs: MitechCliFileContentDb[];
};
export declare type MitechCliFile = {
    file: string;
    content: MitechCliFileContent;
};
