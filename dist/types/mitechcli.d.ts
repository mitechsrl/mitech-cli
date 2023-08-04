export type EncryptedPassword = {
    algo: string;
    iv: string;
    encryptedData: string;
};
export type SshTarget = {
    name: string;
    host: string;
    port: number;
    username: string;
    accessType: 'sshKey' | 'password';
    sshKey?: string;
    password?: EncryptedPassword | string;
    nodeUser: string;
    environment: 'pm2' | 'docker';
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
    password?: string | EncryptedPassword;
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
