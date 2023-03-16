
export type EncryptedPassword = {
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
    'password'?: EncryptedPassword | string,

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

export type MitechCliFileContentDb = {
    type?: string,
    name?: string,
    host?: string,
    port?: string, // defaults 27017
    username?: string,
    password?: string|EncryptedPassword,
    tls?: boolean,
    databaseNames?: string[],
    dst?: string
};

export type MitechCliFileContent = {
    targets: SshTarget[],
    projects: MitechCliFileContentProject[],
    dbs: MitechCliFileContentDb[]
};

export type MitechCliFile = {
    file: string,
    content: MitechCliFileContent
}; 