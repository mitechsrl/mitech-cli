"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_abort_controller_1 = require("node-abort-controller");
const logger_1 = require("../../../../../lib/logger");
const types_1 = require("../../../../../types");
const semver_1 = require("semver");
const node_fetch_1 = __importDefault(require("node-fetch"));
/**
 * Onit online check. Call the onit status api on the remote target to detect for availability.
 * Also check, with the call result, for expected versions against package.json values
 *
 * NOTE: in case of error, the function must throw an error.
 *
 * @param {*} session ssh session object
 * @param {*} packageJson The pachage json object
 * @param {*} deployResult The output of the deploy script
 * @param {*} target the ssh target server data
 */
async function onitVersion(session, packageJson, deployResult, target) {
    const controller = new node_abort_controller_1.AbortController();
    const timeout = setTimeout(() => {
        controller.abort();
    }, 10000);
    try {
        // check if the server is listening on port 443. If so, call the api via https
        const https = await session.command('netstat -ln | grep 0.0.0.0:443 | wc -l', false);
        let http = 'http://';
        if (https.output.trim() === '1') {
            http = 'https://';
        }
        // call the api
        const statusApi = http + target.host + '/api/status';
        const response = await (0, node_fetch_1.default)(statusApi, { signal: controller.signal });
        if (!response.ok) {
            throw new Error(`Fetch of ${statusApi} failed: ${response.status} ${response.statusText}`);
        }
        const json = await response.json();
        logger_1.logger.info('Status response');
        logger_1.logger.log(JSON.stringify(json, null, 4));
        // api call is ok, check the expected versions
        const expectedDependencies = packageJson.dependencies;
        // check onit version
        const expectedOnitVersion = expectedDependencies['@mitech/onit-next'];
        if (!(0, semver_1.satisfies)(json.version, expectedDependencies['@mitech/onit-next'])) {
            throw new Error(`@mitech/onit-next version match failed. Expected ${expectedOnitVersion}, found ${json.version}`);
        }
        // check components versions
        Object.keys(expectedDependencies).forEach(expectedDependency => {
            // this is not a component. I'ts the app itself. Check was performed before in other way.
            if (expectedDependency === '@mitech/onit-next')
                return;
            const expectedDependencyVersion = expectedDependencies[expectedDependency];
            const installedDependency = json.components.find((c) => {
                return c.npmPackageName === expectedDependency;
            });
            if (!installedDependency) {
                throw new Error(`${expectedDependency} not loaded`);
            }
            if (!(0, semver_1.satisfies)(installedDependency.version, expectedDependencyVersion)) {
                throw new Error(`${expectedDependency} version match failed. Expected ${expectedDependencyVersion}, found ${installedDependency.version}`);
            }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        if (error.name === 'AbortError') {
            throw new types_1.StringError('onitVersion check failed: Rest api call timeout');
        }
        else {
            throw new types_1.StringError('onitVersion check failed: ' + error.message);
        }
    }
    finally {
        clearTimeout(timeout);
    }
}
exports.default = onitVersion;
//# sourceMappingURL=onitVersion.js.map